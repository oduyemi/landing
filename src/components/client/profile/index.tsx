"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, CircleUserRound, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { ProfileTabs } from "./Tabs";
import { PersonalInformation } from "./PersonalInfo";
import { SecuritySettings } from "./SecuritySettings";
import { useAuth } from "@/context/AuthContext";

export type ProfileTab = "personal" | "security";

function ProfileSkeleton() {
  return (
    <div className="min-h-full bg-[#f7f8fa] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div>
          <div className="h-3 w-24 rounded-full bg-slate-200" />
          <div className="mt-3 h-7 w-44 rounded-lg bg-slate-200" />
          <div className="mt-3 h-3 w-72 max-w-full rounded-full bg-slate-100" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-5 sm:p-7">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-100" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-40 max-w-full rounded-full bg-slate-200" />
                <div className="h-3 w-56 max-w-full rounded-full bg-slate-100" />
              </div>
            </div>
          </div>

          <div className="flex gap-6 border-b border-slate-100 px-5 py-4 sm:px-7">
            <div className="h-4 w-24 rounded-full bg-slate-200" />
            <div className="h-4 w-20 rounded-full bg-slate-100" />
          </div>

          <div className="space-y-5 p-5 sm:p-8">
            <div className="h-4 w-36 rounded-full bg-slate-200" />
            <div className="h-3 w-64 max-w-full rounded-full bg-slate-100" />
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="h-12 rounded-xl bg-slate-100" />
              <div className="h-12 rounded-xl bg-slate-100" />
              <div className="h-12 rounded-xl bg-slate-100" />
              <div className="h-12 rounded-xl bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ProfilePage = () => {
  const { user, loading, refreshUser } = useAuth();

  const [activeTab, setActiveTab] =
    useState<ProfileTab>("personal");

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-full bg-[#f7f8fa] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <CircleUserRound size={26} strokeWidth={1.6} />
            </div>

            <h1 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
              Profile unavailable
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              We couldn&apos;t load your account information.
              Please try again or sign in again if your session
              has expired.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    [user.fname, user.lname].filter(Boolean).join(" ") ||
    "Your account";

  const email = user.email || "";

  const avatarInitials =
    [user.fname, user.lname]
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "U";

  const isPersonal = activeTab === "personal";

  return (
    <div className="min-h-full bg-[#f7f8fa] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl pb-10">
        {/* Page heading */}
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mb-6 sm:mb-8"
        >
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-500">
            <CircleUserRound size={15} />
            <span>Account settings</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700">Profile</span>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Your profile
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Manage your personal details and security
                preferences in one place.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black-200/80 bg-black-50 px-3 py-2 text-xs font-medium text-emerald-800">
              <CheckCircle2 size={14} />
              Account settings
            </div>
          </div>
        </motion.header>

        {/* Account overview */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: 0.04,
            ease: [0.22, 1, 0.36, 1],
          }}
          aria-label="Account overview"
          className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.035)]"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500" />

          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold tracking-wide text-white shadow-sm sm:h-[72px] sm:w-[72px]">
                {avatarInitials}

                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-white bg-emerald-500 text-white">
                  <CheckCircle2 size={12} strokeWidth={2.5} />
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Account overview
                </p>

                <h2 className="mt-1 truncate text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                  {displayName}
                </h2>

                {email && (
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {email}
                  </p>
                )}

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-black-50 px-2.5 py-1 text-[10px] font-medium capitalize text-slate-600">
                    <UserRound size={11} />
                    {user.role || "Client"}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
                    <ShieldCheck size={11} />
                    Account settings
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                {isPersonal ? (
                  <UserRound size={17} />
                ) : (
                  <LockKeyhole size={17} />
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {isPersonal
                    ? "Personal information"
                    : "Security settings"}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {isPersonal
                    ? "Manage your details"
                    : "Manage account security"}
                </p>
              </div>

              <ArrowUpRight
                size={15}
                className="ml-2 text-slate-400"
              />
            </div>
          </div>
        </motion.section>

        {/* Profile settings */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.035)]"
        >
          <div className="border-b border-slate-100 px-5 pt-5 sm:px-7 sm:pt-6">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Manage your account
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Update your information or review your security
                settings.
              </p>
            </div>

            <ProfileTabs
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="px-5 py-6 sm:px-7 sm:py-8"
          >
            {activeTab === "personal" && (
              <PersonalInformation
                user={user}
                onSaved={refreshUser}
              />
            )}

            {activeTab === "security" && <SecuritySettings />}
          </motion.div>
        </motion.section>

        {/* Supporting note */}
        <div className="mt-5 flex items-start gap-2.5 px-1">
          <ShieldCheck
            size={15}
            className="mt-0.5 shrink-0 text-slate-400"
          />

          <p className="text-xs leading-5 text-slate-500">
            Keep your account details up to date and use your
            security settings to help protect your account.
          </p>
        </div>
      </div>
    </div>
  );
};