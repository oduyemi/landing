
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Command,
  FolderOpen,
  Layers3,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
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

type Filter = "All" | "In Progress" | "Completed";

const filters: Filter[] = ["All", "In Progress", "Completed"];

function normalizeProject(project: ApiProject): ClientProject {
  const status: ProjectStatus =
    project.status === "Completed" ? "Completed" : "In Progress";

  const progress = Math.min(
    100,
    Math.max(0, project.progress ?? (status === "Completed" ? 100 : 0))
  );

  return {
    id: project._id ?? project.id ?? "",
    title: project.title,
    type: project.type ?? "Digital project",
    image: project.image ?? null,
    progress,
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

function parseProjects(data: unknown): ApiProject[] {
  if (Array.isArray(data)) {
    return data as ApiProject[];
  }

  if (typeof data !== "object" || data === null) {
    return [];
  }

  const response = data as {
    projects?: unknown;
    data?: unknown;
  };

  if (Array.isArray(response.projects)) {
    return response.projects as ApiProject[];
  }

  if (Array.isArray(response.data)) {
    return response.data as ApiProject[];
  }

  return [];
}

export const AllProjects = () => {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const reduceMotion = useReducedMotion();

  const fetchProjects = useCallback(
    async (options?: { refresh?: boolean }) => {
      controllerRef.current?.abort();

      const controller = new AbortController();
      controllerRef.current = controller;

      if (options?.refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const response = await fetch("/api/projects/general", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Unable to load projects (${response.status}).`);
        }

        const data: unknown = await response.json();
        const normalizedProjects = parseProjects(data)
          .filter(
            (project) =>
              typeof project.title === "string" && project.title.trim()
          )
          .map(normalizeProject)
          .filter((project) => Boolean(project.id && project.title));

        if (!controller.signal.aborted) {
          setProjects(normalizedProjects);
        }
      } catch (err) {
        if (
          err instanceof Error &&
          err.name !== "AbortError" &&
          !controller.signal.aborted
        ) {
          setError(err.message || "Something went wrong while loading projects.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    void fetchProjects();

    return () => {
      controllerRef.current?.abort();
    };
  }, [fetchProjects]);

  const activeProjects = useMemo(
    () => projects.filter((project) => project.status === "In Progress"),
    [projects]
  );

  const completedProjects = useMemo(
    () => projects.filter((project) => project.status === "Completed"),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesFilter = filter === "All" || project.status === filter;

      const searchableText = [
        project.title,
        project.type,
        project.description,
        project.client.fname,
        project.client.lname,
      ]
        .join(" ")
        .toLowerCase();

      return matchesFilter && (!query || searchableText.includes(query));
    });
  }, [projects, filter, search]);

  const filteredActiveProjects = useMemo(
    () => filteredProjects.filter((project) => project.status === "In Progress"),
    [filteredProjects]
  );

  const filteredCompletedProjects = useMemo(
    () => filteredProjects.filter((project) => project.status === "Completed"),
    [filteredProjects]
  );

  const hasFilters = search.trim().length > 0 || filter !== "All";

  const clearFilters = () => {
    setSearch("");
    setFilter("All");
  };

  const scrollToProjects = () => {
    document.getElementById("project-library")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#fff] text-[#201d1a]">
      <section className="relative isolate overflow-hidden border-b border-[#292929] bg-[#080808] text-white">
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:64px_64px]" />
            <div className="absolute -right-52 -top-48 h-[650px] w-[650px] rounded-full border border-white/[0.09] sm:-right-36 sm:-top-64" />
            <div className="absolute -right-24 -top-24 h-[450px] w-[450px] rounded-full border border-white/[0.08]" />
            <div className="absolute right-[-2rem] top-16 h-[260px] w-[260px] rounded-full border border-white/[0.07]" />
            <div className="absolute right-[8%] top-[10%] h-64 w-64 rounded-full bg-white/[0.035] blur-[100px]" />
            <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute right-[13%] top-[23%] hidden h-2 w-2 rounded-full bg-white/70 sm:block" />
            <div className="absolute right-[calc(13%+3px)] top-[calc(23%+3px)] hidden h-5 w-5 rounded-full border border-white/20 sm:block" />
          </div>

          <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-9 sm:px-8 sm:pb-14 sm:pt-12 lg:px-14 lg:pb-16 lg:pt-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white text-black">
                    <Layers3 size={17} strokeWidth={1.8} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                      Project archive
                    </p>
                    <p className="mt-1 text-[9px] tracking-wide text-white/40">
                      Independent digital work
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.035] px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                  <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-white/65">
                    Ideas into reality
                  </span>
                </div>
              </div>

              <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(270px,0.7fr)] lg:items-end lg:gap-14">
                <div className="min-w-0">
                  <div className="mb-6 flex items-center gap-3">
                    <span className="text-[9px] font-medium uppercase tracking-[0.24em] text-white/50">
                      Selected work &amp; ongoing ideas
                    </span>
                  </div>

                  <h1 className="max-w-[900px] text-[clamp(3.25rem,8.4vw,7.8rem)] font-semibold leading-[0.86] tracking-[-0.085em]">
                    Digital
                    <br />
                    <span className="text-white">work.</span>
                    <br />
                    <span className="font-normal text-[#777777]">
                      Distinct purpose.
                    </span>
                  </h1>

                  <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <p className="max-w-[440px] text-[12px] leading-6 text-white/55 sm:text-[13px] sm:leading-7">
                      Websites, applications, and digital experiences — shaped by
                      thoughtful design, purposeful engineering, and the details that
                      make the difference.
                    </p>

                    <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={scrollToProjects}
                        className="group inline-flex min-h-11 items-center gap-3 rounded-full bg-white px-5 text-[11px] font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e5e5e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      >
                        Explore projects
                        <ArrowDownRight
                          size={15}
                          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                        />
                      </button>

                      <a
                        href="https://oduyemi.dev/projects"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-[11px] font-medium text-white/80 transition-all duration-300 hover:border-white/50 hover:bg-white/[0.06] hover:text-white"
                      >
                        Portfolio
                        <ArrowUpRight
                          size={14}
                          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </a>
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.65,
                    delay: 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-white/[0.14] bg-[#111111]/90 p-5 sm:p-6">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border border-white/[0.08]"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-5 -top-5 h-24 w-24 rounded-full border border-white/[0.08]"
                    />

                    <div className="relative flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">
                          At a glance
                        </p>

                        <h2 className="mt-3 text-xl font-medium tracking-[-0.045em] text-white sm:text-2xl">
                          The bigger picture.
                        </h2>

                        <p className="mt-2 max-w-[260px] text-[11px] leading-5 text-white/45">
                          Ideas in motion. Finished work. One evolving collection.
                        </p>
                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-white">
                        <Layers3 size={18} strokeWidth={1.5} />
                      </div>
                    </div>

                    <div className="relative mt-7 grid grid-cols-3 border-y border-white/10 py-5">
                      {[
                        { value: projects.length, label: "Total projects" },
                        { value: activeProjects.length, label: "In progress" },
                        { value: completedProjects.length, label: "Completed" },
                      ].map((stat, index) => (
                        <div
                          key={stat.label}
                          className={[
                            "min-w-0",
                            index > 0 ? "border-l border-white/10 pl-3 sm:pl-4" : "",
                            index < 2 ? "pr-2 sm:pr-4" : "",
                          ].join(" ")}
                        >
                          <p className="text-2xl font-semibold tabular-nums tracking-[-0.065em] text-white sm:text-3xl">
                            {stat.value.toLocaleString()}
                          </p>
                          <p className="mt-2 text-[8px] font-medium uppercase leading-4 tracking-[0.1em] text-white/40 sm:text-[9px]">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="relative mt-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] text-white/55">
                          Projects completed
                        </span>

                        <span className="text-[10px] font-medium tabular-nums text-white">
                          {projects.length
                            ? Math.round(
                                (completedProjects.length / projects.length) * 100
                              )
                            : 0}
                          %
                        </span>
                      </div>

                      <div
                        className="mt-3 h-1 overflow-hidden rounded-full bg-white/10"
                        role="progressbar"
                        aria-label="Percentage of projects completed"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={
                          projects.length
                            ? Math.round(
                                (completedProjects.length / projects.length) * 100
                              )
                            : 0
                        }
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${
                              projects.length
                                ? (completedProjects.length / projects.length) * 100
                                : 0
                            }%`,
                          }}
                          transition={{ duration: 0.9, delay: 0.25 }}
                          className="h-full rounded-full bg-white"
                        />
                      </div>
                    </div>

                    <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/60">
                          Built with intention.
                        </span>
                      </div>

                      <span className="text-[9px] uppercase tracking-[0.14em] text-white/35">
                        01 / Collection
                      </span>
                    </div>
                  </div>

                  <span
                    aria-hidden="true"
                    className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border border-white/50 bg-[#080808]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full border border-white/40 bg-[#080808]"
                  />
                </motion.div>
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5 sm:mt-16">
                <div className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-white/55">
                    A living collection of digital work
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.14em] text-white/35">
                  <span>Design</span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span>Engineering</span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span>Delivery</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      <div
        id="project-library"
        className="mx-auto max-w-[1440px] scroll-mt-8 px-5 py-10 sm:px-8 sm:py-14 lg:px-14 lg:py-16"
      >
        {isLoading && <LoadingState />}
        {!isLoading && error && (
          <ErrorState
            error={error}
            onRetry={() => void fetchProjects({ refresh: true })}
            isRefreshing={isRefreshing}
          />
        )}

        {!isLoading && !error && (
          <>
            <motion.section
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-9"
            >
              <div className="flex flex-col gap-5 border-b border-[#] pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#333]">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">
                      Browse the collection
                    </span>
                  </div>

                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.055em] text-[#25221e] sm:text-3xl">
                    The work, up close.
                  </h2>

                  <p className="mt-2 max-w-lg text-xs leading-6 text-[#817b73] sm:text-sm">
                    Find a project by name, explore what is underway, or revisit
                    work that is complete.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-[#817b73]">
                  <FolderOpen size={15} className="text-[#333]" />
                  <span>
                    {projects.length} {projects.length === 1 ? "project" : "projects"}{" "}
                    in the archive
                  </span>
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              aria-label="Filter projects"
              className="mb-12 rounded-2xl border border-[#e9e3db] bg-white p-4 shadow-[0_8px_30px_rgba(45,35,24,0.035)] sm:p-5"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                {/* Search */}
                <div className="relative w-full xl:max-w-[420px]">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a09a91]"
                    strokeWidth={1.7}
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search projects, categories, clients..."
                    aria-label="Search projects"
                    className="h-12 w-full rounded-xl border border-[#eee9e2] bg-[#fff] pl-11 pr-10 text-xs text-[#28241f] outline-none transition-all placeholder:text-[#aaa39a] focus:border-[#b88767] focus:bg-white focus:ring-4 focus:ring-[#b88767]/10"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#938b82] transition-colors hover:bg-[#eee9e2] hover:text-[#29241f]"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filter controls */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:justify-end">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal
                      size={14}
                      className="shrink-0 text-[#000]"
                    />

                    <div
                      role="group"
                      aria-label="Filter by project status"
                      className="flex flex-wrap gap-1.5"
                    >
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
                            aria-pressed={active}
                            className={[
                              "relative inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-[10px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b88767] focus-visible:ring-offset-2",
                              active
                                ? "bg-[#000] text-white shadow-sm"
                                : "border border-transparent text-[#444] hover:border-[#e9e3db] hover:bg-[#faf8f4] hover:text-[#28241f]",
                            ].join(" ")}
                          >
                            {item === "In Progress" && (
                              <span
                                className={[
                                  "h-1.5 w-1.5 rounded-full",
                                  active ? "bg-[#ccc]" : "bg-[#555]",
                                ].join(" ")}
                              />
                            )}

                            {item === "Completed" && (
                              <CheckCircle2
                                size={12}
                                className={active ? "text-[#e3b38f]" : "text-[#78917a]"}
                              />
                            )}

                            <span>{item}</span>

                            <span
                              className={[
                                "rounded-md px-1.5 py-0.5 text-[9px] tabular-nums",
                                active
                                  ? "bg-white/10 text-white/75"
                                  : "bg-[#f0ede7] text-[#8d857b]",
                              ].join(" ")}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void fetchProjects({ refresh: true })}
                    disabled={isRefreshing}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e9e3db] px-3.5 text-[10px] font-medium text-[#6f685f] transition-all hover:border-[#c9b8a7] hover:bg-[#faf8f4] hover:text-[#28241f] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw
                      size={13}
                      className={isRefreshing ? "animate-spin" : ""}
                    />
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0ece6] pt-4">
                <p className="text-[10px] text-[#8d857b]" aria-live="polite">
                  Showing{" "}
                  <span className="font-semibold text-[#3a352f]">
                    {filteredProjects.length}
                  </span>{" "}
                  of {projects.length}{" "}
                  {projects.length === 1 ? "project" : "projects"}
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#986745] transition-colors hover:text-[#68432c]"
                  >
                    <X size={12} />
                    Clear filters
                  </button>
                )}
              </div>
            </motion.section>

            {/* In progress */}
            {(filter === "All" || filter === "In Progress") &&
              filteredActiveProjects.length > 0 && (
                <ProjectSection
                  title="In motion"
                  description="Ideas taking shape. Work currently being designed, built, and refined."
                  icon={<Clock3 size={17} strokeWidth={1.7} />}
                  projects={filteredActiveProjects}
                  featured
                />
              )}

            {/* Completed */}
            {(filter === "All" || filter === "Completed") &&
              filteredCompletedProjects.length > 0 && (
                <ProjectSection
                  title="Out in the world"
                  description="Completed projects and digital experiences brought to life."
                  icon={<CheckCircle2 size={17} strokeWidth={1.7} />}
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

            {projects.length > 0 && (
              <motion.section
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5 }}
                className="relative mt-16 overflow-hidden rounded-2xl bg-[#ccc] px-6 py-8 sm:px-9 sm:py-10"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-[#ccc]/30"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-12 h-44 w-44 rounded-full border border-[#ccc]/30"
                />

                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-xl">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#986745]">
                      More where that came from
                    </p>

                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[#29251f] sm:text-3xl">
                      Good work starts with a good idea.
                    </h2>

                    <p className="mt-3 text-xs leading-6 text-[#71675c] sm:text-sm">
                      Explore more work, discover the thinking behind it, and
                      see what is possible.
                    </p>
                  </div>

                  <a
                    href="https://oduyemi.dev/projects"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-3 self-start rounded-full bg-[#292923] px-5 text-xs font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#403c34] sm:self-center"
                  >
                    Explore portfolio
                    <ArrowUpRight
                      size={15}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                </div>
              </motion.section>
            )}
          </>
        )}
      </div>
    </main>
  );
};


interface ProjectSectionProps {
  title: string;
  description: string;
  icon: ReactNode;
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
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-16 last:mb-0 sm:mb-20"
    >
      <div className="mb-6 flex flex-col gap-4 border-b border-[#e5e0d9] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e8d9ca] bg-[#f1e8de] text-[#986745]">
              {icon}
            </span>

            <h2 className="text-xl font-semibold tracking-[-0.045em] text-[#29251f] sm:text-2xl">
              {title}
            </h2>

            <span className="flex h-6 min-w-6 items-center justify-center rounded-full border border-[#e8e1d8] bg-white px-2 text-[9px] font-semibold tabular-nums text-[#746b60]">
              {projects.length}
            </span>
          </div>

          <p className="mt-2 max-w-[550px] text-xs leading-6 text-[#857d73]">
            {description}
          </p>
        </div>

        <a
          href="https://oduyemi.dev/projects"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#82786c] transition-colors hover:bg-white hover:text-[#986745]"
        >
          Explore all
          <ArrowUpRight
            size={13}
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      </div>

      <div
        className={[
          "grid grid-cols-1 gap-5 sm:gap-6",
          featured
            ? "lg:grid-cols-2"
            : "md:grid-cols-2 xl:grid-cols-3",
        ].join(" ")}
      >
        <AnimatePresence mode="popLayout">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              layout={!reduceMotion}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{
                duration: 0.35,
                delay: reduceMotion ? 0 : Math.min(index * 0.045, 0.18),
                ease: [0.22, 1, 0.36, 1],
              }}
              className="min-w-0"
            >
              <div className="h-full transition-transform duration-300 hover:-translate-y-1">
                <ProjectCard project={project} compact={!featured} />
              </div>
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
      className="py-8"
      role="status"
      aria-label="Loading projects"
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="w-full max-w-sm space-y-3">
          <div className="h-2 w-28 animate-pulse rounded bg-[#e7ded3]" />
          <div className="h-7 w-56 max-w-full animate-pulse rounded-lg bg-[#e8e1d8]" />
          <div className="h-3 w-full max-w-xs animate-pulse rounded bg-[#eee9e2]" />
        </div>
        <div className="hidden h-10 w-28 animate-pulse rounded-xl bg-[#e8e1d8] sm:block" />
      </div>

      <div className="mb-10 rounded-2xl border border-[#e9e3db] bg-white p-4 sm:p-5">
        <div className="h-12 w-full animate-pulse rounded-xl bg-[#f2eee8]" />
        <div className="mt-4 flex flex-wrap gap-2">
          {[80, 115, 95].map((width, index) => (
            <div
              key={index}
              style={{ width }}
              className="h-9 animate-pulse rounded-xl bg-[#f0ece6]"
            />
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-2xl border border-[#e9e3db] bg-white"
          >
            <div className="aspect-[16/9] animate-pulse bg-[#eae5dd]" />
            <div className="space-y-3 p-5">
              <div className="h-2.5 w-2/5 animate-pulse rounded bg-[#eee9e2]" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-[#e8e1d8]" />
              <div className="h-2.5 w-full animate-pulse rounded bg-[#f0ece6]" />
              <div className="h-2.5 w-4/5 animate-pulse rounded bg-[#f0ece6]" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-3 text-[10px] text-[#222]">
        <RefreshCw size={13} className="animate-spin text-[#222]" />
        Preparing the project collection...
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
      className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-[#e9e3db] bg-white px-6 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e9dfd3] bg-[#f6eee6] text-[#986745]">
        <FolderOpen size={23} strokeWidth={1.5} />
      </div>

      <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#333]">
        A small interruption
      </p>

      <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#29251f]">
        The collection is taking a break.
      </h2>

      <p className="mt-3 max-w-sm text-xs leading-6 text-[#81796f]">
        {error} Please try again in a moment.
      </p>

      <button
        type="button"
        onClick={onRetry}
        disabled={isRefreshing}
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#292923] px-5 text-xs font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#403c34] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw
          size={14}
          className={isRefreshing ? "animate-spin" : ""}
        />
        {isRefreshing ? "Trying again..." : "Reload projects"}
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#dcd3c7] bg-white/60 px-6 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e9dfd3] bg-[#f5eee5] text-[#986745]">
        {hasProjects ? <Search size={22} /> : <FolderOpen size={22} />}
      </div>

      <h2 className="mt-5 text-xl font-semibold tracking-[-0.04em] text-[#29251f]">
        {hasProjects ? "No matching projects" : "A new chapter starts here"}
      </h2>

      <p className="mt-2 max-w-sm text-xs leading-6 text-[#81796f]">
        {hasProjects
          ? "Try a different keyword or status filter to find the project you are looking for."
          : "There are no projects to show just yet. New work will appear here when it is added."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#ded5ca] bg-white px-4 text-[10px] font-semibold text-[#6d5b4b] transition-colors hover:border-[#bda38a] hover:bg-[#faf6f0]"
        >
          <X size={13} />
          Reset search and filters
        </button>
      )}
    </motion.div>
  );
}
