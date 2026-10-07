"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FolderOpen,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { ProjectCard } from "../client/projects/ProjectCard";
import type { Project } from "../client/projects/types";

export type ProjectStatus = "In Progress" | "Completed";

export interface ClientProject extends Project {
  id: string;
  title: string;
  type: string;
  image?: string | null;
  progress: number;
  status: ProjectStatus;
  startDate: string;
  deadline: string;
  description: string;
  client: {
    id?: string;
    fname: string;
    lname: string;
    image?: string;
    email: string;
  };
}

interface ApiProject {
  _id?: string;
  id?: string;
  title: string;
  type?: string;
  image?: string | null;
  progress?: number;
  status?: string;
  startDate?: string;
  deadline?: string;
  description?: string;
  client?: {
    _id?: string;
    fname?: string;
    lname?: string;
    image?: string | null;
    email?: string;
  } | null;
}

function normalizeProject(project: ApiProject): ClientProject {
  const status: ProjectStatus =
    project.status === "Completed" ? "Completed" : "In Progress";

  return {
    id: project._id ?? project.id ?? "",
    title: project.title,
    type: project.type ?? "Project",
    image: project.image ?? null,
    progress:
      project.progress ?? (status === "Completed" ? 100 : 0),
    status,
    startDate: project.startDate ?? "",
    deadline: project.deadline ?? "",
    description: project.description ?? "",
    client: {
      id: project.client?._id,
      fname: project.client?.fname ?? "",
      lname: project.client?.lname ?? "",
      image: project.client?.image ?? undefined,
      email: project.client?.email ?? "",
    },
  };
}

type Filter = "All" | "In Progress" | "Completed";

const filters: Filter[] = [
  "All",
  "In Progress",
  "Completed",
];

