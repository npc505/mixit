import { useContext, useState } from "react";
import { DbContext } from "../surreal";
import uploadFile from "../files/upload";
import Button from "../components/Button";
import PrivacyToggle from "../components/PrivacyToggle";
import { useNavigate } from "react-router-dom";

function Upload() {
  const db = useContext(DbContext);
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<
    "top" | "bot" | "full" | "foot" | "bag" | "accessory"
  >("top");
  const [isPrivate, setIsPrivate] = useState(true);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const uploadedHash = await uploadFile(file, true);

      if (uploadedHash) {
        setUploadedImage(uploadedHash);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePrivacyChange = (newIsPrivate: boolean) => {
    setIsPrivate(newIsPrivate);
  };

  const handleSave = async () => {
    if (!uploadedImage) return;

    try {
      await db.query(
        `SELECT * FROM fn::create_prenda("${uploadedImage}", "${selectedType}", ${!isPrivate});`,
      );

      // Reset state after successful save
      setUploadedImage(null);
      navigate(-1);
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow h-full min-h-[calc(100vh-130px)] relative">
      <div className="absolute top-0 left-0 p-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="absolute top-0 right-0 p-4">
        <PrivacyToggle isPrivate={isPrivate} onChange={handlePrivacyChange} />
      </div>

      {uploadedImage ? (
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-64 h-64 rounded-lg overflow-hidden"
            style={{
              backgroundImage: `url(${import.meta.env.VITE_IMG_SERVICE_URI}/${uploadedImage})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center gap-2 w-full">
              <label className="font-medium">Type:</label>
              <select
                value={selectedType}
                onChange={(e) =>
                  setSelectedType(
                    e.target.value as
                      | "top"
                      | "bot"
                      | "full"
                      | "foot"
                      | "bag"
                      | "accessory",
                  )
                }
                className="flex-grow px-3 py-1 rounded-full bg-white border-2 border-black focus:outline-none"
              >
                <option value="top">Top</option>
                <option value="bot">Bottom</option>
                <option value="full">Dress</option>
                <option value="foot">Shoes</option>
                <option value="bag">Bag</option>
                <option value="accessory">Accessory</option>
              </select>
            </div>

            <div className="flex gap-4">
              <Button
                label="Descartar"
                isActive={false}
                onClick={() => setUploadedImage(null)}
              />
              <Button label="Guardar" isActive={true} onClick={handleSave} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <label
            className="w-64 h-48 flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-500"
                  >
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                    <circle cx="12" cy="13" r="3"></circle>
                  </svg>
                  <span className="text-gray-500 font-medium">
                    Elegir prenda
                  </span>
                </>
              )}
            </div>
          </label>
          <input
            id="fileInput"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
}

export default Upload;
