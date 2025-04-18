import { useState } from "react";

const Explore = () => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div>
      <p className="text-4xl font-bold text-left font-poppins p-4">Explore</p>
      <div className="flex space-x-4 px-4 mb-6">
        <button
          className={`px-6 py-2 text-lg font-medium rounded-full transition-colors ${
            activeTab === "all"
              ? "bg-black text-white"
              : "text-black border-2 border-solid-black bg-white hover:bg-black hover:text-white"
          }`}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
        <button
          className={`px-6 py-2 text-lg font-medium rounded-full transition-colors ${
            activeTab === "forYou"
              ? "bg-black text-white"
              : "text-black border-2 border-solid-black bg-white hover:bg-black hover:text-white"
          }`}
          onClick={() => setActiveTab("forYou")}
        >
          For You
        </button>
        <button
          className={`px-6 py-2 text-lg font-medium rounded-full transition-colors ${
            activeTab === "following"
              ? "bg-black text-white"
              : "text-black border-2 border-solid-black bg-white hover:bg-black hover:text-white"
          }`}
          onClick={() => setActiveTab("following")}
        >
          Following
        </button>
      </div>
    </div>
  );
};

export default Explore;
