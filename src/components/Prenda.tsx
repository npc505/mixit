import { useContext } from "react";
import { DbContext, Record } from "../surreal";
import { motion } from "framer-motion";

function Prenda({
  user,
  is_user_profile,
  item,
  onRemove,
  onChange,
}: {
  user: Record;
  is_user_profile: boolean;
  item: Record;
  onRemove?: (item: Record) => void;
  onChange?: (before: Record, after: Record) => void;
}) {
  const db = useContext(DbContext);

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
      {(is_user_profile || user.id === item.owner) && (
        <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleVisibility}
            className="text-black text-sm"
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
      {(is_user_profile || user.id === item.owner) && (
        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleRemove}
            className="text-black text-sm"
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
    </motion.div>
  );
}

export default Prenda;
