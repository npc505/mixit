use std::{path::PathBuf, process::ExitCode};

use axum::{
    body::Bytes,
    debug_handler,
    extract::{DefaultBodyLimit, Multipart, Query, State},
    http::{header, HeaderValue, Method, StatusCode},
    middleware,
    routing::put,
    Json,
};
use rmbg::Rmbg;
use tokio::io::AsyncWriteExt;
use tower_http::cors::CorsLayer;

#[derive(Clone)]
struct ServiceState {
    inner: std::sync::Arc<ServiceInner>,
}

impl std::ops::Deref for ServiceState {
    type Target = ServiceInner;

    fn deref(&self) -> &Self::Target {
        self.inner.as_ref()
    }
}

struct ServiceInner {
    db_path: PathBuf,
    rmbg: Rmbg,
}

impl ServiceState {
    /// Returns Ok(()) if the path exists and its a directory. If the path does
    /// not exist, the function creates a directory in said path.
    ///
    /// # Errors
    ///
    /// This function will return an error if there is an error creating the directory
    /// or if the path already exists and it is not a directory.
    pub fn assert_dir_exists(db: PathBuf) -> Result<PathBuf, Error> {
        if (db.exists() && db.is_dir()) || !db.exists() {
            if !db.exists() {
                if let Err(e) = std::fs::create_dir(db.as_path()) {
                    return Err(Error::CreateDir(db, e));
                };
            }

            Ok(db)
        } else {
            Err(Error::ExistingPath(db))
        }
    }

    pub fn assert_model_exists(model: PathBuf) -> Result<PathBuf, Error> {
        if (model.exists() && model.is_file()) || !model.exists() {
            Ok(model)
        } else {
            Err(Error::NonExistingPath(model))
        }
    }

    pub fn new(db: PathBuf, rmbg: Rmbg) -> Self {
        Self {
            inner: std::sync::Arc::new(ServiceInner { db_path: db, rmbg }),
        }
    }
}

#[derive(Debug)]
enum Error {
    MissingDbToken,
    MissingModelToken,
    ExistingPath(PathBuf),
    NonExistingPath(PathBuf),
    CreateDir(PathBuf, std::io::Error),
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Error::MissingDbToken => {
                write!(f, "Failed to read env var `DB_DIR`")
            }
            Error::MissingModelToken => {
                write!(f, "Failed to read env var `MODEL`")
            }
            Error::ExistingPath(path) => {
                write!(
                    f,
                    "There was an error with the existing path {}. E.g. It is not a directory",
                    path.display()
                )
            }
            Error::NonExistingPath(path) => {
                write!(
                    f,
                    "There was an error with the non-existing path {}.",
                    path.display()
                )
            }
            Error::CreateDir(db, err) => {
                write!(
                    f,
                    "Error while creating db in path {} with error {}",
                    db.display(),
                    err
                )
            }
        }
    }
}

#[tokio::main]
async fn app() -> Result<(), Error> {
    dotenv::dotenv().ok();
    env_logger::init();

    let cors = CorsLayer::new()
        .allow_origin("http://localhost:5173".parse::<HeaderValue>().unwrap())
        .allow_methods([Method::POST, Method::PATCH, Method::GET]);

    let db = if let Ok(var) = std::env::var("DB_DIR") {
        log::info!("Read DB_DIR with value {var:?}");
        var.trim_end_matches('/').into()
    } else {
        return Err(Error::MissingDbToken);
    };

    let model = if let Ok(var) = std::env::var("MODEL") {
        log::info!("Read MODEL with value {var:?}");
        var.into()
    } else {
        return Err(Error::MissingModelToken);
    };

    let state = ServiceState::new(
        ServiceState::assert_dir_exists(db)?,
        Rmbg::new(ServiceState::assert_model_exists(model)?).expect("Invalid onnx model"),
    );

    let limit = std::env::var("IMG_LIMIT")
        .map(|v| {
            log::info!("Read IMG_LIMIT with value {v:?}");
            if v.to_lowercase().trim() == "none" {
                Some(usize::MAX)
            } else {
                v.parse::<usize>().ok()
            }
        })
        .unwrap_or_default()
        .unwrap_or(10 * 1000000);

    log::info!("DefaultBodyLimit set to {limit} B ({} MB)", limit / 1000000);

    let uploader = axum::Router::new()
        .route("/new", put(save_img).post(save_img).patch(save_img))
        .layer(DefaultBodyLimit::max(limit));

    let downloader = axum::Router::new()
        .fallback_service(
            tower::ServiceBuilder::new()
                .layer(middleware::from_fn(async |req, next: middleware::Next| {
                    let mut response = next.run(req).await;
                    let now = jiff::Timestamp::now() + jiff::SignedDuration::from_hours(24 * 7);

                    response.headers_mut().insert(
                        header::EXPIRES,
                        HeaderValue::from_str(
                            &now.strftime("%a, %d %b %Y %H:%M:%S GMT").to_string(),
                        )
                        .unwrap(),
                    );
                    response
                }))
                .service(tower_http::services::ServeDir::new(state.db_path.as_path())),
        )
        .layer(tower_http::compression::CompressionLayer::new());

    let router = axum::Router::new()
        .merge(uploader)
        .merge(downloader)
        .layer(cors)
        .with_state(state);

    let tcpl = tokio::net::TcpListener::bind("[::]:1234").await.unwrap();
    axum::serve(tcpl, router).await.unwrap();

    Ok(())
}

