import { useContext, useState, useEffect } from "react";
import TabGrid from "../components/TabGrid";
import Prenda from "../components/Prenda"; // Assuming Prenda component exists
import { DbContext, Record } from "../surreal";

const Explore = () => {
  const { db, auth } = useContext(DbContext);
  const [activeTab, setActiveTab] = useState("all");
  const [prendaItems, setPrendaItems] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const tabs = [
    { id: "all", label: "All" },
    { id: "forYou", label: "For You" },
    { id: "following", label: "Following" },
  ];

  useEffect(() => {
    const fetchFollowingItems = async () => {
      if (activeTab === "following" && db) {
        setIsLoading(true);
        setError(undefined);
        setPrendaItems([]); // Clear previous results

        try {
          const result = (
            (await db.query(`
            SELECT VALUE uploaded
            FROM ONLY (
              SELECT ->follows->usuario->sube->prenda.* AS uploaded
              FROM ONLY $auth.id
              FETCH uploaded
            )
          `)) as Record[][]
          )[0]; // Pass auth ID if needed by $auth.id

          console.log(result);

          if (result && result.length > 0) {
            setPrendaItems(result); // Handle potential null/undefined result
          } else {
            console.error("Query failed or returned empty:", result);
          }
        } catch (err) {
          console.error("Error fetching following items:", err);
          setError("An error occurred while fetching items.");
        } finally {
          setIsLoading(false);
        }
      } else {
        // Clear items when switching away from the following tab
        setPrendaItems([]);
        setError(undefined);
        setIsLoading(false);
      }
    };

    fetchFollowingItems();
  }, [activeTab, db, auth]); // Rerun effect when activeTab or db/auth changes

  return (
    <div>
      <p className="text-4xl font-bold text-left font-poppins p-4">Explore</p>
      <TabGrid tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Render items when the 'following' tab is active */}
      {activeTab === "following" && (
        <div className="p-4">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!isLoading && !error && prendaItems.length === 0 && (
            <p>No items found from users you are following.</p>
          )}
          {!isLoading &&
            auth !== undefined &&
            error === undefined &&
            prendaItems.length > 0 && (
              <div className="flex overflow-x-auto p-4">
                {prendaItems.map((item) => (
                  <div key={item.id.id}>
                    <Prenda item={item} />
                  </div>
                ))}
              </div>
            )}
        </div>
      )}

      {/* Potentially add rendering logic for other tabs here later */}
      {/* For now, only 'following' shows content below the TabGrid */}
    </div>
  );
};

export default Explore;
