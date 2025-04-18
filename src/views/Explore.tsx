import { useState } from "react";

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton = ({ label, isActive, onClick }: TabButtonProps) => {
  return (
    <button
      className={`px-6 py-2 text-lg font-medium rounded-full transition-colors ${
        isActive
          ? "bg-black text-white"
          : "text-black border-2 border-solid-black bg-white hover:bg-black hover:text-white"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

interface TabGridProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabGrid = ({ tabs, activeTab, setActiveTab }: TabGridProps) => {
  return (
    <div className="flex space-x-4 px-4 mb-6">
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          label={tab.label}
          isActive={activeTab === tab.id}
          onClick={() => setActiveTab(tab.id)}
        />
      ))}
    </div>
  );
};

const Explore = () => {
  const [activeTab, setActiveTab] = useState("all");
  const tabs = [
    { id: "all", label: "All" },
    { id: "forYou", label: "For You" },
    { id: "following", label: "Following" },
  ];

  return (
    <div>
      <p className="text-4xl font-bold text-left font-poppins p-4">Explore</p>
      <TabGrid tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Explore;
