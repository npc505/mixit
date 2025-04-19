import { useState } from "react";
import Button from "../components/Button";

interface TabGridProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabGrid = ({ tabs, activeTab, setActiveTab }: TabGridProps) => {
  return (
    <div className="flex space-x-4 px-4 mb-6">
      {tabs.map((tab) => (
        <Button
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
