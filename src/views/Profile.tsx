import { useContext, useEffect, useState, useRef } from "react";
import { DbContext } from "../surreal";
import { RecordId } from "surrealdb";
import uploadFile from "../files/upload";

const MyCloset = () => {
  const db = useContext(DbContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [info, setInfo] = useState<
    undefined | { [x: string]: unknown; id: RecordId<string> }
  >();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const result = await db.info();
        setInfo(result);
      } catch (error) {
        console.error("Failed to fetch info:", error);
      }
    };

    fetchInfo();
  }, [db]);

  if (info === undefined) {
    return <div>Error getting user info, try to reload</div>;
  }
  const handleProfilePictureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

  return (
    <div>
      <p className="text-4xl font-bold text-left font-poppins p-4">My Closet</p>
      <div
        className="w-full h-[50vh] relative flex flex-col items-center justify-center"
        style={{
          backgroundColor: "#FDCCE9",
          backgroundImage:
            typeof info.back_picture === "string" && info.back_picture !== ""
              ? `url(${info.back_picture})`
              : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden cursor-pointer"
          style={{
            // TODO: use and env var or something
            backgroundImage:
              typeof info.profile_picture === "string"
                ? `url(http://localhost:1234/${info.profile_picture})`
                : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          onClick={handleProfilePictureClick}
        >
          {isUploading && (
            <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-50">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
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
    </div>
  );
};

export default MyCloset;
