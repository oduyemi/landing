"use client";
import {
  FolderKanban,
  Search,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  RefreshCw,
  Layers3,
  CircleDot,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProjectCard } from "@/components/client/projects/ProjectCard";
import { Project, ProjectStatus } from "@/components/client/projects/types";
import ProjectSearch from "@/components/client/dashboard/Search";
import ProjectActionDialogs from "@/components/client/projects/ActionDialogs";

type UserRole = "user" | "admin";

interface ApiProject {
  _id: string;
  title: string;
  type: string;
  image?: string | null;
  progress: number;
  status: ProjectStatus;
  startDate: string;
  deadline: string;
  description: string;
  client?: {
    _id?: string;
    fname?: string;
    lname?: string;
    image?: string | null;
    email?: string;
  } | null;
}

type Filter = "All" | "In Progress" | "Completed";

const filters: Filter[] = ["All", "In Progress", "Completed"];

const pageEase = [0.22, 1, 0.36, 1] as const;

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: pageEase,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: pageEase,
    },
  },
};

export default function ProjectsPage() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/projects", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        signal,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to load projects.");
      }

      const normalizedProjects: Project[] = (
        data.projects ?? []
      ).map((project: ApiProject) => ({
        id: project._id,
        title: project.title,
        type: project.type,
        image: project.image ?? null,
        progress: project.progress,
        status: project.status,
        startDate: project.startDate,
        deadline: project.deadline,
        description: project.description ?? "",
        client: {
          id: project.client?._id,
          fname: project.client?.fname ?? "",
          lname: project.client?.lname ?? "",
          image: project.client?.image ?? undefined,
          email: project.client?.email ?? "",
        },
      }));

      setProjects(normalizedProjects);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load projects."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);
  
  useEffect(() => {
    const controller = new AbortController();

    async function fetchSession() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          setRole(null);
          return;
        }

        const data = await response.json();
        const sessionRole = data?.user?.role;

        setRole(
          sessionRole === "admin" || sessionRole === "user"
            ? sessionRole
            : null
        );
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Failed to load the current user:", error);
        setRole(null);
      }
    }

    void fetchSession();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchProjects(controller.signal);

    return () => controller.abort();
  }, [fetchProjects]);

  const completedProjects = useMemo(
    () => projects.filter((project) => project.status === "Completed"),
    [projects]
  );

  const inProgressProjects = useMemo(
    () => projects.filter((project) => project.status === "In Progress"),
    [projects]
  );

  const activeProjects = useMemo(
    () => projects.filter((project) => project.status !== "Completed"),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesFilter =
        filter === "All" || project.status === filter;

      const matchesSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.type.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [projects, filter, search]);

  const filteredActive = filteredProjects.filter(
    (project) => project.status !== "Completed"
  );

  const filteredCompleted = filteredProjects.filter(
    (project) => project.status === "Completed"
  );

  const hasActiveFilters = Boolean(search.trim()) || filter !== "All";

  const clearFilters = () => {
    setSearch("");
    setFilter("All");
  };

  return (
    <main className="relative min-h-full overflow-hidden bg-[#f8f8f7] text-[#191919] pb-28 sm:pb-32">
      {/* Ambient page background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,1)_0%,_rgba(255,255,255,0.8)_40%,_rgba(248,248,247,0)_78%)]" />

      <div className="pointer-events-none absolute -right-32 top-20 h-72 w-72 rounded-full bg-white/70 blur-3xl" />

      <div className="relative mx-auto max-w-[1240px] px-4 pb-10 pt-6 sm:px-7 sm:pb-12 sm:pt-9 lg:px-10 lg:pt-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: pageEase }}
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="min-w-0">
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-[30px] font-semibold tracking-[-0.065em] text-[#171717] sm:text-[36px]">
                Projects
              </h1>

              {!loading && !error && projects.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e8e5] bg-white px-2.5 py-1 text-[10px] font-medium text-[#777]">
                  <Layers3 size={12} strokeWidth={1.7} />
                  {projects.length} total
                </span>
              )}
            </div>

            <p className="mt-2 max-w-[440px] text-[12px] leading-6 text-[#858585] sm:text-[13px]">
              Everything you need to track delivery, monitor progress,
              and stay on top of your project milestones.
            </p>
          </div>

          <div className="w-full lg:max-w-[300px]">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[10px] font-semibold text-[#454545]">
                Find a project
              </label>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[10px] font-medium text-[#888] transition-colors hover:text-black"
                >
                  Clear search
                </button>
              )}
            </div>

            <div className="relative rounded-xl border border-[#e7e7e4] bg-white p-1 shadow-[0_3px_12px_rgba(0,0,0,0.025)] transition-all duration-200 focus-within:border-[#c9c9c5] focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.035)]">
              <ProjectSearch />
            </div>
          </div>
        </motion.header>

        {/* Overview stats */}
        <motion.section
          aria-label="Project overview"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            delay: 0.08,
            ease: pageEase,
          }}
          className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-10"
        >
          <Stat
            icon={FolderKanban}
            label="Total projects"
            value={projects.length}
            detail="Across your workspace"
            loading={loading}
          />

          <Stat
            icon={Clock3}
            label="In progress"
            value={inProgressProjects.length}
            detail="Currently underway"
            active={inProgressProjects.length > 0}
            loading={loading}
          />

          <Stat
            icon={CheckCircle2}
            label="Completed"
            value={completedProjects.length}
            detail="Successfully delivered"
            loading={loading}
          />
        </motion.section>

        {/* Filter bar */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.16 }}
          className="mt-9 flex flex-col gap-4 border-b border-[#e5e5e1] sm:flex-row sm:items-center sm:justify-between"
        >
          <div
            className="flex items-center gap-1 overflow-x-auto"
            role="tablist"
            aria-label="Filter projects by status"
          >
            {filters.map((item) => {
              const active = filter === item;

              const count =
                item === "All"
                  ? projects.length
                  : item === "In Progress"
                    ? inProgressProjects.length
                    : completedProjects.length;

              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(item)}
                  className={[
                    "relative inline-flex shrink-0 items-center gap-2 px-3 py-3.5 text-[11px] font-medium transition-colors duration-200 sm:px-4",
                    active
                      ? "text-[#171717]"
                      : "text-[#999] hover:text-[#444]",
                  ].join(" ")}
                >
                  {item}

                  <span
                    className={[
                      "rounded-md px-1.5 py-0.5 text-[9px] tabular-nums transition-colors",
                      active
                        ? "bg-[#ededeb] text-[#444]"
                        : "bg-transparent text-[#aaa]",
                    ].join(" ")}
                  >
                    {count}
                  </span>

                  {active && (
                    <motion.span
                      layoutId="active-project-filter"
                      className="absolute inset-x-3 bottom-[-1px] h-[2px] rounded-full bg-[#202020] sm:inset-x-4"
                      transition={{ duration: 0.25, ease: pageEase }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 pb-3 sm:justify-end sm:pb-0">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-[#999]">
              <CircleDot size={12} strokeWidth={1.6} />
              {loading
                ? "Updating projects"
                : `Showing ${filteredProjects.length} of ${projects.length}`}
            </span>
          </div>
        </motion.section>

        {/* Loading state */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-7 rounded-2xl border border-[#e9e9e6] bg-white p-5 sm:p-8"
          >
            <div className="flex items-center gap-3 border-b border-[#f0f0ed] pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f2]">
                <LoaderCircle
                  className="h-5 w-5 animate-spin text-[#777]"
                  strokeWidth={1.5}
                />
              </div>

              <div>
                <p className="text-[12px] font-semibold text-[#333]">
                  Loading your projects
                </p>
                <p className="mt-1 text-[10px] text-[#999]">
                  Getting your workspace ready.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[0, 1].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-xl border border-[#efefec] p-4"
                >
                  <div className="h-32 rounded-lg bg-[#f2f2ef]" />
                  <div className="mt-4 h-3 w-2/3 rounded bg-[#ededeb]" />
                  <div className="mt-3 h-2 w-1/3 rounded bg-[#f1f1ee]" />
                  <div className="mt-5 h-1.5 rounded-full bg-[#f0f0ed]" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Error state */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-7 flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#e8e8e5] bg-white px-5 py-10 text-center shadow-[0_3px_12px_rgba(0,0,0,0.015)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ececea] bg-[#f8f8f6]">
              <FolderKanban
                className="h-5 w-5 text-[#888]"
                strokeWidth={1.5}
              />
            </div>

            <h2 className="mt-4 text-[14px] font-semibold tracking-[-0.025em] text-[#292929]">
              We couldn&apos;t load your projects
            </h2>

            <p className="mt-2 max-w-[320px] text-[11px] leading-5 text-[#888]">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void fetchProjects()}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#1c1c1c] px-4 text-[11px] font-semibold text-white transition-all hover:bg-[#363636] active:scale-[0.98]"
            >
              <RefreshCw size={13} />
              Try again
            </button>
          </motion.div>
        )}

        {/* Project lists */}
        {!loading && !error && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.07 },
              },
            }}
          >
            {filteredActive.length > 0 && (
              <motion.section
                variants={sectionVariants}
                className="mt-8"
              >
                <SectionHeading
                  title="Current projects"
                  count={filteredActive.length}
                  description="Projects currently in progress or awaiting their next milestone."
                />

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: { staggerChildren: 0.075 },
                    },
                  }}
                  className={[
                    "mt-5 grid gap-4 lg:gap-5",
                    filteredActive.length === 1
                      ? "max-w-[720px]"
                      : "md:grid-cols-2",
                  ].join(" ")}
                >
                  {filteredActive.map((project) => (
                    <motion.div
                      key={project.id}
                      variants={cardVariants}
                      className="min-w-0"
                    >
                      <ProjectCard project={project} />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.section>
            )}

            {filteredCompleted.length > 0 && (
              <motion.section
                variants={sectionVariants}
                className="mt-12"
              >
                <SectionHeading
                  title="Completed projects"
                  count={filteredCompleted.length}
                  description="A record of the projects you've successfully delivered."
                />

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: { staggerChildren: 0.06 },
                    },
                  }}
                  className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {filteredCompleted.map((project) => (
                    <motion.div
                      key={project.id}
                      variants={cardVariants}
                      className="min-w-0"
                    >
                      <ProjectCard project={project} compact />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.section>
            )}

            {/* Empty state */}
            {filteredProjects.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: pageEase }}
                className="mt-7 flex min-h-[310px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#dcdcd7] bg-white/80 px-5 py-10 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ecece8] bg-[#f8f8f6]">
                  <Search
                    className="h-5 w-5 text-[#999]"
                    strokeWidth={1.5}
                  />
                </div>

                <h2 className="mt-4 text-[14px] font-semibold tracking-[-0.025em] text-[#292929]">
                  {hasActiveFilters
                    ? "No matching projects"
                    : "Your workspace is ready"}
                </h2>

                <p className="mt-2 max-w-[300px] text-[11px] leading-5 text-[#92928e]">
                  {projects.length === 0
                    ? "Your projects will appear here when they become available."
                    : "We couldn't find any projects matching your current search and filters."}
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#1c1c1c] px-4 text-[11px] font-semibold text-white transition-colors hover:bg-[#363636]"
                  >
                    Clear filters
                  </button>
                )}
              </motion.div>
            )}

            {/* Workspace footer */}
            {projects.length > 0 && (
              <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="mt-12 flex flex-col gap-3 border-t border-[#e5e5e1] pt-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-[11px] font-semibold text-[#444]">
                    Project overview
                  </p>
                  <p className="mt-1 text-[10px] text-[#999]">
                    Your workspace at a glance.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#777]">
                  <span className="rounded-lg border border-[#e8e8e4] bg-white px-3 py-2">
                    {activeProjects.length} active
                  </span>
                  <span className="rounded-lg border border-[#e8e8e4] bg-white px-3 py-2">
                    {completedProjects.length} completed
                  </span>
                </div>
              </motion.footer>
            )}
          </motion.div>
        )}
      </div>
     
      <ProjectActionDialogs
        role={role}
        onProjectCreated={fetchProjects}
      />
    </main>
  );
}

