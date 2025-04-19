import { useContext, useEffect, useState } from "react";
import { DbContext } from "../surreal";
import { RecordId } from "surrealdb";

const MyCloset = () => {
  const db = useContext(DbContext);

  const [info, setInfo] = useState<
    undefined | { [x: string]: unknown; id: RecordId<string> }
  >();

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

  return (
    <div>
      <p className="text-4xl font-bold text-left font-poppins p-4">My Closet</p>
      <div
        className="w-full h-[50vh] relative flex flex-col items-center justify-center"
        style={{
          backgroundColor: "#FDCCE9",
          backgroundImage:
            info.back_picture && info.back_picture !== ""
              ? `url(${info.back_picture})`
              : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden"
          style={{
            backgroundImage: info.profile_picture
              ? `url(${info.profile_picture})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <p className="mt-2 text-xl font-semibold">
          {info.username || "Username"}
        </p>
        <div className="flex flex-row mt-4 space-x-6">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">{info.followers || 0}</span>
            <span className="text-sm">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">{info.following || 0}</span>
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
