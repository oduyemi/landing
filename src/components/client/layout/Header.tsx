"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { LogoutOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProjectSearch from "../dashboard/Search";

interface UnreadCountResponse {
  success: boolean;
  unreadCount?: number;
}

export const DashboardHeader = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const firstName = user?.fname?.trim() ?? "";
  const surnameInitial = user?.lname?.trim()?.[0]?.toUpperCase() ?? "";
  const displayName = firstName ? `${firstName}${surnameInitial ? ` ${surnameInitial}.` : ""}`
    : loading
      ? "Loading..."
      : "User";
  const initials = (
    `${user?.fname?.trim()?.[0] ?? ""}${user?.lname?.trim()?.[0] ?? ""}`
  ).toUpperCase() || "U";

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/notifications/unread-count",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) return;

      const data =
        (await response.json()) as UnreadCountResponse;

      if (
        data.success &&
        typeof data.unreadCount === "number"
      ) {
        setUnreadCount(Math.max(0, data.unreadCount));
      }
    } catch (error) {
      console.error(
        "Failed to fetch dashboard notification count:",
        error
      );
    }
  }, []);

  useEffect(() => {
    void fetchUnreadCount();

    const handleFocus = () => {
      void fetchUnreadCount();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchUnreadCount();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [fetchUnreadCount]);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    } finally {
      router.replace("/");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-[68px] items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="hidden min-w-0 flex-1 sm:block">
        <div className="max-w-[420px]">
          <ProjectSearch />
        </div>
      </div>

      <div className="flex-1 sm:hidden" />
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <Link
          href="/client/notifications"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          title="Notifications"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-500 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
        >
          <Bell
            className="h-[18px] w-[18px] transition-transform duration-200 group-hover:-rotate-6"
            strokeWidth={1.7}
          />

          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        {/* Profile */}
        <Link
          href="/client/profile"
          aria-label={`Open profile for ${displayName}`}
          title={user?.email || undefined}
          className="group flex items-center gap-2.5 rounded-xl border border-transparent py-1.5 pl-1.5 pr-2.5 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50"
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 ring-2 ring-white transition-shadow group-hover:ring-slate-200">
            {user?.image ? (
              <Image
                src={user.image}
                alt={displayName}
                width={72}
                height={72}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold tracking-wide text-slate-700">
                {initials}
              </span>
            )}

            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="max-w-[140px] truncate text-[12px] font-semibold leading-4 text-slate-800 transition-colors group-hover:text-slate-950">
              {displayName}
            </p>

            <p className="mt-0.5 text-[10px] font-medium leading-4 text-slate-400">
              {user?.role === "admin"
                ? "Administrator"
                : "Client account"}
            </p>
          </div>
        </Link>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          aria-label={loggingOut ? "Logging out" : "Log out"}
          title={loggingOut ? "Logging out..." : "Log out"}
          className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-transparent text-slate-500 transition-all duration-200 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogoutOutlined
            className="text-[18px] transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </header>
  );
};