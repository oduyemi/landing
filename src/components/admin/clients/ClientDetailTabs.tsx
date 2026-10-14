"use client";
import { Activity, BriefcaseBusiness, LayoutGrid } from "lucide-react";


export type ClientDetailTab = "overview" | "projects" | "activity";


interface ClientDetailTabsProps {
  activeTab: ClientDetailTab;
  onChange: (tab: ClientDetailTab) => void;
}


const tabs: {
  id: ClientDetailTab;
  label: string;
  icon: typeof LayoutGrid;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "projects", label: "Projects", icon: BriefcaseBusiness },
  { id: "activity", label: "Activity", icon: Activity },
];

export const ClientDetailTabs = ({
  activeTab,
  onChange,
}: ClientDetailTabsProps) => {
  return (
    <div className="flex items-center gap-5 border-b border-[#eaeaea]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={[
              "relative inline-flex h-10 items-center gap-1.5 text-[10px] font-medium transition-colors",
              active ? "text-[#191919]" : "text-[#929292] hover:text-[#444]",
            ].join(" ")}
          >
            <Icon size={12} strokeWidth={1.7} className="sm:hidden" />
            {tab.label}

            {active && (
              <span className="absolute inset-x-0 bottom-[-1px] h-[2px] rounded-full bg-[#191919]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