#[derive(serde::Serialize)]
struct UploadResponse {
    hashes: Vec<String>,
}

#[derive(serde::Deserialize)]
struct UploadRequest {
    #[serde(default)]
    rmbg: bool,
}

#[debug_handler]
async fn save_img(
    Query(UploadRequest { rmbg }): Query<UploadRequest>,
    State(state): State<ServiceState>,
    mut mp: Multipart,
) -> Result<Json<UploadResponse>, StatusCode> {
    use sha2::{Digest, Sha256};
    use tokio::fs;

    let mut saved: Vec<String> = vec![];
    let mut hashes: Vec<String> = vec![];
    let mut bytes: Vec<Bytes> = vec![];

    while let Some(field) = mp.next_field().await.unwrap() {
        let name = field.name().unwrap().to_string();
        let mime_type = field.content_type().unwrap_or("application/octet-stream");
        if !mime_type.starts_with("image/") {
            return Err(StatusCode::BAD_REQUEST);
        }

        let data = field.bytes().await.unwrap();
        let img = match image::load_from_memory(&data) {
            Err(err) => {
                log::debug!("Not saving {name}: {err}");
                return Err(StatusCode::BAD_REQUEST);
            }
            Ok(img) => img,
        };

        let img = if rmbg {
            state
                .rmbg
                .remove_background(&img)
                .expect("failed to remove background")
        } else {
            img
        };

        let mut data = Vec::new();
        let mut cursor = std::io::Cursor::new(&mut data);

        img.write_to(&mut cursor, image::ImageFormat::Png)
            .expect("failed to encode image");

        let mut hasher = Sha256::new();

        hasher.update(&data);

        let h = hasher.finalize();
        let h = base16ct::lower::encode_string(&h);

        hashes.push(h);
        saved.push(name);
        bytes.push(data.into());
    }

    for (hash, bytes) in hashes.iter().zip(bytes) {
        let new_file_path = state.db_path.join(hash);
        match fs::try_exists(&new_file_path).await {
            Ok(true) => continue,
            Ok(false) => {}
            Err(e) => {
                println!("Error: {:?}", e);
                return Err(StatusCode::INTERNAL_SERVER_ERROR);
            }
        }

        let mut file = fs::OpenOptions::new()
            .write(true)
            .create(true)
            .truncate(true)
            .read(false)
            .open(&new_file_path)
            .await
            .map_err(|e| {
                println!("Error: {:?}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        file.write_all(bytes.as_ref()).await.map_err(|e| {
            println!("Error: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

        log::info!(
            "New {hash:?} of size {} B ({} MB)",
            bytes.len(),
            bytes.len() / 1000000,
        );
    }

    Ok(Json(UploadResponse { hashes }))
}

fn main() -> ExitCode {
    match app() {
        Err(e) => {
            eprintln!("Error: {e}.");
            ExitCode::FAILURE
        }
        Ok(()) => ExitCode::SUCCESS,
    }
}