function SectionHeading({
  title,
  count,
  description,
}: {
  title: string;
  count: number;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-[15px] font-semibold tracking-[-0.04em] text-[#222] sm:text-[16px]">
            {title}
          </h2>

          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-lg border border-[#e8e8e4] bg-white px-2 text-[10px] font-semibold tabular-nums text-[#686864]">
            {count}
          </span>
        </div>

        <p className="mt-1.5 text-[11px] leading-5 text-[#92928e]">
          {description}
        </p>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  detail,
  active = false,
  loading = false,
}: {
  icon: typeof FolderKanban;
  label: string;
  value: number;
  detail: string;
  active?: boolean;
  loading?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-2xl border border-[#e7e7e3] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.018)] transition-all duration-300 hover:border-[#d8d8d3] hover:shadow-[0_10px_30px_rgba(0,0,0,0.045)] sm:p-5"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#f8f8f6] transition-transform duration-500 group-hover:scale-110" />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ededE9] bg-[#fafaf8] transition-colors group-hover:bg-[#f2f2ef]">
            <Icon
              className="h-[17px] w-[17px] text-[#686864]"
              strokeWidth={1.6}
            />
          </div>

          <span className="text-[11px] font-medium text-[#777772]">
            {label}
          </span>
        </div>

        {active && !loading && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#777] opacity-20" />
            <span className="relative h-2 w-2 rounded-full bg-[#555]" />
          </span>
        )}
      </div>

      <div className="relative mt-5 flex items-end justify-between gap-3">
        {loading ? (
          <div className="h-9 w-14 animate-pulse rounded-md bg-[#f0f0ed]" />
        ) : (
          <p className="text-[29px] font-semibold leading-none tracking-[-0.065em] text-[#202020] tabular-nums sm:text-[32px]">
            {value.toString().padStart(2, "0")}
          </p>
        )}

        <span className="pb-0.5 text-right text-[9px] leading-4 text-[#a0a09b]">
          {detail}
        </span>
      </div>

      <div className="relative mt-4 h-px overflow-hidden bg-[#f0f0ed]">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: loading ? 0 : 1 }}
          transition={{ duration: 0.7, ease: pageEase }}
          className="h-full origin-left bg-[#c9c9c3]"
        />
      </div>
    </motion.div>
  );
}