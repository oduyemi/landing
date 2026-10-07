"use client";
import { motion } from "framer-motion";
import type { ProfileTab } from "./index";

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}

const tabs: {
  id: ProfileTab;
  label: string;
}[] = [
  {
    id: "personal",
    label: "Personal information",
  },
  {
    id: "security",
    label: "Security",
  },
];

export const ProfileTabs = ({
  activeTab,
  onChange,
}: ProfileTabsProps) => {
  return (
    <div className="border-b border-[#eeeeee] px-5 sm:px-7">
      <div className="flex gap-6">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className="relative py-3.5 text-[12px] font-medium transition-colors"
              style={{
                color: active ? "#222" : "#999",
              }}
            >
              {tab.label}

              {active && (
                <motion.div
                  layoutId="profile-active-tab"
                  className="absolute bottom-[-1px] left-0 right-0 h-px bg-[#222]"
                  transition={{
                    duration: 0.2,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};