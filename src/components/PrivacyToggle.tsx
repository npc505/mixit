import { useState } from "react";

export default function PrivacyToggle({
  isPrivate: initialIsPrivate = true,
  onChange,
}: {
  isPrivate?: boolean;
  onChange?: (isPrivate: boolean) => void;
}) {
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);

  const handleToggle = () => {
    const newValue = !isPrivate;
    setIsPrivate(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center w-full max-w-xl h-10 rounded-full overflow-hidden cursor-pointer border border-black">
      <div className="flex items-center justify-between w-full h-full">
        <div
          className={`flex items-center justify-center gap-2 px-4 py-1 w-1/2 h-full font-bold whitespace-nowrap ${
            isPrivate ? "bg-black text-white" : "bg-white text-black"
          }`}
          onClick={() => isPrivate || handleToggle()}
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
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Private</span>
        </div>

        <div
          className={`flex items-center justify-center gap-2 px-4 py-1 w-1/2 h-full font-bold whitespace-nowrap ${
            !isPrivate ? "bg-black text-white" : "bg-white text-black"
          }`}
          onClick={() => !isPrivate || handleToggle()}
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
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span>Make Public</span>
        </div>
      </div>
    </div>
  );
}
