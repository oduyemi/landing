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
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

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
    badge: 1,
    link: "/client/notifications",
  },
  {
    label: "Profile",
    icon: UserRound,
    link: "/client/profile",
  },
];

export const Sidebar = () => {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#e4e4e4] bg-white text-[#333] shadow-sm transition-colors hover:bg-[#f7f7f7] lg:hidden"
      >
        <Menu
          className="h-4 w-4"
          strokeWidth={1.8}
        />
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
                  <Image
                    src="/images/logo/logo_black.svg"
                    alt="Site logo"
                    width={102}
                    height={28}
                    className="h-auto w-[92px]"
                    priority
                  />
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
                  <span className="text-[11px] font-semibold tracking-[-0.04em] text-white">
                    O
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
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
            <X
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </button>
        </div>

        <nav
          className={[
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

              return (
                <div
                  key={item.label}
                  className="group relative"
                >
                  <Link
                    href={item.link}
                    onClick={() => setMobileOpen(false)}
                    aria-label={item.label}
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

                    <Icon
                      strokeWidth={isActive ? 1.9 : 1.7}
                      className="h-[14px] w-[14px] shrink-0"
                    />

                    <AnimatePresence initial={false}>
                      {!collapsed && (
                        <motion.span
                          initial={{
                            opacity: 0,
                            width: 0,
                          }}
                          animate={{
                            opacity: 1,
                            width: "auto",
                          }}
                          exit={{
                            opacity: 0,
                            width: 0,
                          }}
                          transition={{
                            duration: 0.15,
                          }}
                          className="overflow-hidden whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {item.badge && (
                      <span
                        className={[
                          "flex items-center justify-center rounded-full",
                          "text-[10px] font-semibold",
                          collapsed
                            ? "absolute right-1 top-1 h-[14px] min-w-[14px] bg-[#111] text-white"
                            : "ml-auto h-[16px] min-w-[16px] bg-[#111] px-1 text-white",
                          isActive && !collapsed
                            ? "bg-white text-[#111]"
                            : "",
                        ].join(" ")}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>

                 {collapsed && (
                    <div className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-[70] hidden -translate-y-1/2 whitespace-nowrap rounded-[5px] bg-[#111] px-2.5 py-1.5 text-[10px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 lg:block">
                      {item.label}

                      <span className="absolute right-full top-1/2 -mr-[1px] h-0 w-0 -translate-y-1/2 border-y-[4px] border-r-[4px] border-y-transparent border-r-[#111]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div
          className={[
            "shrink-0 border-t border-[#eeeeee]",
            collapsed ? "p-3" : "px-4 py-4",
          ].join(" ")}
        >
          <div
            className={[
              "flex items-center",
              collapsed
                ? "justify-center"
                : "gap-2.5",
            ].join(" ")}
          >
            <div className="relative flex h-[30px] w-[30px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8e8e8]">
              <UserRound
                className="h-[15px] w-[15px] text-[#777]"
                strokeWidth={1.6}
              />

              <span className="absolute bottom-0 right-0 h-[7px] w-[7px] rounded-full border-2 border-white bg-[#4a9b68]" />
            </div>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{
                    opacity: 0,
                    width: 0,
                  }}
                  animate={{
                    opacity: 1,
                    width: "auto",
                  }}
                  exit={{
                    opacity: 0,
                    width: 0,
                  }}
                  transition={{ duration: 0.15 }}
                  className="min-w-0 overflow-hidden"
                >
                  <p className="truncate text-[9px] font-semibold text-[#222]">
                    Charles M.
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#8a8a8a]">
                    Client
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
};