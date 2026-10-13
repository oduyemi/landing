"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Home,
  Inbox,
  ListTodo,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LogoutOutlined } from "@ant-design/icons";



const navigation = [
  {
    label: "Dashboard",
    icon: Home,
    link: "/client",
  },
  {
    label: "Projects",
    icon: BriefcaseBusiness,
    link: "/client/projects",
  },
  {
    label: "Files",
    icon: FolderOpen,
    link: "/client/files",
  },
  {
    label: "Messages",
    icon: Inbox,
    link: "/client/messages",
  },
  {
    label: "Tasks",
    icon: ListTodo,
    link: "/client/tasks",
  },
  {
    label: "Notifications",
    icon: Bell,
    link: "/client/notifications",
    hasBadge: true,
  },
  {
    label: "Profile",
    icon: UserRound,
    link: "/client/profile",
  },
];

interface UnreadCountResponse {
  success: boolean;
  unreadCount?: number;
  error?: string;
}

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const firstName = user?.fname?.trim() ?? "";
  const surnameInitial = user?.lname?.trim()?.[0]?.toUpperCase() ?? "";
  const fullName = [user?.fname, user?.lname].filter(Boolean).join(" ").trim();
  const displayName = fullName || (loading ? "Loading profile..." : "User");
  const initials =`${user?.fname?.[0] ?? ""}${user?.lname?.[0] ?? ""}`.toUpperCase() || "U";
  const roleLabel = user?.role === "admin" ? "Administrator" : "Client";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/unread-count",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) return;
      const data = (await response.json()) as UnreadCountResponse;
      if (data.success &&
        typeof data.unreadCount === "number"
      ) {
        setUnreadCount(Math.max(0, data.unreadCount));
      }
    } catch (error) {
      console.error(
        "Failed to fetch unread notification count:",
        error
      );
    }
  }, []);

  useEffect(() => {
    void fetchUnreadCount();
  }, [fetchUnreadCount, pathname]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchUnreadCount();
      }
    };

    window.addEventListener("focus", fetchUnreadCount);
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener("focus", fetchUnreadCount);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [fetchUnreadCount]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
    <>
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#e4e4e4] bg-white text-[#333] shadow-sm transition-colors hover:bg-[#f7f7f7] lg:hidden"
      >
        <Menu className="h-4 w-4" strokeWidth={1.8} />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.button
            type="button"
            aria-label="Close navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 68 : 200,
        }}
        transition={{
          duration: 0.22,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={[
          "fixed inset-y-0 left-0 z-50 flex",
          "flex-col border-r border-[#e7e7e7] bg-white",
          "lg:relative lg:z-auto",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Logo and sidebar controls */}
        <div
          className={[
            "flex h-[72px] shrink-0 items-center border-b border-[#f0f0f0]",
            collapsed
              ? "justify-center px-3"
              : "justify-between px-5",
          ].join(" ")}
        >
          <div className="relative flex min-w-0 items-center">
            <AnimatePresence mode="wait" initial={false}>
              {!collapsed ? (
                <motion.div
                  key="expanded-logo"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  <Link href="/">
                    <Image
                      src="/images/logo/logo_black.svg"
                      alt="Site logo"
                      width={102}
                      height={28}
                      className="h-auto w-[92px]"
                      priority
                    />
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed-logo"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="flex h-8 w-8 items-center justify-center rounded-[5px] bg-[#111]"
                >
                  <Link href="/">
                    <span className="text-[11px] font-semibold tracking-[-0.04em] text-white">
                      O
                    </span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            aria-label={
              collapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            onClick={() => setCollapsed((value) => !value)}
            className={[
              "hidden h-6 w-6 items-center justify-center rounded-[4px]",
              "text-[#999] transition-colors hover:bg-[#f3f3f3] hover:text-[#222]",
              "lg:flex",
              collapsed
                ? "absolute -right-3 bg-white shadow-sm ring-1 ring-[#e7e7e7]"
                : "",
            ].join(" ")}
          >
            {collapsed ? (
              <ChevronRight
                className="h-3 w-3"
                strokeWidth={1.8}
              />
            ) : (
              <ChevronLeft
                className="h-3 w-3"
                strokeWidth={1.8}
              />
            )}
          </button>

          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-[5px] text-[#888] hover:bg-[#f5f5f5] hover:text-[#222] lg:hidden"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        {/* Navigation */}
        <nav className={[
            "flex-1 overflow-y-auto py-5",
            collapsed ? "px-2" : "px-3",
          ].join(" ")}
        >
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              const isActive =
                item.link === "/client"
                  ? pathname === "/client"
                  : pathname.startsWith(item.link);

              const showBadge =
                "hasBadge" in item &&
                item.hasBadge &&
                unreadCount > 0;

              return (
                <div
                  key={item.label}
                  className="group relative"
                >
                  <Link
                    href={item.link}
                    onClick={() => setMobileOpen(false)}
                    aria-label={
                      collapsed
                        ? `${item.label}${
                            showBadge
                              ? `, ${unreadCount} unread`
                              : ""
                          }`
                        : undefined
                    }
                    className={[
                      "relative flex h-[36px] w-full items-center rounded-[6px]",
                      "text-[10px] font-medium transition-colors",
                      collapsed
                        ? "justify-center px-0"
                        : "gap-3 px-3",
                      isActive
                        ? "bg-[#111111] text-white"
                        : "text-[#505050] hover:bg-[#f5f5f5] hover:text-[#111]",
                    ].join(" ")}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 h-[16px] w-[2px] -translate-y-1/2 rounded-r-full bg-white"
                      />
                    )}

                    <span className="relative flex shrink-0 items-center justify-center">
                      <Icon
                        strokeWidth={isActive ? 1.9 : 1.7}
                        className="h-[14px] w-[14px]"
                      />

                      {/* Badge for collapsed sidebar */}
                      {showBadge && collapsed && (
                        <span
                          aria-hidden="true"
                          className="absolute -right-[7px] -top-[6px] flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[#111] px-[3px] text-[8px] font-semibold leading-none text-white ring-2 ring-white"
                        >
                          {unreadCount > 99
                            ? "99+"
                            : unreadCount}
                        </span>
                      )}
                    </span>

                    <AnimatePresence initial={false}>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {showBadge && !collapsed && (
                      <span
                        aria-label={`${unreadCount} unread notifications`}
                        className={[
                          "ml-auto flex h-[16px] min-w-[16px] shrink-0 items-center justify-center rounded-full px-1",
                          "text-[8px] font-semibold leading-none",
                          isActive
                            ? "bg-white text-[#111]"
                            : "bg-[#111] text-white",
                        ].join(" ")}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                  {collapsed && (
                    <div className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-[70] hidden -translate-y-1/2 whitespace-nowrap rounded-[5px] bg-[#111] px-2.5 py-1.5 text-[10px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 lg:block">
                      {item.label}
                      {showBadge && ` (${unreadCount} unread)`}

                      <span className="absolute right-full top-1/2 -mr-[1px] h-0 w-0 -translate-y-1/2 border-y-[4px] border-r-[4px] border-y-transparent border-r-[#111]" />
                    </div>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label={loggingOut ? "Logging out" : "Log out"}
              title={collapsed ? "Log out" : undefined}
              className={[
                "group relative flex h-[36px] w-full items-center rounded-[6px]",
                "text-[10px] font-medium transition-colors",
                "disabled:cursor-not-allowed disabled:opacity-50",
                collapsed ? "justify-center px-0" : "gap-3 px-3",
                "text-[#777] hover:bg-rose-50 hover:text-rose-600",
              ].join(" ")}
            >
              <span className="flex shrink-0 items-center justify-center">
                <LogoutOutlined className="text-[14px] transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {loggingOut ? "Signing out..." : "Log out"}
                  </motion.span>
                )}
              </AnimatePresence>

              {collapsed && (
                <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-[70] hidden -translate-y-1/2 whitespace-nowrap rounded-[5px] bg-[#111] px-2.5 py-1.5 text-[10px] font-medium text-white opacity-0 shadow-md group-hover:opacity-100 lg:block">
                  {loggingOut ? "Signing out..." : "Log out"}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* User */}
        <div
          className={[
            "shrink-0 border-t border-[#eeeeee]",
            collapsed ? "p-3" : "px-4 py-4",
          ].join(" ")}
        >
          <Link
            href="/client/profile"
            aria-label={`Open profile for ${displayName}`}
            title={collapsed ? displayName : undefined}
            onClick={() => setMobileOpen(false)}
            className={[
              "group flex min-w-0 items-center rounded-[6px] transition-colors",
              "hover:bg-[#f7f7f7]",
              collapsed ? "justify-center p-1" : "gap-2.5 px-1.5 py-1.5",
            ].join(" ")}
          >
            <div className="relative flex h-[30px] w-[30px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e5e5e5] bg-[#ededed]">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={fullName || "Profile photo"}
                  width={60}
                  height={60}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[10px] font-semibold text-[#555]">
                  {initials}
                </span>
              )}

              <span
                aria-hidden="true"
                className="absolute bottom-0 right-0 h-[7px] w-[7px] rounded-full border-2 border-white bg-[#4a9b68]"
              />
            </div>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="min-w-0 flex-1 overflow-hidden"
                >
                  <p
                    className="truncate text-[9px] font-semibold text-[#222]"
                    title={fullName}
                  >
                    {displayName}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] capitalize text-[#8a8a8a]">
                    {roleLabel}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </motion.aside>
    </>
  );
};
