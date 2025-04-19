import Button from "./Button";

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

export default TabGrid;
