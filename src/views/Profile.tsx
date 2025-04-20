import { useContext, useEffect, useState, useRef } from "react";
import { DbContext, Record } from "../surreal";
import uploadFile from "../files/upload";
import TabGrid from "../components/TabGrid";
import { useParams } from "react-router-dom";
import Button from "../components/Button";

function Closet() {
  const [activeTab, setActiveTab] = useState("all");
  const [imgColorKind, setImgColorKind] = useState("neutral");

  const db = useContext(DbContext);
  const profilePicture_fileInputRef = useRef<HTMLInputElement>(null);
  const bannerImage_fileInputRef = useRef<HTMLInputElement>(null);

  let is_user_profile = false;
  let { id } = useParams<{ id?: string }>();
  if (id === undefined) {
    id = "$auth.id";
    is_user_profile = true;
  }

  console.log(`Profile for ${id}`);

  const [info, setInfo] = useState<undefined | Record>();
  const [isUploading, setIsUploading] = useState(false);
  const [isBannerUploading, setIsBannerUploading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Gracias a https://dvmhn07.medium.com/learn-to-detect-image-background-colors-in-react-using-html-canvas-8c2d9e527e7d
  // Basicamente tomamos N pixeles al azar, vemos qué intensidad tiene y después, con el
  // promedio de las muestras determinamos si es obscuro o no
  useEffect(() => {
    const updateBannerText = async () => {
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

      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        try {
          const width = canvas.width;
          const height = canvas.height;
          // const totalPixels = width * height;
          // const numSamples = Math.floor(totalPixels * 0.4);
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
          // La vd no sé si está bien as
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

    updateBannerText();
  }, [info]);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const result = is_user_profile
          ? await db.info()
          : (
              (await db.query(
                `SELECT
                  *,
                  (
                      SELECT VALUE id
                        FROM ONLY $auth.id->follows
                      WHERE out = fn::search_by_username("${id}")
                      LIMIT 1
                  ) AS relation
                FROM ONLY fn::search_by_username("${id}")
              LIMIT 1`,
              )) as Record[]
            )[0];

        console.log(result);

        setInfo(result);
      } catch (error) {
        console.error("Failed to fetch info:", error);
      }
    };

    fetchInfo();
  }, [db, id, is_user_profile]);

  if (info === undefined) {
    return <div>Error getting user info, try to reload</div>;
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
        setInfo(updatedInfo);
      }
    } catch (error) {
      console.error("Error handling banner file change:", error);
    } finally {
      setIsBannerUploading(false);
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
      <canvas
        ref={canvasRef}
        width="1"
        height="1"
        style={{ display: "none" }}
      />
      {is_user_profile && (
        <p className="text-4xl font-bold text-left font-poppins p-4">
          My Closet
        </p>
      )}
      <div
        className="w-full h-[50vh] relative flex flex-col items-center justify-center"
        style={{
          backgroundColor: "#FDCCE9",
          backgroundImage:
            typeof info.back_picture === "string" && info.back_picture !== ""
              ? `url(${import.meta.env.VITE_IMG_SERVICE_URI}/${info.back_picture})`
              : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {is_user_profile && (
          <span
            className={`absolute top-4 right-4 text-sm ${textColor} px-2 py-1 cursor-pointer hover:underline transition-all duration-300 z-10`}
            onClick={handleBannerPictureClick}
          >
            Edit
          </span>
        )}
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
          className={`w-24 h-24 rounded-full bg-gray-200 overflow-hidden ${is_user_profile ? "cursor-pointer" : ""} group relative`}
          style={{
            // TODO: use an env var or something
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
        <p className={`mt-2 text-xl font-semibold ${textColor}`}>
          {typeof info.username === "string" ? info.username : "Username"}
        </p>
        <div className={is_user_profile ? "invisible" : "visible"}>
          <Button
            onClick={handleFollow}
            label={info.relation === undefined ? "Follow" : "Following"}
            isActive={true}
          />
        </div>
        <div className="flex flex-row mt-4 space-x-6">
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
