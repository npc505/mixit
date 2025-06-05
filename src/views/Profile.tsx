import { useContext, useEffect, useState, useRef, useMemo } from "react";
import { DbContext, Record, RecordId } from "../surreal";
import uploadFile from "../files/upload";
import TabGrid from "../components/TabGrid";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Prenda from "../components/Prenda";

// Define a type for the user details to display in the lists
interface UserProfileLite {
  id: RecordId<string>;
  username: string;
  profile_picture?: string;
}

function Closet() {
  const [activeTab, setActiveTab] = useState("all");
  const [imgColorKind, setImgColorKind] = useState("neutral");
  const [is_user_profile, setIsUserProfile] = useState(false);
  const [clothingItems, setClothingItems] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cachedItems, setCachedItems] = useState<Record[][]>([]);
  const [fetchedTabs, setFetchedTabs] = useState<Set<string>>(new Set());

  const [wishedItems, setWishedItems] = useState<
    (Record & { owner: RecordId<string> })[]
  >([]);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // State for modals and lists
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState<UserProfileLite[]>([]);
  const [followingList, setFollowingList] = useState<UserProfileLite[]>([]);
  const [isFollowersLoading, setIsFollowersLoading] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

  const { db, auth } = useContext(DbContext);
  const profilePicture_fileInputRef = useRef<HTMLInputElement>(null);
  const bannerImage_fileInputRef = useRef<HTMLInputElement>(null);

  const { id: paramId } = useParams<{ id?: string }>();
  const navigate = useNavigate(); // Hook for navigation
  const id = paramId === undefined ? "$auth.username" : paramId;

  // We only set the state via a useEffect to avoid infinite re-renders
  useEffect(() => {
    if (paramId === undefined) {
      setIsUserProfile(true);
    }
  }, [paramId]);

  // console.log(`Profile for ${id}`);

  const [info, setInfo] = useState<undefined | Record>();
  const [isUploading, setIsUploading] = useState(false);
  const [isBannerUploading, setIsBannerUploading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tabIndices = useMemo(() => {
    return {
      all: 0,
      top: 1,
      bot: 2,
      full: 3,
      foot: 4,
      bag: 5,
      accessory: 6,
    };
  }, []);

  // Gracias a https://dvmhn07.medium.com/learn-to-detect-image-background-colors-in-react-using-html-canvas-8c2d9e527e7d
  // Basicamente tomamos N pixeles al azar, vemos qué intensidad tiene y después, con el
  // promedio de las muestras determinamos si es obscuro o no
  useEffect(() => {
    const updateBannerImage = async () => {
      const canvas = canvasRef.current;
      if (!canvas || typeof info?.back_picture !== "string") {
        return;
      }

      console.log("Starting");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Failed to get canvas context");
        return;
      }

      const image = new Image();
      image.crossOrigin = "Anonymous";
      image.src = `${import.meta.env.VITE_IMG_SERVICE_URI}/${info.back_picture}`;

      // Gracias a Karlita por la lógica para que no se distorsione la imagen
      image.onload = () => {
        // Set canvas dimensions to match the container
        const containerEl = canvas.parentElement;
        if (containerEl) {
          canvas.width = containerEl.clientWidth;
          canvas.height = containerEl.clientHeight;
        } else {
          canvas.width = image.width;
          canvas.height = image.height;
        }

        // Calculate dimensions to maintain aspect ratio
        const containerWidth = canvas.width;
        const containerHeight = canvas.height;
        const imageAspectRatio = image.width / image.height;
        const containerAspectRatio = containerWidth / containerHeight;

        let drawWidth,
          drawHeight,
          offsetX = 0,
          offsetY = 0;

        if (imageAspectRatio > containerAspectRatio) {
          // Image is wider than container (relative to height)
          drawHeight = containerHeight;
          drawWidth = drawHeight * imageAspectRatio;
          offsetX = (containerWidth - drawWidth) / 2;
        } else {
          // Image is taller than container (relative to width)
          drawWidth = containerWidth;
          drawHeight = drawWidth / imageAspectRatio;
          offsetY = (containerHeight - drawHeight) / 2;
        }

        // Clear canvas before drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the image with proper aspect ratio
        ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

        try {
          const width = canvas.width;
          const height = canvas.height;
          const numSamples = 250;

          let totalRed = 0,
            totalGreen = 0,
            totalBlue = 0;

          // console.log(width, height);

          for (let i = 0; i < numSamples; i++) {
            const centerWidth = width / 2;
            const centerHeight = height / 2;
            const spreadFactor = 0.25;
            const x = Math.floor(
              centerWidth + (Math.random() * 2 - 1) * width * spreadFactor,
            );
            const y = Math.floor(
              centerHeight + (Math.random() * 2 - 1) * height * spreadFactor,
            );

            const pixelData = ctx.getImageData(x, y, 1, 1).data;
            const [red, green, blue] = pixelData;

            totalRed += red;
            totalGreen += green;
            totalBlue += blue;
          }

          const avgRed = totalRed / numSamples;
          const avgGreen = totalGreen / numSamples;
          const avgBlue = totalBlue / numSamples;

          // console.log("Average RGB:", avgRed, avgGreen, avgBlue);

          const percent = (avgRed + avgGreen + avgBlue) / (255 * 3);
          if (percent < 0.6) {
            // console.log("Image is dark");
            setImgColorKind("dark");
          } else {
            setImgColorKind("neutral");
          }

          setIsBannerUploading(false);
        } catch (error) {
          console.error("Error analyzing image colors:", error);
        }
      };

      image.onerror = (err) => {
        console.error("Error loading image:", err);
      };
    };

    // Only start banner upload state if there is a picture
    if (typeof info?.back_picture === "string") {
      setIsBannerUploading(true);
    } else {
      setIsBannerUploading(false);
    }

    updateBannerImage();
  }, [info?.back_picture]);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const result = is_user_profile
          ? await db.info()
          : (
              (await db.query(
                `
LET $id = IF (RETURN type::thing("usuario", "${id}") FETCH usuario) != NONE {
    type::thing("usuario", "${id}")
} ELSE {
    fn::search_by_username("${id}")
};

SELECT
    *,
    (
        SELECT VALUE id
          FROM ONLY $auth.id->follows
        WHERE out = $id
        LIMIT 1
    ) AS relation,
    $auth.id == $id AS is_self
  FROM ONLY $id
LIMIT 1`,
              )) as Record[]
            )[1];

        if (result !== undefined) {
          if (result.is_self === true) {
            setIsUserProfile(true);
          }

          setInfo(result);
        }
      } catch (error) {
        console.error("Failed to fetch info:", error);
      }
    };

    if (info !== undefined) {
      return;
    }

    fetchInfo();
  }, [info, db, id, is_user_profile]);

  useEffect(() => {
    const fetchClothingItems = async () => {
      if (!info) return;

      // Avoid re-fetching for tabs that we've already determined have no items
      if (fetchedTabs.has(activeTab)) {
        const tabIndex = tabIndices[activeTab as keyof typeof tabIndices];
        setClothingItems(cachedItems[tabIndex] || []);
        return;
      }

      // Check if we already have cached data for this tab
      const tabIndex = tabIndices[activeTab as keyof typeof tabIndices];
      if (cachedItems[tabIndex] && cachedItems[tabIndex].length > 0) {
        console.log(`Using cached data for ${activeTab}`);
        setClothingItems(cachedItems[tabIndex]);
        return;
      }

      setIsLoading(true);
      try {
        const results = (await db.query(
          `
          LET $id = ${
            is_user_profile
              ? info.id
              : `IF (RETURN type::thing("usuario", "${id}") FETCH usuario) != NONE {
                    type::thing("usuario", "${id}")
                } ELSE {
                    fn::search_by_username("${id}")
                }`
          };

          SELECT ->sube->prenda ${activeTab === "all" ? "" : `WHERE tipo = '${activeTab}'`} AS prendas FROM ONLY $id FETCH prendas.prenda;
          `,
        )) as Record[];
        const items = results[1];
        const prendas = {
          prendas: Array.isArray(items.prendas) ? items.prendas : [],
        };

        if (prendas && prendas.prendas && Array.isArray(prendas.prendas)) {
          const newItems = prendas.prendas as Record[];
          const itemsWithOwner = newItems.map((item) => ({
            ...item,
            owner: info.id,
          })) as (Record & { owner: RecordId<string> })[];
          setClothingItems(itemsWithOwner);

          // Update the cache
          const newCachedItems = [...cachedItems];
          newCachedItems[tabIndex] = itemsWithOwner;
          setCachedItems(newCachedItems);
        } else {
          setClothingItems([]);

          // Cache empty results too
          const newCachedItems = [...cachedItems];
          newCachedItems[tabIndex] = [];
          setCachedItems(newCachedItems);
        }

        // Mark this tab as fetched to prevent infinite refetching
        setFetchedTabs((prev) => new Set(prev).add(activeTab));
      } catch (error) {
        console.error("Failed to fetch clothing items:", error);
        setClothingItems([]);

        // Even on error, mark as fetched to prevent infinite retries
        setFetchedTabs((prev) => new Set(prev).add(activeTab));
      } finally {
        setIsLoading(false);
      }
    };

    fetchClothingItems();
  }, [
    db,
    info,
    activeTab,
    id,
    is_user_profile,
    fetchedTabs,
    tabIndices,
    cachedItems,
  ]);

  useEffect(() => {
    const fetchWishedItems = async () => {
      if (!info) return;

      setIsWishlistLoading(true);
      try {
        const results = (await db.query(
          `
          LET $profile_id = ${
            is_user_profile
              ? info.id
              : `IF (RETURN type::thing("usuario", "${id}") FETCH usuario) != NONE {
              type::thing("usuario", "${id}")
          } ELSE {
              fn::search_by_username("${id}")
          }`
          };


          SELECT VALUE wished FROM ONLY (SELECT ->wishes->prenda.* AS wished FROM ONLY $profile_id);
          `,
        )) as (Record & { owner: RecordId<string> })[];

        const items = Array.isArray(results[1]) ? results[1] : [];

        setWishedItems(items);
      } catch (error) {
        console.error("Failed to fetch wished items:", error);
        setWishedItems([]);
      } finally {
        setIsWishlistLoading(false);
      }
    };

    fetchWishedItems();
  }, [db, info, id, is_user_profile]);

  // Fetch followers
  const fetchFollowers = async () => {
    if (!info || !info.id || isFollowersLoading) return;

    setIsFollowersLoading(true);
    try {
      const result = await db.query(
        `
        LET $id = ${
          is_user_profile
            ? info.id
            : `IF (RETURN type::thing("usuario", "${id}") FETCH usuario) != NONE {
                  type::thing("usuario", "${id}")
              } ELSE {
                  fn::search_by_username("${id}")
              }`
        };

        SELECT VALUE sigue FROM ONLY (SELECT <-follows<-usuario AS sigue FROM ONLY $id) FETCH usuario`,
      );
      const users = Array.isArray(result[1]) ? result[1] : [];
      setFollowersList(users as UserProfileLite[]);
    } catch (error) {
      console.error("Failed to fetch followers:", error);
      setFollowersList([]);
    } finally {
      setIsFollowersLoading(false);
    }
  };

  // Fetch following
  const fetchFollowing = async () => {
    if (!info || !info.id || isFollowingLoading) return;

    setIsFollowingLoading(true);
    try {
      // SurrealQL to fetch users the current profile follows
      const result = await db.query(
        `
        LET $id = ${
          is_user_profile
            ? info.id
            : `IF (RETURN type::thing("usuario", "${id}") FETCH usuario) != NONE {
                  type::thing("usuario", "${id}")
              } ELSE {
                  fn::search_by_username("${id}")
              }`
        };

        SELECT VALUE sigue FROM ONLY (SELECT ->follows->usuario AS sigue FROM ONLY $id) FETCH usuario`,
      );
      const users = Array.isArray(result[1]) ? result[1] : [];
      setFollowingList(users as UserProfileLite[]);
    } catch (error) {
      console.error("Failed to fetch following:", error);
      setFollowingList([]);
    } finally {
      setIsFollowingLoading(false);
    }
  };

  const openFollowersModal = () => {
    setShowFollowersModal(true);
    fetchFollowers(); // Fetch list when modal opens
  };

  const closeFollowersModal = () => {
    setShowFollowersModal(false);
    setFollowersList([]); // Clear list when closing
  };

  const openFollowingModal = () => {
    setShowFollowingModal(true);
    fetchFollowing(); // Fetch list when modal opens
  };

  const closeFollowingModal = () => {
    setShowFollowingModal(false);
    setFollowingList([]); // Clear list when closing
  };

  const handleNavigateToUserCloset = (username: string) => {
    if (username) {
      closeFollowersModal();
      closeFollowingModal();
      // Navigate to the user's closet page using their ID
      navigate(`/closet/${username}`);
      // Close any open modals
    }
  };

  if (info === undefined) {
    return null;
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
      const uploadedHash = await uploadFile(file, false);

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

    try {
      const uploadedHash = await uploadFile(file, false);

      if (uploadedHash) {
        setIsBannerUploading(true); // Keep loading state until image is rendered and analyzed
        await db.query(`UPDATE $auth.id SET back_picture = "${uploadedHash}"`);
        const updatedInfo = {
          ...info,
          back_picture: uploadedHash,
        };

        // Clear canvas immediately to show loading or new background
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
        setInfo(updatedInfo);
        // setIsBannerUploading(false); // This will be set to false in the image load handler
      } else {
        setIsBannerUploading(false); // Hide loading if upload failed
      }
    } catch (error) {
      console.error("Error handling banner file change:", error);
      setIsBannerUploading(false); // Hide loading on error
    } finally {
      // The loading state is managed by the image.onload/onerror now
    }
  };

  const textColor = imgColorKind === "dark" ? "text-white" : "text-black";

  const handleFollow = async () => {
    try {
      if (info.relation === undefined) {
        const [res] = (await db.query(
          `SELECT * FROM ONLY fn::follow(fn::search_by_username("${id}")) LIMIT 1;`,
        )) as Record[];

        if (res !== undefined && res !== null) {
          const updatedInfo = {
            ...info,
            relation: res.id,
            followers:
              (typeof info.followers === "number" ? info.followers : 0) + 1,
          };
          setInfo(updatedInfo);
        }
      } else {
        const [res] = (await db.query(
          `SELECT * FROM ONLY fn::unfollow(fn::search_by_username("${id}")) LIMIT 1;`,
        )) as Record[];

        if (res !== undefined && res !== null) {
          const updatedInfo = {
            ...info,
            relation: undefined,
            followers: Math.max(
              0,
              (typeof info.followers === "number" ? info.followers : 0) - 1,
            ),
          };
          setInfo(updatedInfo);
        }
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "top", label: "Tops" },
    { id: "bot", label: "Bottoms" },
    { id: "full", label: "Dresses" },
    { id: "foot", label: "Shoes" },
    { id: "bag", label: "Bags" },
    { id: "accessory", label: "Accessories" },
  ];

  // Simple Modal Component (can be extracted if needed)
  const Modal = ({
    children,
    title,
    onClose,
  }: {
    children: React.ReactNode;
    title: string;
    onClose: () => void;
  }) => {
    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-11/12 md:w-1/3 max-h-[80vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="p-4 overflow-y-auto flex-grow">{children}</div>
        </div>
      </div>
    );
  };

  // Component to render a user item in the lists
  const UserListItem = ({ user }: { user: UserProfileLite }) => {
    console.log(user);
    return (
      <div
        className="flex items-center py-2 cursor-pointer hover:bg-gray-100 rounded-md px-2 transition-colors"
        onClick={() => handleNavigateToUserCloset(user.username)}
      >
        <div className="w-10 h-10 rounded-full mr-3 flex-shrink-0 overflow-hidden bg-gray-200">
          {user.profile_picture ? (
            <img
              src={`${import.meta.env.VITE_IMG_SERVICE_URI}/${user.profile_picture}`}
              alt={`${user.username}'s profile picture`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs"></div>
          )}
        </div>
        <span className="font-semibold text-gray-800">
          {user.username ?? "Unknown User"}
        </span>
      </div>
    );
  };

  return (
    <div>
      <div
        className="w-full h-[50vh] relative flex flex-col items-center justify-center"
        style={{
          backgroundColor:
            typeof info.back_picture === "string" ? "transparent" : "#FDCCE9",
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        />
        {is_user_profile && (
          <div className="flex flex-col">
            <span
              className={`absolute top-4 right-4 text-xs ${textColor} px-2 py-1 cursor-pointer hover:underline transition-all duration-300 z-10`}
              onClick={handleBannerPictureClick}
            >
              Edit
            </span>
            <span
              className={`absolute top-10 right-4 text-xs ${textColor} px-2 py-1 cursor-pointer hover:underline transition-all duration-300 z-10`}
              onClick={() => {
                document.cookie =
                  "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.href = "/";
              }}
            >
              Log Out
            </span>
          </div>
        )}
        <div
          className={`absolute bottom-4 right-4 text-xs ${textColor} px-2 py-1 z-10 flex items-center gap-2`}
        >
          <span>{String(info.id?.id)}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cursor-pointer hover:opacity-70"
            onClick={() => navigator.clipboard.writeText(String(info.id?.id))}
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </div>
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
          className={`w-24 h-24 rounded-full bg-gray-200 overflow-hidden ${is_user_profile ? "cursor-pointer" : ""} group relative z-10`}
          style={{
            backgroundImage:
              typeof info.profile_picture === "string"
                ? `url(${import.meta.env.VITE_IMG_SERVICE_URI}/${info.profile_picture})`
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
        <div
          className={`mt-2 text-xl font-semibold ${textColor} z-10 relative`}
        >
          {is_user_profile ? (
            <input
              type="text"
              value={
                typeof info.username === "string" ? info.username : "Username"
              }
              className={`bg-transparent text-center outline-none border-b ${
                info.error
                  ? "border-red-500"
                  : "border-transparent hover:border-current focus:border-current"
              }`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              onChange={(e) => {
                const newUsername = e.target.value;
                const updatedInfo = { ...info, username: newUsername };
                setInfo(updatedInfo);
              }}
              onBlur={async (e) => {
                const newUsername = e.target.value;
                try {
                  await db.query(
                    `UPDATE $auth.id SET username = "${newUsername}"`,
                  );
                  if (
                    paramId !== undefined &&
                    paramId !== String(info.id?.id)
                  ) {
                    window.history.replaceState(
                      null,
                      "",
                      `/closet/${newUsername}`,
                    );
                  }
                  setInfo((prev) =>
                    prev ? { ...prev, error: false } : undefined,
                  );
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (error) {
                  setInfo((prev) =>
                    prev ? { ...prev, error: true } : undefined,
                  );
                }
              }}
            />
          ) : (
            <p>
              {typeof info.username === "string" ? info.username : "Username"}
            </p>
          )}
        </div>
        <div className={`${is_user_profile ? "invisible" : "visible"} z-10`}>
          <Button
            onClick={handleFollow}
            label={info.relation === undefined ? "Follow" : "Following"}
            isActive={true}
          />
        </div>
        <div className="flex flex-row mt-4 space-x-6 z-10">
          <div
            className={`flex flex-col items-center ${textColor} cursor-pointer`}
            onClick={openFollowersModal}
          >
            <span className="text-xl font-bold">
              {typeof info.followers === "number" ? info.followers : 0}
            </span>
            <span className="text-sm">Followers</span>
          </div>
          <div
            className={`flex flex-col items-center ${textColor} cursor-pointer`}
            onClick={openFollowingModal}
          >
            <span className="text-xl font-bold">
              {typeof info.following === "number" ? info.following : 0}
            </span>
            <span className="text-sm">Following</span>
          </div>
          <div className={`flex flex-col items-center ${textColor}`}>
            <span className="text-xl font-bold">0</span>
            <span className="text-sm">MIXIS</span>
          </div>
          <div className={`flex flex-col items-center ${textColor}`}>
            <span className="text-xl font-bold">0</span>
            <span className="text-sm">In Hooks</span>
          </div>
        </div>
      </div>
      {!is_user_profile && (
        <div className="flex justify-between items-center p-4">
          <p className="text-4xl font-bold font-poppins">Closet</p>
        </div>
      )}
      {is_user_profile && (
        <div className="flex justify-between items-center p-4">
          <p className="text-4xl font-bold font-poppins">My Closet</p>
          <Button
            onClick={() => (window.location.href = "/upload")}
            label="Subir nueva prenda"
            isActive={true}
          />
        </div>
      )}
      <div>
        <TabGrid
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <div className="flex overflow-x-auto p-4">
          {isLoading ? (
            <div className="w-full flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : clothingItems.length > 0 && auth !== undefined ? (
            clothingItems.map((item) => (
              <div key={String(item.id?.id)}>
                <Prenda
                  item={item as Record & { owner: RecordId<string> }} // Cast item to satisfy prop type
                  onRemove={(itemToRemove: Record) => {
                    setClothingItems(
                      clothingItems.filter((i) => i.id !== itemToRemove.id),
                    );
                  }}
                  onChange={(before: Record, after: Record) => {
                    const updatedItems = clothingItems.map(
                      (i) =>
                        i.id === before.id
                          ? { ...after, owner: (after as any).owner || info.id }
                          : i, // Preserve owner on update
                    );
                    setClothingItems(
                      updatedItems as (Record & { owner: RecordId<string> })[],
                    ); // Cast back
                  }}
                />
              </div>
            ))
          ) : (
            <div className="w-full text-center py-10 text-gray-500">
              No items found in this category
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center p-4">
          <p className="text-4xl font-bold font-poppins">Wishlist</p>
        </div>
        <div className="flex overflow-x-auto p-4">
          {isWishlistLoading ? (
            <div className="w-full flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : wishedItems.length > 0 && auth !== undefined ? (
            wishedItems.map((item) => {
              console.log("item:", item);
              return (
                <div key={String(item.id?.id)}>
                  <Prenda
                    item={item}
                    is_wished_item={true}
                    onRemove={async (itemToRemove: Record) => {
                      try {
                        await db.query(
                          `SELECT * FROM ONLY fn::unwish(${String(itemToRemove.id)}) LIMIT 1;`,
                        );
                        setWishedItems(
                          wishedItems.filter((i) => i.id !== itemToRemove.id),
                        );
                      } catch (error) {
                        console.error("Error unwishing item:", error);
                      }
                    }}
                    onChange={() => {}}
                  />
                </div>
              );
            })
          ) : info?.wishlist_public === false && !is_user_profile ? (
            <div className="w-full text-center py-10 text-gray-500">
              Wishlist is private.
            </div>
          ) : (
            <div className="w-full text-center py-10 text-gray-500">
              No items found in the wishlist.
            </div>
          )}
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <Modal title="Followers" onClose={closeFollowersModal}>
          {isFollowersLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : followersList.length > 0 ? (
            followersList.map((user) => (
              <div key={user.id}>
                <UserListItem user={user} />
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No followers found.</div>
          )}
        </Modal>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <Modal title="Following" onClose={closeFollowingModal}>
          {isFollowingLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : followingList.length > 0 ? (
            followingList.map((user) => (
              <UserListItem key={String(user.id)} user={user} />
            ))
          ) : (
            <div className="text-center text-gray-500">
              Not following anyone.
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

export default Closet;
