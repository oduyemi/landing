
"use client";


export type ProjectDetailTab =
  | "overview"
  | "milestones"
  | "tasks"
  | "files"
  | "messages"
  | "updates"
  | "activity"
  | "settings";


  
interface ProjectDetailTabsProps {
  activeTab: ProjectDetailTab;
  onChange: (tab: ProjectDetailTab) => void;
}

const tabs: { id: ProjectDetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "milestones", label: "Milestones" },
  { id: "tasks", label: "Tasks" },
  { id: "files", label: "Files" },
  { id: "messages", label: "Messages" },
  { id: "updates", label: "Updates" },
  { id: "activity", label: "Activity" },
  { id: "settings", label: "Settings" },
];

export const ProjectDetailTabs = ({activeTab, onChange}: ProjectDetailTabsProps) => {
  return (
    <div className="overflow-x-auto border-b border-[#eaeaea]">
      <div className="flex min-w-max items-center gap-5">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={`relative h-10 whitespace-nowrap text-[10px] font-medium transition-colors ${
                active ? "text-[#191919]" : "text-[#929292] hover:text-[#444]"
              }`}
            >
              {tab.label}
              {active && (
                <span className="absolute inset-x-0 bottom-[-1px] h-[2px] rounded-full bg-[#191919]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
