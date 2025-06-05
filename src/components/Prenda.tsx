import { useContext, useState, useEffect } from "react";
import { DbContext, Record } from "../surreal";
import { motion, AnimatePresence } from "framer-motion";
import { RecordId } from "surrealdb";
import { useNavigate } from "react-router-dom";

function Prenda({
  is_wished_item,
  item,
  onRemove,
  onChange,
}: {
  is_wished_item?: boolean;
  item: Record & { owner: RecordId<string> };
  onRemove?: (item: Record) => void;
  onChange?: (before: Record, after: Record) => void;
}) {
  const { db, auth } = useContext(DbContext);
  const navigate = useNavigate();
  const [isWished, setIsWished] = useState(is_wished_item ?? false);
  const [showModal, setShowModal] = useState(false);
  const [ownerDetails, setOwnerDetails] = useState<{
    username: string | null;
    profilePicture: string | null;
    profilePictureUrl: string | null;
  } | null>(null);

  useEffect(() => {
    const checkWishStatus = async () => {
      if (!db || !item || !item.id || auth === undefined) return;

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
  }, [auth, db, item, item.id]);

  useEffect(() => {
    const fetchOwnerDetails = async () => {
      if (!db || !item?.owner?.id) {
        setOwnerDetails(null);
        return;
      }

      try {
        const result = await db.query(
          `SELECT username, profile_picture FROM ONLY fn::search_by_username("${item.owner.id}")`,
        );
        console.log(result);

        if (result && Array.isArray(result) && result.length > 0) {
          const ownerData = result[0] as {
            username?: string;
            profile_picture?: string;
          };

          if (ownerData?.username) {
            const profilePictureHash = ownerData.profile_picture;
            const profilePictureUrl = profilePictureHash
              ? `${import.meta.env.VITE_IMG_SERVICE_URI}/${profilePictureHash}`
              : null;

            setOwnerDetails({
              username: ownerData.username,
              profilePicture: profilePictureHash ?? null,
              profilePictureUrl: profilePictureUrl,
            });
          } else {
            setOwnerDetails(null);
          }
        } else {
          setOwnerDetails(null);
        }
      } catch (error) {
        console.error("Error fetching owner details:", error);
        setOwnerDetails(null);
      }
    };

    fetchOwnerDetails();
  }, [db, item?.owner?.id]);

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

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleNavigateToOwnerCloset = () => {
    if (ownerDetails?.username) {
      handleCloseModal();
      navigate(`/closet/${ownerDetails.username}`);
    }
  };

  const imageUrl = item.image_url
    ? `${import.meta.env.VITE_IMG_SERVICE_URI}/${item.image_url}`
    : "";

  return (
    <>
      <motion.div
        layout
        className="relative flex flex-shrink-0 mx-1 flex-row hover:bg-gray-50 rounded-md p-1 group cursor-pointer"
        onClick={handleOpenModal}
      >
        <motion.img
          src={imageUrl}
          alt="Clothing item"
          className="h-40 w-32 object-contain"
        />
        {auth?.id.id === item.owner.id && (
          <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleVisibility();
              }}
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
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  ></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              )}
            </motion.button>
          </div>
        )}
        {auth?.id.id === item.owner.id && (
          <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
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
        {auth?.id.id !== item.owner.id && (
          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleWish();
              }}
              className="text-black text-sm cursor-pointer"
              title={isWished ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
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

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseModal();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-md flex relative max-w-[90vw] md:max-w-[70vw] max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 z-10"
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
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <div className="flex flex-row w-full h-full">
                <div className="flex-shrink-0 w-1/2 max-h-[85vh] pr-6">
                  <motion.img
                    src={imageUrl}
                    alt="Clothing item"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex flex-col flex-grow overflow-y-auto pl-2">
                  <div
                    className="flex items-center mb-4 cursor-pointer"
                    onClick={handleNavigateToOwnerCloset}
                  >
                    <div className="w-10 h-10 rounded-full mr-2 flex-shrink-0">
                      {ownerDetails?.profilePictureUrl ? (
                        <img
                          src={ownerDetails.profilePictureUrl}
                          alt={`${ownerDetails?.username}'s profile picture`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs"></div>
                      )}
                    </div>
                    <span className="font-semibold">
                      {ownerDetails?.username ?? "Unknown User"}
                    </span>
                  </div>

                  {auth?.id.id === item.owner.id && (
                    <div className="flex space-x-4 flex-shrink-0 mb-6">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility();
                        }}
                        className="text-black text-sm cursor-pointer flex items-center px-4 py-2 border rounded-md hover:bg-gray-100"
                        title={
                          item.public ? "Make item private" : "Make item public"
                        }
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
                            className="mr-2"
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
                            className="mr-2"
                          >
                            <rect
                              x="3"
                              y="11"
                              width="18"
                              height="11"
                              rx="2"
                              ry="2"
                            ></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                        )}
                        {item.public ? "Public" : "Private"}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove();
                          handleCloseModal();
                        }}
                        className="text-red-600 text-sm cursor-pointer flex items-center px-4 py-2 border border-red-600 rounded-md hover:bg-red-50"
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
                          className="mr-2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Remove
                      </motion.button>
                    </div>
                  )}

                  {auth?.id.id !== item.owner.id &&
                    false /* it is a mixi */ && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-center gap-x-2 px-4 py-2 mb-6 bg-black text-white rounded-full text-sm font-semibold w-fit"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <img
                          src="/assets/svg/hook.svg"
                          className="w-5 h-5 invert"
                          alt="Hook icon"
                        />
                        give a hook
                      </motion.button>
                    )}

                  {auth?.id.id !== item.owner.id && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWish();
                      }}
                      className="flex items-center justify-center gap-x-2 px-4 py-2 mb-6 text-black border border-gray-300 rounded-md text-sm hover:bg-gray-100 w-fit"
                      title={
                        isWished ? "Remove from wishlist" : "Add to wishlist"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={isWished ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 feather feather-heart"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      {isWished ? "In wishlist" : "Add to wishlist"}
                    </motion.button>
                  )}

                  <p className="text-sm text-gray-700 mb-6">
                    today i was going to have a picnic date, so i decided to
                    wear this outfit, i'm really happy with the result ^^ i hope
                    u like it too &lt;3
                  </p>

                  <div className="mb-6 text-sm text-gray-800">
                    <p className="flex items-center mb-1">
                      <span className="font-bold mr-2">&bull;</span> blouse:
                      bershka
                    </p>
                    <p className="flex items-center mb-1">
                      <span className="font-bold mr-2">&bull;</span> skirt: zara
                    </p>
                    <p className="flex items-center mb-1">
                      <span className="font-bold mr-2">&bull;</span> bag:
                      aliexpress
                    </p>
                    <p className="flex items-center">
                      <span className="font-bold mr-2">&bull;</span> shoes:
                      tianguis
                    </p>
                  </div>

                  <div className="mt-auto">
                    <h3 className="font-semibold mb-2">1 comment</h3>
                    <div className="bg-gray-100 p-2 rounded-md">
                      <input
                        type="text"
                        placeholder="Add a comment"
                        className="w-full bg-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Prenda;
