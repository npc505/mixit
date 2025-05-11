import { useContext, useState, useEffect } from "react";
import { DbContext, Record } from "../surreal";
import { motion } from "framer-motion";
import { RecordId } from "surrealdb";

function Prenda({
  auth,
  user,
  is_wished_item,
  item,
  onRemove,
  onChange,
}: {
  auth: Record;
  user: Record;
  is_wished_item?: boolean;
  item: Record & { owner: RecordId<string> };
  onRemove?: (item: Record) => void;
  onChange?: (before: Record, after: Record) => void;
}) {
  const db = useContext(DbContext);
  const [isWished, setIsWished] = useState(is_wished_item ?? false);

  useEffect(() => {
    const checkWishStatus = async () => {
      if (!db || !item || !item.id || !user || !user.id) return;
      try {
        const result = await db.query(
          `SELECT id FROM ${auth.id}->wishes WHERE out = ${item.id} LIMIT 1`,
        );
        const wishedRelations = result?.[0] as any[] | undefined;
        setIsWished(wishedRelations && wishedRelations.length > 0);
      } catch (error) {
        console.error("Error checking wish status:", error);
      }
    };

    checkWishStatus();
  }, [db, item?.id, user?.id]); // Re-run effect if item or user changes

  const handleRemove = async () => {
    try {
      await db.query(`DELETE ${item.id}`);
      if (onRemove !== undefined) {
        onRemove(item);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      await db.query(`UPDATE ${item.id} SET public = ${!item.public}`);
      if (onChange !== undefined) {
        onChange(item, { ...item, public: !item.public });
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
    }
  };

  const handleToggleWish = async () => {
    if (!db || !item || !item.id) return;
    try {
      if (isWished) {
        await db.query(`fn::unwish(${item.id})`);
        setIsWished(false);
        console.log("Unwished item:", item.id);
      } else {
        await db.query(`fn::wish(${item.id})`);
        setIsWished(true);
        console.log("Wished item:", item.id);
      }
    } catch (error) {
      console.error("Error toggling wish status:", error);
    }
  };

  console.log(item);

  return (
    <motion.div
      layout
      className="relative flex flex-shrink-0 mx-1 flex-row hover:bg-gray-50 rounded-md p-1 group"
    >
      <motion.img
        src={
          item.image_url
            ? `${import.meta.env.VITE_IMG_SERVICE_URI}/${item.image_url}`
            : ""
        }
        alt="Clothing item"
        className="h-40 w-32 object-contain"
      />
      {auth.id.id === item.owner.id && (
        <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleVisibility}
            className="text-black text-sm cursor-pointer"
            title={item.public ? "Make item private" : "Make item public"}
          >
            {item.public ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            )}
          </motion.button>
        </div>
      )}
      {auth.id.id === item.owner.id && (
        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleRemove}
            className="text-black text-sm cursor-pointer"
            title="Remove item"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </motion.button>
        </div>
      )}
      {auth.id.id !== item.owner.id && (
        <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleWish}
            className="text-black text-sm cursor-pointer" // Changed to black
            title={isWished ? "Remove from wishlist" : "Add to wishlist"} // Dynamic title
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              // Fill based on state, stroke for outline
              fill={isWished ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-heart"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

export default Prenda;
