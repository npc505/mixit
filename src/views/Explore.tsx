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
    const fetchItemsForTab = async () => {
      // Ensure we have a DB connection and auth info before fetching
      if (!db || !auth?.id) {
        console.warn("DB or auth.id not available, skipping fetch.");
        setIsLoading(false); // Ensure loading state is false if we skip
        return;
      }

      setIsLoading(true);
      setError(undefined);
      setPrendaItems([]); // Clear previous results when starting a new fetch

      // Define queries that will be reused
      const followingQuery = `
        SELECT VALUE array::flatten(uploaded->sube->prenda)
        FROM ONLY (
          SELECT array::distinct(array::flatten(
              array::filter(array::concat(
                  next.id, -- For the users we follow
                  array::flatten(next.next.id), -- And those they follow
                  -- array::flatten(array::flatten(next.next.next.id)), -- And those they follow
              ), |$v| $v != type::thing('usuario', '${auth.id.id}')
          ))) AS uploaded FROM ONLY type::thing('usuario', '${auth.id.id}').{..3}.{
              id,
              sube: <->sube->prenda,
              next: <->follows<->usuario.@,
          } -- FETCH uploaded.prenda
        ) FETCH prenda;
      `;

      // Keep the example "For You" query for now
      const forYouQuery = `
        SELECT * FROM prenda WHERE owner != type::thing('usuario', '${auth.id.id}') LIMIT 100
      `;

      try {
        let result: Record[] = [];

        // Determine which query/queries to run based on the active tab
        switch (activeTab) {
          case "all":
            console.log(
              "Fetching for 'All' tab (combining Following and For You)",
            );
            let followingItems: Record[] = [];
            let forYouItems: Record[] = [];

            // Fetch Following Items
            try {
              const followingQueryResult = (
                (await db.query(followingQuery)) as Record[][]
              )[0];
              if (followingQueryResult && Array.isArray(followingQueryResult)) {
                followingItems = followingQueryResult;
              } else {
                console.warn(
                  "Following query returned unexpected format for 'All':",
                  followingQueryResult,
                );
                // Don't set error here, just warn and continue fetching For You
              }
            } catch (err) {
              console.warn(
                "Error fetching Following items for 'All' tab:",
                err,
              );
              // Don't set error here, just warn and continue fetching For You
            }

            // Fetch For You Items
            try {
              const forYouQueryResult = (
                (await db.query(forYouQuery)) as Record[][]
              )[0];
              if (forYouQueryResult && Array.isArray(forYouQueryResult)) {
                forYouItems = forYouQueryResult;
              } else {
                console.warn(
                  "'For You' query returned unexpected format for 'All':",
                  forYouQueryResult,
                );
                // Don't set error here, just warn
              }
            } catch (err) {
              console.warn(
                "Error fetching 'For You' items for 'All' tab:",
                err,
              );
              // Don't set error here, just warn
            }

            // Combine and unique the results
            const combinedItems = [...followingItems, ...forYouItems];
            result = combinedItems.filter(
              (item, index, self) =>
                index ===
                self.findIndex(
                  (t) =>
                    // Ensure item.id exists and is a RecordId before accessing .id
                    t.id &&
                    item.id &&
                    typeof t.id === "object" &&
                    typeof item.id === "object" &&
                    t.id.id === item.id.id,
                ),
            );

            console.log("Combined and unique items for 'All':", result);
            break; // End of 'all' case

          case "following":
            console.log("Fetching for 'Following' tab");
            const followingResult = (
              (await db.query(followingQuery)) as Record[][]
            )[0];
            setIsLoading(false);
            if (followingResult && Array.isArray(followingResult)) {
              result = followingResult;
            } else {
              console.error(
                "Following query returned an unexpected format:",
                followingResult,
              );
              setError("Received unexpected data format for following.");
            }
            break; // End of 'following' case

          case "forYou":
            console.log("Fetching for 'For You' tab");
            const forYouResult = (
              (await db.query(forYouQuery)) as Record[][]
            )[0];
            setIsLoading(false);
            if (forYouResult && Array.isArray(forYouResult)) {
              result = forYouResult;
            } else {
              console.error(
                "'For You' query returned an unexpected format:",
                forYouResult,
              );
              setError("Received unexpected data format for 'For You'.");
            }
            break; // End of 'forYou' case

          default:
            console.warn("Unknown active tab:", activeTab);
            setIsLoading(false);
            return; // Exit early for unknown tab
        }

        // If no fatal error occurred and we have a valid result array (could be empty)
        if (!error) {
          setPrendaItems(result);
        }
      } catch (err) {
        // This catch block handles errors not caught within the individual query try/catch blocks in 'all'
        console.error(
          `Error during fetch process for tab '${activeTab}':`,
          err,
        );
        setError("An error occurred while fetching items.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemsForTab();
  }, [activeTab, db, auth]); // Rerun effect when activeTab, db, or auth changes

  return (
    <div>
      <p className="text-4xl font-bold text-left font-poppins p-4">Explore</p>
      <TabGrid tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Render items regardless of the active tab */}
      {/* The content depends on the state (prendaItems, isLoading, error) */}
      <div className="p-4">
        {error && <p className="text-red-500">Error: {error}</p>}
        {!error && (
          <>
            {isLoading ? (
              // Show loading spinner centered within the content area
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : prendaItems.length === 0 ? (
              // Show empty state if no items
              // Using a black spinner for now, similar to the original code's empty state
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
              </div>
            ) : (
              // Or a text message: <p>No items found.</p>
              // Show items if loaded and not empty
              <div className="flex overflow-x-auto p-4 space-x-4">
                {" "}
                {/* Added space-x-4 for spacing */}
                {prendaItems.map((item) =>
                  // Use item.id?.id for key with a fallback string if id or id.id is missing
                  // Only render if item has a valid looking id
                  item.id && typeof item.id === "object" && item.id.id ? (
                    <div key={item.id.id}>
                      {/* Assuming item.id is a RecordId and item.id.id is the string ID */}
                      <Prenda item={item} />
                    </div>
                  ) : (
                    // Optional: Render nothing or a placeholder for invalid items
                    (console.warn("Skipping item with invalid id:", item), null)
                  ),
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
