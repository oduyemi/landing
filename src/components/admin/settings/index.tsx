
"use client";
import { useState } from "react";
import { Bell, LockKeyhole, Settings2, UserRound } from "lucide-react";
import {ProfileSettings} from "./ProfileSettings";
import {SecuritySettings} from "./SecuritySettings";
import {NotificationSettings} from "./NotificationSettings";

export type SettingsTab = "profile" | "notifications" | "security";

const tabs: {
  id: SettingsTab;
  label: string;
  icon: typeof UserRound;
}[] = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: LockKeyhole },
];

export const SettingsWa = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  return (
    <main className="min-h-full bg-[#fafafa] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7">
          <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
            <Settings2 size={14} />
            <span>Account</span>
            <span>/</span>
            <span className="text-neutral-800">Settings</span>
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
            Settings
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage your account and personal preferences.
          </p>
        </header>

        <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div
            role="tablist"
            aria-label="Settings sections"
            className="flex gap-6 overflow-x-auto border-b border-neutral-200 px-5 sm:px-7"
          >
            {tabs.map(({ id, label, icon: Icon }) => {
              const selected = activeTab === id;

              return (
                <button
                  key={id}
                  id={`settings-tab-${id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`settings-panel-${id}`}
                  onClick={() => setActiveTab(id)}
                  className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 py-4 text-xs font-medium transition-colors ${
                    selected
                      ? "border-neutral-900 text-neutral-900"
                      : "border-transparent text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              );
            })}
          </div>

          <div
            id={`settings-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`settings-tab-${activeTab}`}
            className="p-5 sm:p-7"
          >
            {activeTab === "profile" && <ProfileSettings />}
            {activeTab === "notifications" && <NotificationSettings />}
            {activeTab === "security" && <SecuritySettings />}
          </div>
        </section>
      </div>
    </main>
  );
}