export const AllProjects = () => {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(
    async (options?: { refresh?: boolean }) => {
      const controller = new AbortController();

      try {
        if (options?.refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setError(null);

        const response = await fetch("/api/projects/general", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to load projects (${response.status}).`
          );
        }

        const data: unknown = await response.json();

        const rawProjects: ApiProject[] =
          Array.isArray(data)
            ? (data as ApiProject[])
            : typeof data === "object" && data !== null
              ? (
                  (data as {
                    projects?: ApiProject[];
                    data?: ApiProject[];
                  }).projects ??
                  (data as {
                    projects?: ApiProject[];
                    data?: ApiProject[];
                  }).data ??
                  []
                )
              : [];

        const normalizedProjects = rawProjects
          .map(normalizeProject)
          .filter(
            (project) => project.id && project.title
          );

        setProjects(normalizedProjects);
      } catch (err) {
        if (
          err instanceof Error &&
          err.name !== "AbortError"
        ) {
          setError(
            err.message || "Unable to load projects."
          );
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }

      return () => controller.abort();
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (cancelled) return;
      await fetchProjects();
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [fetchProjects]);

  const activeProjects = useMemo(
    () =>
      projects.filter(
        (project) => project.status === "In Progress"
      ),
    [projects]
  );

  const completedProjects = useMemo(
    () =>
      projects.filter(
        (project) => project.status === "Completed"
      ),
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
        project.type.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [projects, filter, search]);

  const filteredActiveProjects = useMemo(
    () =>
      filteredProjects.filter(
        (project) => project.status === "In Progress"
      ),
    [filteredProjects]
  );

  const filteredCompletedProjects = useMemo(
    () =>
      filteredProjects.filter(
        (project) => project.status === "Completed"
      ),
    [filteredProjects]
  );

  const hasFilters =
    search.trim().length > 0 || filter !== "All";

  const clearFilters = () => {
    setSearch("");
    setFilter("All");
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#181818]">
      <section className="relative overflow-hidden border-b border-[#e8e8e8] bg-white">
        <div className="relative mx-auto max-w-[1280px] px-6 pb-14 pt-16 sm:px-10 sm:pb-18 sm:pt-20 lg:px-14 lg:pb-20 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-[900px]"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-9 bg-[#181818]" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#777]">
                Selected projects
              </span>
            </div>

            <h1 className="max-w-[850px] text-[42px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#141414] sm:text-[58px] lg:text-[76px]">
              Digital work,
              <br />
              <span className="text-[#a0a0a0]">
                built with purpose.
              </span>
            </h1>

            <p className="mt-7 max-w-[560px] text-[13px] leading-6 text-[#777] sm:text-[14px]">
              Explore websites, applications, and digital
              experiences currently being developed or
              already brought to completion.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-12 border-t border-[#ededed] pt-6"
          >
            <div className="grid max-w-[700px] grid-cols-3">
              <HeroStat
                value={projects.length}
                label="Projects"
              />

              <HeroStat
                value={activeProjects.length}
                label="In progress"
                bordered
              />

              <HeroStat
                value={completedProjects.length}
                label="Completed"
                bordered
              />
            </div>
          </motion.div>
        </div>
        <div className="pointer-events-none absolute -bottom-36 -right-24 h-[420px] w-[420px] rounded-full border border-[#eeeeee]" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-[300px] w-[300px] rounded-full border border-[#f1f1f1]" />
        <div className="pointer-events-none absolute right-[11%] top-[18%] h-1.5 w-1.5 rounded-full bg-[#d5d5d5]" />
      </section>

      <div className="mx-auto max-w-[1280px] px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        {isLoading && (
          <LoadingState />
        )}
        {!isLoading && error && (
          <ErrorState
            error={error}
            onRetry={() => void fetchProjects()}
            isRefreshing={isRefreshing}
          />
        )}

        {!isLoading && !error && (
          <>
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mb-14"
            >
              <div className="flex flex-col gap-5 border-b border-[#e5e5e5] pb-5 lg:flex-row lg:items-center lg:justify-between">
                {/* Search */}
                <div className="relative w-full lg:max-w-[360px]">
                  <Search
                    className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888]"
                    strokeWidth={1.5}
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search projects..."
                    className="h-10 w-full border-b border-[#dcdcdc] bg-transparent pl-7 pr-8 text-[11px] text-[#222] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#222]"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="absolute right-0 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-[#999] transition-colors hover:text-[#222]"
                    >
                      <X
                        className="h-3.5 w-3.5"
                        strokeWidth={1.6}
                      />
                    </button>
                  )}
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 lg:justify-end">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal
                      className="mr-1 h-3.5 w-3.5 text-[#888]"
                      strokeWidth={1.5}
                    />

                    <div className="flex flex-wrap items-center gap-1">
                      {filters.map((item) => {
                        const count =
                          item === "All"
                            ? projects.length
                            : item === "In Progress"
                              ? activeProjects.length
                              : completedProjects.length;

                        const active = filter === item;

                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setFilter(item)}
                            className="relative rounded-full px-3 py-2 text-[10px] transition-colors"
                          >
                            {active && (
                              <motion.span
                                layoutId="project-filter"
                                className="absolute inset-0 rounded-full bg-[#181818]"
                                transition={{
                                  type: "spring",
                                  stiffness: 420,
                                  damping: 32,
                                }}
                              />
                            )}

                            <span
                              className={[
                                "relative z-10 flex items-center gap-1.5",
                                active
                                  ? "font-medium text-white"
                                  : "text-[#777] hover:text-[#222]",
                              ].join(" ")}
                            >
                              {item}

                              <span
                                className={[
                                  "text-[8px]",
                                  active
                                    ? "text-white/60"
                                    : "text-[#aaa]",
                                ].join(" ")}
                              >
                                {count}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void fetchProjects({
                        refresh: true,
                      })
                    }
                    disabled={isRefreshing}
                    className="group flex h-8 items-center gap-2 rounded-full border border-[#e2e2e2] bg-white px-3 text-[9px] font-medium text-[#666] transition-all hover:border-[#ccc] hover:text-[#222] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw
                      className={[
                        "h-3 w-3 transition-transform",
                        isRefreshing
                          ? "animate-spin"
                          : "group-hover:rotate-45",
                      ].join(" ")}
                      strokeWidth={1.5}
                    />

                    <span>
                      {isRefreshing
                        ? "Refreshing"
                        : "Refresh"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#aaa]">
                  {filteredProjects.length}{" "}
                  {filteredProjects.length === 1
                    ? "project"
                    : "projects"}{" "}
                  shown
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[9px] font-medium text-[#555] underline underline-offset-4 transition-colors hover:text-[#111]"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </motion.section>

            {(filter === "All" ||
              filter === "In Progress") &&
              filteredActiveProjects.length > 0 && (
                <ProjectSection
                  title="Currently in progress"
                  description="Projects actively being designed, developed, and refined."
                  icon={
                    <Clock3
                      className="h-4 w-4"
                      strokeWidth={1.4}
                    />
                  }
                  projects={filteredActiveProjects}
                  featured
                />
              )}

            {(filter === "All" ||
              filter === "Completed") &&
              filteredCompletedProjects.length > 0 && (
                <ProjectSection
                  title="Completed work"
                  description="Finished digital products, experiences, and client work."
                  icon={
                    <CheckCircle2
                      className="h-4 w-4"
                      strokeWidth={1.4}
                    />
                  }
                  projects={filteredCompletedProjects}
                />
              )}

            {filteredProjects.length === 0 && (
              <EmptyState
                hasProjects={projects.length > 0}
                hasFilters={hasFilters}
                onClear={clearFilters}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
};

function HeroStat({
  value,
  label,
  bordered = false,
}: {
  value: number;
  label: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-3",
        bordered
          ? "border-l border-[#e4e4e4] pl-5 sm:pl-7"
          : "",
      ].join(" ")}
    >
      <span className="text-[24px] font-semibold leading-none tracking-[-0.045em] text-[#181818] sm:text-[28px]">
        {value}
      </span>

      <span className="max-w-[70px] text-[8px] font-medium uppercase leading-3 tracking-[0.13em] text-[#999] sm:text-[9px]">
        {label}
      </span>
    </div>
  );
}

interface ProjectSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  projects: ClientProject[];
  featured?: boolean;
}

function ProjectSection({
  title,
  description,
  icon,
  projects,
  featured = false,
}: ProjectSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="mb-20 last:mb-0"
    >
      {/* Section heading */}
      <div className="mb-7 flex flex-col gap-4 border-b border-[#ededed] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-[#777]">
              {icon}
            </span>

            <h2 className="text-[19px] font-semibold tracking-[-0.035em] text-[#181818] sm:text-[22px]">
              {title}
            </h2>

            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ededed] px-2 text-[9px] font-semibold text-[#666]">
              {projects.length}
            </span>
          </div>

          <p className="mt-2 max-w-[520px] text-[11px] leading-5 text-[#999]">
            {description}
          </p>
        </div>

        <a
          href="https://oduyemi.dev/projects"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-fit items-center gap-2 text-[9px] font-medium uppercase tracking-[0.14em] text-[#999] transition-colors hover:text-[#222]"
        >
          <span>Explore all</span>

          <ArrowUpRight
            className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={1.5}
          />
        </a>
      </div>

      {/* Cards */}
      <div
        className={[
          "grid gap-5 sm:gap-6",
          featured
            ? "grid-cols-1 lg:grid-cols-2"
            : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
        ].join(" ")}
      >
        <AnimatePresence mode="popLayout">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              layout
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -12,
              }}
              transition={{
                duration: 0.45,
                delay: Math.min(index * 0.045, 0.22),
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <ProjectCard
                project={project}
                compact={!featured}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-10"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-[10px] border border-[#e7e7e7] bg-white"
          >
            <div className="aspect-[16/9] animate-pulse bg-[#f0f0f0]" />

            <div className="space-y-3 p-5">
              <div className="h-3 w-2/5 animate-pulse rounded bg-[#eeeeee]" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-[#eeeeee]" />
              <div className="h-2.5 w-full animate-pulse rounded bg-[#f1f1f1]" />
              <div className="h-2.5 w-4/5 animate-pulse rounded bg-[#f1f1f1]" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#222]" />

        <span className="text-[10px] text-[#888]">
          Loading projects
        </span>
      </div>
    </motion.div>
  );
}

function ErrorState({
  error,
  onRetry,
  isRefreshing,
}: {
  error: string;
  onRetry: () => void;
  isRefreshing: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[420px] flex-col items-center justify-center text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
        <FolderOpen
          className="h-5 w-5 text-[#777]"
          strokeWidth={1.4}
        />
      </div>

      <h2 className="mt-5 text-[16px] font-medium tracking-[-0.02em]">
        Unable to load projects
      </h2>

      <p className="mt-2 max-w-[320px] text-[11px] leading-5 text-[#888]">
        {error}
      </p>

      <button
        type="button"
        onClick={onRetry}
        disabled={isRefreshing}
        className="mt-6 flex items-center gap-2 rounded-full bg-[#181818] px-5 py-2.5 text-[10px] font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#000] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw
          className={[
            "h-3 w-3",
            isRefreshing ? "animate-spin" : "",
          ].join(" ")}
          strokeWidth={1.5}
        />

        {isRefreshing ? "Retrying..." : "Try again"}
      </button>
    </motion.div>
  );
}

function EmptyState({
  hasProjects,
  hasFilters,
  onClear,
}: {
  hasProjects: boolean;
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-[380px] flex-col items-center justify-center border-y border-[#e5e5e5] px-6 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
        <Search
          className="h-5 w-5 text-[#999]"
          strokeWidth={1.2}
        />
      </div>

      <h2 className="mt-5 text-[18px] font-medium tracking-[-0.025em]">
        {hasProjects
          ? "Nothing matched your search"
          : "No projects yet"}
      </h2>

      <p className="mt-2 max-w-[320px] text-[11px] leading-5 text-[#999]">
        {hasProjects
          ? "Try another project name, type, or remove the current filter."
          : "Projects will appear here once they have been added."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-6 rounded-full border border-[#ddd] bg-white px-4 py-2 text-[9px] font-medium text-[#555] transition-all hover:border-[#bbb] hover:text-[#111]"
        >
          Clear filters
        </button>
      )}
    </motion.div>
  );
}