"use client";
import { motion } from "framer-motion";

export type ProjectTab =
  | "Overview"
  | "Files"
  | "Messages"
  | "Tasks"
  | "Activity";

interface ProjectTabsProps {
  activeTab: ProjectTab;
  onChange: (tab: ProjectTab) => void;
}

const tabs: ProjectTab[] = [
  "Overview",
  "Files",
  "Messages",
  "Tasks",
  "Activity",
];

export function ProjectTabs({
  activeTab,
  onChange,
}: ProjectTabsProps) {
  return (
    <div className="border-b border-[#ededed]">
      <div className="flex items-center gap-6 overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab === activeTab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={[
                "relative shrink-0 pb-3 pt-1 text-[10px] font-medium transition-colors",
                active
                  ? "text-[#111]"
                  : "text-[#999] hover:text-[#333]",
              ].join(" ")}
            >
              {tab}

              {active && (
                <motion.span
                  layoutId="project-tab"
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] rounded-full bg-[#111]"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}