copy-db:
    echo -e "BEGIN;\nUSE NS mixit DB mixit;\n\n$(cat db/migrations/*)\n\nCOMMIT;" | wl-copy

start-service:
    mkdir --parents /tmp/db
    cd img-service && env DB_DIR="/tmp/db/" RUST_LOG="info" cargo run --release
