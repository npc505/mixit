import { useContext, useState } from "react";
import { DbContext, Record } from "../surreal";
import { motion, AnimatePresence } from "framer-motion";

function Prenda({
  item,
  onRemove,
  onChange,
}: {
  item: Record;
  onRemove?: (item: Record) => void;
  onChange?: (before: Record, after: Record) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
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
      className={`flex flex-shrink-0 mx-1 flex-row hover:bg-gray-100 rounded-md p-1 ${
        isExpanded ? "bg-gray-100" : ""
      }`}
    >
      <motion.img
        layoutId={`image-${item.id}`}
        src={
          item.image_url
            ? `${import.meta.env.VITE_IMG_SERVICE_URI}/${item.image_url}`
            : ""
        }
        onClick={() => setIsExpanded(!isExpanded)}
        alt="Clothing item"
        className="h-40 w-32 object-contain"
      />
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, width: 0 }}
            transition={{ duration: 0.5 }}
            className="ml-2 flex flex-col space-y-2 overflow-hidden"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRemove}
              className="bg-red-500 text-white px-2 py-1 rounded text-xs"
            >
              Remove
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleVisibility}
              className={`px-2 py-1 rounded text-xs ${
                item.public
                  ? "bg-green-500 text-white"
                  : "bg-gray-500 text-white"
              }`}
            >
              {item.public ? "Public" : "Private"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Prenda;
