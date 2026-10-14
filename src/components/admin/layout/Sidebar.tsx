"use client";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Home,
  Inbox,
  ListTodo,
  LogOut,
  Menu,
  Settings2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navigation = [
  { label: "Dashboard", icon: Home, link: "/admin" },
  { label: "Clients", icon: Users, link: "/admin/clients" },
  { label: "Projects", icon: BriefcaseBusiness, link: "/admin/projects" },
  { label: "Tasks", icon: ListTodo, link: "/admin/tasks" },
  { label: "Files", icon: FolderOpen, link: "/admin/files" },
  { label: "Messages", icon: Inbox, link: "/admin/messages" },
  {
    label: "Notifications",
    icon: Bell,
    link: "/admin/notifications",
    hasBadge: true,
  },
  { label: "Activity", icon: Activity, link: "/admin/activity" },
];

interface UnreadCountResponse {
  success: boolean;
  unreadCount?: number;
  error?: string;
}

function isNavigationActive(pathname: string, link: string) {
  if (link === "/admin") return pathname === "/admin";

  return pathname === link || pathname.startsWith(`${link}/`);
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  const fullName = [user?.fname, user?.lname]
    .filter(Boolean)
    .join(" ")
    .trim();

  const displayName =
    fullName || (loading ? "Loading profile..." : "Administrator");

  const initials =
    `${user?.fname?.[0] ?? ""}${user?.lname?.[0] ?? ""}`
      .toUpperCase() || "A";

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/unread-count", {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) return;

      const data = (await response.json()) as UnreadCountResponse;

      if (data.success && typeof data.unreadCount === "number") {
        setUnreadCount(Math.max(0, data.unreadCount));
      }
    } catch (error) {
      console.error("Failed to fetch unread notifications:", error);
    }
  }, []);

  useEffect(() => {
    void fetchUnreadCount();
  }, [fetchUnreadCount, pathname]);

  useEffect(() => {
    const onFocus = () => void fetchUnreadCount();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchUnreadCount();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fetchUnreadCount]);

  // Close the mobile drawer after route navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent the page behind the drawer from scrolling.
  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  // Close the drawer when switching to desktop layout.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Failed to log out:", error);
      setLoggingOut(false);
    }
  };

  const effectiveCollapsed = collapsed && !mobileOpen;

  const sidebarWidth = mobileOpen
    ? 288
    : collapsed
      ? 76
      : 248;

  return (
    <>
      {/* Mobile navigation trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open admin navigation"
        aria-expanded={mobileOpen}
        aria-controls="admin-sidebar"
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-800 shadow-sm transition hover:bg-neutral-50 active:scale-95 lg:hidden"
      >
        <Menu size={19} strokeWidth={1.8} />
      </button>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.button
            type="button"
            aria-label="Close navigation backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-neutral-950/40 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        id="admin-sidebar"
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{
          width: {
            duration: 0.24,
            ease: [0.22, 1, 0.36, 1],
          },
        }}
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-dvh max-h-dvh flex-col",
          "border-r border-neutral-200/80 bg-white",
          "shadow-[0_8px_35px_rgba(0,0,0,0.035)]",
          "transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:z-auto lg:h-auto lg:max-h-none lg:translate-x-0 lg:shadow-none",
          "shrink-0",
        ].join(" ")}
        style={{
          width: sidebarWidth,
          maxWidth: "calc(100vw - 24px)",
        }}
      >
        {/* Brand header */}
        <div
          className={[
            "flex h-[72px] shrink-0 items-center border-b border-neutral-100",
            effectiveCollapsed
              ? "justify-center px-3"
              : "justify-between gap-3 px-5",
          ].join(" ")}
        >
          <Link
            href="/"
            aria-label="Admin dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex min-w-0 items-center"
          >
            <AnimatePresence mode="wait" initial={false}>
              {effectiveCollapsed ? (
                <motion.span
                  key="mark"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.14 }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-sm font-bold tracking-tight text-white"
                >
                  O
                </motion.span>
              ) : (
                <motion.span
                  key="logo"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.14 }}
                  className="block min-w-0"
                >
                  <Image
                    src="/images/logo/logo_black.svg"
                    alt="Òduyémi"
                    width={130}
                    height={34}
                    priority
                    className="h-auto w-[112px] max-w-full"
                  />
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
          >
            <X size={19} />
          </button>

          {/* Desktop collapse control */}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className={[
              "hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              "text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
              "lg:flex",
              effectiveCollapsed
                ? "absolute -right-3.5 top-[22px] z-10 border border-neutral-200 bg-white text-neutral-700 shadow-sm"
                : "",
            ].join(" ")}
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>

        {/* Workspace navigation */}
        <nav
          aria-label="Admin navigation"
          className={[
            "flex-1 overflow-x-hidden overflow-y-auto overscroll-contain py-6",
            effectiveCollapsed ? "px-3" : "px-4",
          ].join(" ")}
        >
          <div className="mb-3 flex h-5 items-center px-2">
            {!effectiveCollapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400"
              >
                Workspace
              </motion.p>
            )}
          </div>

          <div className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isNavigationActive(pathname, item.link);
              const showBadge = Boolean(item.hasBadge && unreadCount > 0);

              return (
                <div key={item.link} className="group relative">
                  <Link
                    href={item.link}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    title={effectiveCollapsed ? item.label : undefined}
                    className={[
                      "relative flex min-h-[44px] items-center rounded-xl",
                      "text-[12px] font-medium transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2",
                      effectiveCollapsed
                        ? "justify-center px-0"
                        : "gap-3 px-3",
                      active
                        ? "bg-neutral-950 text-white shadow-[0_3px_8px_rgba(0,0,0,0.10)]"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
                    ].join(" ")}
                  >
                    {active && (
                      <motion.span
                        layoutId="admin-sidebar-active"
                        className="absolute inset-0 rounded-xl bg-neutral-950"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        }}
                        style={{ zIndex: 0 }}
                      />
                    )}

                    <span className="relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center">
                      <Icon
                        size={18}
                        strokeWidth={active ? 2 : 1.7}
                      />
                    </span>

                    {!effectiveCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-[1] min-w-0 flex-1 truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}

                    {showBadge && (
                      <span
                        className={[
                          "relative z-[2] flex min-h-[19px] min-w-[19px] shrink-0 items-center justify-center rounded-full px-1",
                          "text-[9px] font-bold leading-none",
                          effectiveCollapsed
                            ? "absolute right-0.5 top-1"
                            : "",
                          active
                            ? "bg-white text-neutral-950"
                            : "bg-neutral-950 text-white",
                        ].join(" ")}
                        aria-label={`${unreadCount} unread notifications`}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Tooltips for the collapsed desktop rail */}
                  {effectiveCollapsed && (
                    <span
                      className={[
                        "pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-[80]",
                        "-translate-y-1/2 translate-x-1 whitespace-nowrap rounded-lg",
                        "border border-neutral-700 bg-neutral-950 px-3 py-2",
                        "text-[11px] font-medium text-white shadow-xl",
                        "opacity-0 transition-all duration-150",
                        "group-hover:translate-x-0 group-hover:opacity-100",
                        "group-focus-within:translate-x-0 group-focus-within:opacity-100",
                        "hidden lg:block",
                      ].join(" ")}
                    >
                      {item.label}
                      {showBadge ? ` · ${unreadCount} unread` : ""}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="my-6 border-t border-neutral-100" />

          {!effectiveCollapsed && (
            <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Preferences
            </p>
          )}

          <div className="group relative">
            <Link
              href="/admin/settings"
              onClick={() => setMobileOpen(false)}
              title={effectiveCollapsed ? "Settings" : undefined}
              aria-current={
                isNavigationActive(pathname, "/admin/settings")
                  ? "page"
                  : undefined
              }
              className={[
                "flex min-h-[44px] items-center rounded-xl text-[12px] font-medium",
                "text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-950",
                effectiveCollapsed
                  ? "justify-center px-0"
                  : "gap-3 px-3",
              ].join(" ")}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                <Settings2 size={18} strokeWidth={1.7} />
              </span>

              {!effectiveCollapsed && <span>Settings</span>}
            </Link>

            {effectiveCollapsed && (
              <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-[80] hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-neutral-950 px-3 py-2 text-[11px] font-medium text-white opacity-0 shadow-xl transition group-hover:opacity-100 lg:block">
                Settings
              </span>
            )}
          </div>
        </nav>

        {/* Account section */}
        <div
          className={[
            "shrink-0 border-t border-neutral-100 bg-neutral-50/70",
            effectiveCollapsed ? "p-3" : "p-4",
          ].join(" ")}
        >
          {!effectiveCollapsed && (
            <p className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
              Your account
            </p>
          )}

          <Link
            href="/admin/profile"
            onClick={() => setMobileOpen(false)}
            title={effectiveCollapsed ? displayName : undefined}
            className={[
              "flex min-w-0 items-center rounded-xl transition-colors",
              "hover:bg-white hover:shadow-sm",
              effectiveCollapsed
                ? "justify-center p-1"
                : "gap-3 px-2 py-2",
            ].join(" ")}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-white">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={fullName || "Profile"}
                  width={80}
                  height={80}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold tracking-wide text-neutral-700">
                  {initials}
                </span>
              )}
            </div>

            {!effectiveCollapsed && (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-semibold text-neutral-900">
                  {displayName}
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-[10px] text-neutral-500">
                  <ShieldCheck size={12} />
                  Administrator
                </span>
              </span>
            )}

            {!effectiveCollapsed && (
              <ArrowUpRight
                size={15}
                className="shrink-0 text-neutral-400"
              />
            )}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title={effectiveCollapsed ? "Log out" : undefined}
            className={[
              "mt-2 flex min-h-[42px] w-full items-center rounded-xl",
              "text-[11px] font-medium text-neutral-500 transition-colors",
              "hover:bg-rose-50 hover:text-rose-700",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300",
              "disabled:cursor-not-allowed disabled:opacity-50",
              effectiveCollapsed
                ? "justify-center px-0"
                : "gap-3 px-3",
            ].join(" ")}
          >
            <LogOut size={17} strokeWidth={1.8} />
            {!effectiveCollapsed && (
              <span>{loggingOut ? "Signing out..." : "Log out"}</span>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
