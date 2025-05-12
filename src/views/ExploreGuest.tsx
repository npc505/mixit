import { useState } from "react";
import TabGrid from "../components/TabGrid";

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
