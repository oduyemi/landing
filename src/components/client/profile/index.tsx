"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ProfileTabs } from "./Tabs";
import { PersonalInformation } from "./PersonalInfo";
import { SecuritySettings } from "./SecuritySettings";
import { useAuth } from "@/context/AuthContext";

export type ProfileTab =
  | "personal"
  | "security";

export const ProfilePage = () => {
  const { user, loading, refreshUser } =
    useAuth();

  const [activeTab, setActiveTab] =
    useState<ProfileTab>("personal");

  if (loading) {
    return (
      <div className="px-7">
        <div className="mx-auto max-w-5xl pb-10 pt-4">
          <div className="h-4 w-20 animate-pulse rounded bg-[#eeeeee]" />

          <div className="mt-5 overflow-hidden rounded-[6px] border border-[#e5e5e5] bg-white">
            <div className="h-[46px] border-b border-[#eeeeee]" />

            <div className="p-7">
              <div className="h-3 w-32 animate-pulse rounded bg-[#eeeeee]" />
              <div className="mt-2 h-2 w-56 animate-pulse rounded bg-[#f2f2f2]" />

              <div className="mt-7 space-y-4">
                <div className="h-8 animate-pulse rounded bg-[#f5f5f5]" />
                <div className="h-8 animate-pulse rounded bg-[#f5f5f5]" />
                <div className="h-8 animate-pulse rounded bg-[#f5f5f5]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-7">
        <div className="mx-auto max-w-5xl py-10">
          <p className="text-[10px] text-[#888]">
            Unable to load your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-7">
      <div className="mx-auto max-w-5xl pb-10 pt-4">
        <motion.div
          initial={{
            opacity: 0,
            y: 4,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
          }}
          className="mb-5"
        >
          <h1 className="text-[14px] font-semibold tracking-[-0.02em] text-[#181818]">
            Profile
          </h1>

          <p className="mt-1 text-[12px] text-[#929292]">
            Manage your personal information and
            account settings.
          </p>
        </motion.div>

        <motion.section
          initial={{
            opacity: 0,
            y: 6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: 0.05,
          }}
          className="overflow-hidden rounded-[6px] border border-[#e5e5e5] bg-white"
        >
          <ProfileTabs
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          <div className="px-5 py-6 sm:px-7 sm:py-7">
            {activeTab === "personal" && (
              <PersonalInformation
                user={user}
                onSaved={refreshUser}
              />
            )}

            {activeTab === "security" && (
              <SecuritySettings />
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
};