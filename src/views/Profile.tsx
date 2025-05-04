import { useContext, useEffect, useState, useRef } from "react";
import { DbContext, Record } from "../surreal";
import uploadFile from "../files/upload";
import TabGrid from "../components/TabGrid";
import { useParams } from "react-router-dom";
import Button from "../components/Button";

function Closet() {
  const [activeTab, setActiveTab] = useState("all");
  const [imgColorKind, setImgColorKind] = useState("neutral");
  const [is_user_profile, setIsUserProfile] = useState(false);

  const db = useContext(DbContext);
  const profilePicture_fileInputRef = useRef<HTMLInputElement>(null);
  const bannerImage_fileInputRef = useRef<HTMLInputElement>(null);

  const { id: paramId } = useParams<{ id?: string }>();
  const id = paramId === undefined ? "$auth.username" : paramId;

  // We only set the state via a useEffect to avoid infinite re-renders
  useEffect(() => {
    if (paramId === undefined) {
      setIsUserProfile(true);
    }
  }, [paramId]);

  console.log(`Profile for ${id}`);

  const [info, setInfo] = useState<undefined | Record>();
  const [isUploading, setIsUploading] = useState(false);
  const [isBannerUploading, setIsBannerUploading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Gracias a https://dvmhn07.medium.com/learn-to-detect-image-background-colors-in-react-using-html-canvas-8c2d9e527e7d
  // Basicamente tomamos N pixeles al azar, vemos qué intensidad tiene y después, con el
  // promedio de las muestras determinamos si es obscuro o no
  useEffect(() => {
    const updateBannerImage = async () => {
      const canvas = canvasRef.current;
      if (info === undefined || !canvas || !info.back_picture) {
        return;
      }

      console.log("Starting");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Failed to get canvas context");
        return;
      }

      const image = new Image();
      image.crossOrigin = "Anonymous";
      image.src = `${import.meta.env.VITE_IMG_SERVICE_URI}/${info.back_picture}`;

      // Gracias a Karlita por la lógica para que no se distorsione la imagen
      image.onload = () => {
        // Set canvas dimensions to match the container
        const containerEl = canvas.parentElement;
        if (containerEl) {
          canvas.width = containerEl.clientWidth;
          canvas.height = containerEl.clientHeight;
        } else {
          canvas.width = image.width;
          canvas.height = image.height;
        }

        // Calculate dimensions to maintain aspect ratio
        const containerWidth = canvas.width;
        const containerHeight = canvas.height;
        const imageAspectRatio = image.width / image.height;
        const containerAspectRatio = containerWidth / containerHeight;

        let drawWidth,
          drawHeight,
          offsetX = 0,
          offsetY = 0;

        if (imageAspectRatio > containerAspectRatio) {
          // Image is wider than container (relative to height)
          drawHeight = containerHeight;
          drawWidth = drawHeight * imageAspectRatio;
          offsetX = (containerWidth - drawWidth) / 2;
        } else {
          // Image is taller than container (relative to width)
          drawWidth = containerWidth;
          drawHeight = drawWidth / imageAspectRatio;
          offsetY = (containerHeight - drawHeight) / 2;
        }

        // Clear canvas before drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the image with proper aspect ratio
        ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

        setIsBannerUploading(false);

        try {
          const width = canvas.width;
          const height = canvas.height;
          const numSamples = 100;

          let totalRed = 0,
            totalGreen = 0,
            totalBlue = 0;

          console.log(width, height);

          for (let i = 0; i < numSamples; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);

            const pixelData = ctx.getImageData(x, y, 1, 1).data;
            const [red, green, blue] = pixelData;

            totalRed += red;
            totalGreen += green;
            totalBlue += blue;
          }

          const avgRed = totalRed / numSamples;
          const avgGreen = totalGreen / numSamples;
          const avgBlue = totalBlue / numSamples;

          console.log("Average RGB:", avgRed, avgGreen, avgBlue);

          const percent = (avgRed + avgGreen + avgBlue) / (255 * 3);
          if (percent < 0.5) {
            console.log("Image is dark");
            setImgColorKind("dark");
          } else {
            setImgColorKind("neutral");
          }
        } catch (error) {
          console.error("Error analyzing image colors:", error);
        }
      };

      image.onerror = (err) => {
        console.error("Error loading image:", err);
      };
    };

    updateBannerImage();
  }, [info]);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const result = is_user_profile
          ? await db.info()
          : (
              (await db.query(
                `
LET $id = IF (RETURN type::thing("usuario", "${id}") FETCH usuario) != NONE {
    type::thing("usuario", "${id}")
} ELSE {
    fn::search_by_username("${id}")
};

SELECT
    *,
    (
        SELECT VALUE id
          FROM ONLY $auth.id->follows
        WHERE out = $id
        LIMIT 1
    ) AS relation,
    $auth.id == $id AS is_self
  FROM ONLY $id
LIMIT 1`,
              )) as Record[]
            )[1];

        console.log(result);

        if (result !== undefined) {
          if (result.is_self === true) {
            setIsUserProfile(true);
          }

          setInfo(result);
          console.log("Fetched info");
        }
      } catch (error) {
        console.error("Failed to fetch info:", error);
      }
    };

    if (info !== undefined) {
      return;
    }

    fetchInfo();
  }, [info, db, id, is_user_profile]);

  if (info === undefined) {
    return null;
  }

  const handleProfilePictureClick = () => {
    if (profilePicture_fileInputRef.current && is_user_profile) {
      profilePicture_fileInputRef.current.click();
    }
  };

  const handleBannerPictureClick = () => {
    if (bannerImage_fileInputRef.current && is_user_profile) {
      bannerImage_fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    while (isUploading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setIsUploading(true);

    try {
      const uploadedHash = await uploadFile(file);

      if (uploadedHash) {
        await db.query(
          `UPDATE $auth.id SET profile_picture = "${uploadedHash}"`,
        );
        const updatedInfo = {
          ...info,
          profile_picture: uploadedHash,
        };
        setInfo(updatedInfo);
      }
    } catch (error) {
      console.error("Error handling file change:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBannerFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    while (isBannerUploading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setIsBannerUploading(true);

    try {
      const uploadedHash = await uploadFile(file);

      if (uploadedHash) {
        await db.query(`UPDATE $auth.id SET back_picture = "${uploadedHash}"`);
        const updatedInfo = {
          ...info,
          back_picture: uploadedHash,
        };

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
        setInfo(updatedInfo);
      }
    } catch (error) {
      console.error("Error handling banner file change:", error);
    } finally {
      // setIsBannerUploading(false);
    }
  };

  const textColor = imgColorKind === "dark" ? "text-white" : "text-black";

  const handleFollow = async () => {
    try {
      if (info.relation === undefined) {
        const [res] = (await db.query(
          `SELECT * FROM ONLY fn::follow(fn::search_by_username("${id}")) LIMIT 1;`,
        )) as Record[];

        if (res !== undefined && res !== null) {
          const updatedInfo = {
            ...info,
            relation: res.id,
            followers:
              (typeof info.followers === "number" ? info.followers : 0) + 1,
          };
          setInfo(updatedInfo);
        }
      } else {
        await db.query(
          `SELECT * FROM ONLY fn::unfollow(fn::search_by_username("${id}")) LIMIT 1;`,
        );
        const updatedInfo = {
          ...info,
          relation: undefined,
          followers: Math.max(
            0,
            (typeof info.followers === "number" ? info.followers : 0) - 1,
          ),
        };
        setInfo(updatedInfo);
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "top", label: "Tops" },
    { id: "bot", label: "Bottoms" },
    { id: "full", label: "Dresses" },
    { id: "foot", label: "Shoes" },
    { id: "bag", label: "Bags" },
    { id: "accessory", label: "Accessories" },
  ];

  return (
    <div>
      {is_user_profile && (
        <p className="text-4xl font-bold text-left font-poppins p-4">
          My Closet
        </p>
      )}
      <div
        className="w-full h-[50vh] relative flex flex-col items-center justify-center"
        style={{
          backgroundColor: "#FDCCE9",
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        />
        {is_user_profile && (
          <div className="flex flex-col">
            <span
              className={`absolute top-4 right-4 text-xs ${textColor} px-2 py-1 cursor-pointer hover:underline transition-all duration-300 z-10`}
              onClick={handleBannerPictureClick}
            >
              Edit
            </span>
            <span
              className={`absolute top-10 right-4 text-xs ${textColor} px-2 py-1 cursor-pointer hover:underline transition-all duration-300 z-10`}
              onClick={() => {
                document.cookie =
                  "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.href = "/";
              }}
            >
              Log Out
            </span>
          </div>
        )}
        <div
          className={`absolute bottom-4 right-4 text-xs ${textColor} px-2 py-1 z-10 flex items-center gap-2`}
        >
          <span>{String(info.id?.id)}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cursor-pointer hover:opacity-70"
            onClick={() => navigator.clipboard.writeText(String(info.id?.id))}
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </div>
        {isBannerUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
        <input
          type="file"
          ref={bannerImage_fileInputRef}
          onChange={handleBannerFileChange}
          style={{ display: "none" }}
          accept="image/*"
        />
        <div
          className={`w-24 h-24 rounded-full bg-gray-200 overflow-hidden ${is_user_profile ? "cursor-pointer" : ""} group relative z-10`}
          style={{
            backgroundImage:
              typeof info.profile_picture === "string"
                ? `url(${import.meta.env.VITE_IMG_SERVICE_URI}/${info.profile_picture})`
                : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          onClick={handleProfilePictureClick}
        >
          {is_user_profile && (
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 flex items-center justify-center transition-opacity duration-300">
              <span className="text-white font-medium border border-black">
                Upload
              </span>
            </div>
          )}
          {isUploading && (
            <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-50">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={profilePicture_fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept="image/*"
        />
        <div
          className={`mt-2 text-xl font-semibold ${textColor} z-10 relative`}
        >
          {is_user_profile ? (
            <input
              type="text"
              value={
                typeof info.username === "string" ? info.username : "Username"
              }
              className={`bg-transparent text-center outline-none border-b ${
                info.error
                  ? "border-red-500"
                  : "border-transparent hover:border-current focus:border-current"
              }`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              onChange={(e) => {
                const newUsername = e.target.value;
                const updatedInfo = { ...info, username: newUsername };
                setInfo(updatedInfo);
              }}
              onBlur={async (e) => {
                const newUsername = e.target.value;
                try {
                  await db.query(
                    `UPDATE $auth.id SET username = "${newUsername}"`,
                  );
                  if (paramId !== undefined && paramId !== info.id.id) {
                    window.history.replaceState(
                      null,
                      "",
                      `/closet/${newUsername}`,
                    );
                  }
                  setInfo((prev) => ({ ...prev, error: false }));
                } catch (error) {
                  setInfo((prev) => ({ ...prev, error: true }));
                }
              }}
            />
          ) : (
            <p>
              {typeof info.username === "string" ? info.username : "Username"}
            </p>
          )}
        </div>
        <div className={`${is_user_profile ? "invisible" : "visible"} z-10`}>
          <Button
            onClick={handleFollow}
            label={info.relation === undefined ? "Follow" : "Following"}
            isActive={true}
          />
        </div>
        <div className="flex flex-row mt-4 space-x-6 z-10">
          <div className={`flex flex-col items-center ${textColor}`}>
            <span className="text-xl font-bold">
              {typeof info.followers === "number" ? info.followers : 0}
            </span>
            <span className="text-sm">Followers</span>
          </div>
          <div className={`flex flex-col items-center ${textColor}`}>
            <span className="text-xl font-bold">
              {typeof info.following === "number" ? info.following : 0}
            </span>
            <span className="text-sm">Following</span>
          </div>
          <div className={`flex flex-col items-center ${textColor}`}>
            <span className="text-xl font-bold">0</span>
            <span className="text-sm">MIXIS</span>
          </div>
          <div className={`flex flex-col items-center ${textColor}`}>
            <span className="text-xl font-bold">0</span>
            <span className="text-sm">In Hooks</span>
          </div>
        </div>
      </div>
      <div className="p-4 pt-10">
        <TabGrid
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  );
}

export default Closet;
