import { useContext, useEffect, useState, useRef } from "react";
import { DbContext } from "../surreal";
import { RecordId } from "surrealdb";
import uploadFile from "../files/upload";
import TabGrid from "../components/TabGrid";
import { useParams } from "react-router-dom";

function Closet() {
  const [activeTab, setActiveTab] = useState("all");
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

  const [info, setInfo] = useState<
    undefined | { [x: string]: unknown; id: RecordId<string> }
  >();
  const [isUploading, setIsUploading] = useState(false);
  const [isBannerUploading, setIsBannerUploading] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const result = is_user_profile
          ? await db.info()
          : (
              (await db.query(
                `SELECT * FROM ONLY fn::search_by_username("${id}") LIMIT 1`,
              )) as unknown as [
                undefined | { [x: string]: unknown; id: RecordId<string> },
              ]
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

  const tabs = [
    { id: "all", label: "All" },
    { id: "tops", label: "Tops" },
    { id: "bottoms", label: "Bottoms" },
    { id: "dresses", label: "Dresses" },
    { id: "shoes", label: "Shoes" },
    { id: "accessories", label: "Accessories" },
  ];

  return (
    <div>
      <p className="text-4xl font-bold text-left font-poppins p-4">My Closet</p>
      <div
        className="w-full h-[50vh] relative flex flex-col items-center justify-center"
        style={{
          backgroundColor: "#FDCCE9",
          backgroundImage:
            typeof info.back_picture === "string" && info.back_picture !== ""
              ? `url(http://localhost:1234/${info.back_picture})`
              : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {is_user_profile && (
          <span
            className="absolute top-4 right-4 text-sm text-white px-2 py-1 cursor-pointer hover:underline transition-all duration-300 z-10"
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
                ? `url(http://localhost:1234/${info.profile_picture})`
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
        <p className="mt-2 text-xl font-semibold">
          {typeof info.username === "string" ? info.username : "Username"}
        </p>
        <div className="flex flex-row mt-4 space-x-6">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">
              {typeof info.followers === "number" ? info.followers : 0}
            </span>
            <span className="text-sm">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">
              {typeof info.following === "number" ? info.following : 0}
            </span>
            <span className="text-sm">Following</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">0</span>
            <span className="text-sm">MIXIS</span>
          </div>
          <div className="flex flex-col items-center">
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
