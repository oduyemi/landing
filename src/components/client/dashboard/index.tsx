"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock3,
  FolderKanban,
  FolderOpen,
  RefreshCw,
} from "lucide-react";

import { DashboardHeader } from "@/components/client/layout/Header";
import { StatCard } from "@/components/client/layout/StatsCard";
import { ProjectCard } from "@/components/client/layout/ProjectCard";
import { ActionRequired } from "@/components/client/layout/ActionRequired";
import { RecentActivity } from "@/components/client/layout/RecentActivities";
import ProjectActionDialogs from "@/components/client/projects/ActionDialogs";
import { useAuth } from "@/context/AuthContext";

type ProjectStatus =
  | "Planning"
  | "In Progress"
  | "Completed"
  | "On Hold"
  | "Cancelled";

type UserRole = "user" | "admin";

interface Project {
  _id: string;
  title: string;
  type: string;
  image?: string | null;
  progress: number;
  status: ProjectStatus;
  startDate: string;
  deadline: string;
  description?: string;
  cloudinaryFolder?: string;
  client: {
    _id: string;
    fname: string;
    lname: string;
    email: string;
    image?: string | null;
    role: UserRole;
  };
  createdAt?: string;
  updatedAt?: string;
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

export function ClientDashboard() {
  const { user, loading: userLoading } = useAuth();
  const firstName = user?.fname?.trim();

  const role: UserRole | null =
    user?.role === "admin" || user?.role === "user"
      ? user.role
      : null;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingActionCount, setPendingActionCount] = useState(0);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/projects", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to load your projects.");
      }

      setProjects(Array.isArray(data.projects) ? data.projects : []);
    } catch (error) {
      console.error("FETCH DASHBOARD PROJECTS ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load your projects."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const activeProjects = useMemo(
    () => projects.filter((project) => project.status !== "Completed"),
    [projects]
  );

  const pastProjects = useMemo(
    () => projects.filter((project) => project.status === "Completed"),
    [projects]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/notifications/unread-count", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (
          isMounted &&
          data.success &&
          typeof data.unreadCount === "number"
        ) {
          setUnreadCount(Math.max(0, data.unreadCount));
        }
      } catch (error) {
        console.error("FETCH DASHBOARD NOTIFICATIONS ERROR:", error);
      }
    };

    void fetchUnreadCount();

    const handleFocus = () => void fetchUnreadCount();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchUnreadCount();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchPendingActions = async () => {
      try {
        const response = await fetch("/api/tasks/action-required", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (
          isMounted &&
          data.success &&
          typeof data.count === "number"
        ) {
          setPendingActionCount(Math.max(0, data.count));
        }
      } catch (error) {
        console.error("FETCH PENDING ACTIONS ERROR:", error);
      }
    };

    void fetchPendingActions();

    const handleFocus = () => void fetchPendingActions();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchPendingActions();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-[1600px] px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:px-9 lg:pt-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-7 sm:space-y-9"
        >
          {/* Welcome */}
          <motion.section
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl border border-[#eaeaea] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] sm:p-7 lg:p-8"
          >
            <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-[#f4f4f4] blur-3xl" />
            <div className="pointer-events-none absolute right-24 top-16 h-20 w-20 rounded-full border border-[#f0f0f0]" />

            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                {/* <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ededed] bg-[#fafafa] px-3 py-1.5 text-[11px] font-medium text-[#666]">
                  Your project workspace
                </div> */}

                <h1 className="text-2xl font-semibold tracking-[-0.045em] text-[#191919] sm:text-3xl lg:text-[34px]">
                  {userLoading
                    ? "Welcome back"
                    : `Hello${firstName ? `, ${firstName}` : ""}`}
                  <span className="text-[#b8b8b8]">.</span>
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[#777] sm:text-[15px]">
                  Here’s your overview. Keep track of project progress,
                  upcoming actions, and the latest activity in one place.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-[#ededed] bg-white px-3.5 py-2.5 text-xs text-[#666] sm:self-auto">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Workspace overview
              </div>
            </div>

            <div className="relative mt-6 border-t border-[#f0f0f0] pt-4">
              <p className="text-xs font-medium text-[#777]">
                {formatDate(new Date())}
              </p>
            </div>
          </motion.section>

          {/* Overview statistics */}
          <motion.section variants={itemVariants}>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-[#202020]">
                  At a glance
                </h2>
                <p className="mt-1 text-xs text-[#858585]">
                  A quick overview of your workspace.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              <div className="min-w-0 rounded-xl border border-[#eaeaea] bg-white p-2.5 transition-shadow hover:shadow-sm sm:rounded-2xl sm:p-4">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f3f3] text-[#333] sm:mb-3 sm:h-9 sm:w-9">
                  <FolderKanban size={17} />
                </div>
                <StatCard
                  value={activeProjects.length}
                  label="Active Projects"
                />
              </div>

              <Link
                href="/client/tasks"
                aria-label={`${pendingActionCount} tasks requiring action`}
                className="group min-w-0 rounded-xl outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[#777] sm:rounded-2xl"
              >
                <div className="h-full rounded-xl border border-[#eaeaea] bg-white p-2.5 transition-all group-hover:border-[#d6d6d6] group-hover:shadow-sm sm:rounded-2xl sm:p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 sm:mb-3 sm:h-9 sm:w-9">
                    <Clock3 size={17} />
                  </div>
                  <StatCard
                    value={pendingActionCount}
                    label="Pending Action"
                  />
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#777] group-hover:text-[#222]">
                    Review tasks <ArrowRight size={12} />
                  </span>
                </div>
              </Link>

              <Link
                href="/client/notifications"
                aria-label={`${unreadCount} unread notifications`}
                className="group min-w-0 rounded-xl outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[#777] sm:rounded-2xl"
              >
                <div className="h-full rounded-xl border border-[#eaeaea] bg-white p-2.5 transition-all group-hover:border-[#d6d6d6] group-hover:shadow-sm sm:rounded-2xl sm:p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 sm:mb-3 sm:h-9 sm:w-9">
                    <Bell size={17} />
                  </div>
                  <StatCard
                    value={unreadCount}
                    label="Unread Notifications"
                  />
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#777] group-hover:text-[#222]">
                    View updates <ArrowRight size={12} />
                  </span>
                </div>
              </Link>

              <div className="min-w-0 rounded-xl border border-[#eaeaea] bg-white p-2.5 transition-shadow hover:shadow-sm sm:rounded-2xl sm:p-4">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 sm:mb-3 sm:h-9 sm:w-9">
                  <CheckCircle2 size={17} />
                </div>
                <StatCard
                  value={pastProjects.length}
                  label="Past Projects"
                />
              </div>
            </div>
          </motion.section>

          {/* Current projects */}
          <motion.section variants={itemVariants}>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold tracking-tight text-[#202020]">
                    Current projects
                  </h2>
                  {!loading && (
                    <span className="rounded-full bg-[#ededed] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-[#666]">
                      {activeProjects.length}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#858585]">
                  Work that is currently underway.
                </p>
              </div>

              <Link
                href="/client/projects"
                className="group inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-[#666] transition hover:bg-white hover:text-[#111]"
              >
                View all
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-[#eaeaea] bg-white p-5"
                  >
                    <div className="flex gap-4">
                      <div className="h-16 w-16 shrink-0 rounded-xl bg-[#f0f0f0]" />
                      <div className="flex-1 space-y-3 py-1">
                        <div className="h-3 w-2/5 rounded bg-[#ededed]" />
                        <div className="h-3 w-4/5 rounded bg-[#f2f2f2]" />
                        <div className="h-2 w-full rounded-full bg-[#f0f0f0]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-100 bg-white px-5 py-10 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <RefreshCw size={17} />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-[#292929]">
                  We couldn’t load your projects
                </h3>
                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[#888]">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => void fetchProjects()}
                  className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#191919] px-4 text-xs font-semibold text-white transition hover:bg-[#333]"
                >
                  <RefreshCw size={13} />
                  Try again
                </button>
              </div>
            ) : activeProjects.length > 0 ? (
              <div
                className={`grid grid-cols-1 gap-4 ${
                  activeProjects.length > 1 ? "xl:grid-cols-2" : ""
                }`}
              >
                {activeProjects.map((project) => (
                  <ProjectCard
                    key={project._id}
                    id={project._id}
                    title={project.title}
                    type={project.type}
                    image={project.image}
                    progress={project.progress}
                    status={project.status}
                    deadline={project.deadline}
                    featured={activeProjects.length === 1}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#dedede] bg-white px-5 py-12 text-center sm:py-14">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ededed] bg-[#fafafa] text-[#777]">
                  <FolderOpen size={21} strokeWidth={1.6} />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[#262626]">
                  No active projects yet
                </h3>
                <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-[#858585]">
                  When a project is assigned to you, it will appear here.
                  You can also submit a request to get started.
                </p>
              </div>
            )}
          </motion.section>

          {/* Actions and recent activity */}
          <motion.section
            variants={itemVariants}
            className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5"
          >
            <div className="min-w-0 rounded-2xl border border-[#eaeaea] bg-white p-4 sm:p-5">
              <ActionRequired />
            </div>
            <div className="min-w-0 rounded-2xl border border-[#eaeaea] bg-white p-4 sm:p-5">
              <RecentActivity />
            </div>
          </motion.section>

          {/* Completed projects */}
          {!loading && pastProjects.length > 0 && (
            <motion.section variants={itemVariants}>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold tracking-tight text-[#202020]">
                      Completed projects
                    </h2>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-700">
                      {pastProjects.length}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#858585]">
                    Your finished work and project history.
                  </p>
                </div>

                <Link
                  href="/client/projects"
                  className="group inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-[#666] transition hover:bg-white hover:text-[#111]"
                >
                  View archive
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </div>

              <div className="space-y-3">
                {pastProjects.map((project) => (
                  <ProjectCard
                    key={project._id}
                    id={project._id}
                    title={project.title}
                    type={project.type}
                    image={project.image}
                    progress={project.progress}
                    status={project.status}
                    deadline={project.deadline}
                    compact
                  />
                ))}
              </div>
            </motion.section>
          )}
        </motion.div>
      </main>

      <ProjectActionDialogs
        role={role}
        onProjectCreated={fetchProjects}
      />
    </div>
  );
}
