"use client";

import {
  FolderKanban,
  Search,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ProjectCard } from "@/components/client/projects/ProjectCard";

type ProjectStatus =
  | "Planning"
  | "In Progress"
  | "Completed"
  | "On Hold"
  | "Cancelled";

interface Project {
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
    name: string;
    email: string;
  };
}

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
    email?: string;
  } | null;
}

type Filter = "All" | "In Progress" | "Completed";

const filters: Filter[] = [
  "All",
  "In Progress",
  "Completed",
];

const pageEase = [0.22, 1, 0.36, 1] as const;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchProjects() {
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
          throw new Error(
            data?.error || "Failed to load projects."
          );
        }

        if (cancelled) return;

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
          description: project.description,
          client: {
            id: project.client?._id,
            name:
              `${project.client?.fname ?? ""} ${
                project.client?.lname ?? ""
              }`.trim() || "Client",
            email: project.client?.email ?? "",
          },
        }));

        setProjects(normalizedProjects);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load projects."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  );

  const inProgressProjects = projects.filter(
    (project) => project.status === "In Progress"
  );

  const activeProjects = projects.filter(
    (project) => project.status !== "Completed"
  );

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesFilter =
        filter === "All" ||
        project.status === filter;

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

  return (
    <main className="relative min-h-full overflow-hidden bg-[#fafafa]">
      {/* Subtle background detail */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[260px] bg-gradient-to-b from-white via-white/70 to-transparent" />

      <div className="relative mx-auto max-w-[1180px] px-5 py-7 sm:px-7 sm:py-9 lg:px-9 lg:py-10">

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            ease: pageEase,
          }}
          className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-black" />

              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#999]">
                Client workspace
              </p>
            </div>

            <h1 className="mt-2 text-[27px] font-semibold tracking-[-0.055em] text-[#171717] sm:text-[29px]">
              Projects
            </h1>

            <p className="mt-1.5 max-w-[360px] text-[10px] leading-[1.6] text-[#888]">
              View progress, deadlines and the latest activity
              across your projects.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-[235px]">
            <Search
              className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#aaa]"
              strokeWidth={1.6}
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search projects..."
              className="h-9.5 w-full rounded-[6px] border border-[#e5e5e5] bg-white pl-9 pr-9 text-[10px] text-[#333] shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-all duration-200 placeholder:text-[#aaa] hover:border-[#d8d8d8] focus:border-[#bcbcbc] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.025)]"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-[#aaa] transition-colors hover:bg-[#f2f2f2] hover:text-black"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </motion.header>

        {/* =====================================================
            STATS
        ====================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            delay: 0.08,
            ease: pageEase,
          }}
          className="mt-7 grid grid-cols-3 gap-2.5 sm:max-w-[610px] sm:gap-3"
        >
          <Stat
            icon={FolderKanban}
            label="Total"
            value={projects.length}
          />

          <Stat
            icon={Clock3}
            label="In Progress"
            value={inProgressProjects.length}
            active={inProgressProjects.length > 0}
          />

          <Stat
            icon={CheckCircle2}
            label="Completed"
            value={completedProjects.length}
          />
        </motion.div>

        {/* =====================================================
            FILTERS
        ====================================================== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.18,
          }}
          className="mt-8 flex items-center justify-between border-b border-[#e7e7e7]"
        >
          <div className="flex items-center gap-1">
            {filters.map((item) => {
              const active = filter === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={[
                    "relative px-3 pb-3 pt-1 text-[9px] font-medium transition-colors duration-200",
                    active
                      ? "text-[#111]"
                      : "text-[#999] hover:text-[#444]",
                  ].join(" ")}
                >
                  {item}

                  {active && (
                    <motion.span
                      layoutId="active-project-filter"
                      className="absolute bottom-0 left-2 right-2 h-[1.5px] rounded-full bg-black"
                      transition={{
                        duration: 0.25,
                        ease: pageEase,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden items-center gap-1.5 pb-3 sm:flex">
            <span className="text-[7px] text-[#aaa]">
              Showing
            </span>

            <span className="text-[8px] font-medium text-[#555]">
              {filteredProjects.length}
            </span>
          </div>
        </motion.div>

        {/* =====================================================
            LOADING
        ====================================================== */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-7 flex min-h-[280px] flex-col items-center justify-center rounded-[9px] border border-[#e6e6e6] bg-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ededed] bg-[#fafafa]">
              <LoaderCircle
                className="h-4 w-4 animate-spin text-[#888]"
                strokeWidth={1.5}
              />
            </div>

            <p className="mt-3 text-[10px] font-medium text-[#444]">
              Loading projects
            </p>

            <p className="mt-1 text-[8px] text-[#aaa]">
              Preparing your workspace...
            </p>
          </motion.div>
        )}

        {/* =====================================================
            ERROR
        ====================================================== */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-7 flex min-h-[280px] flex-col items-center justify-center rounded-[9px] border border-[#e2e2e2] bg-white px-5 text-center"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ededed] bg-[#fafafa]">
              <FolderKanban
                className="h-4 w-4 text-[#999]"
                strokeWidth={1.5}
              />
            </div>

            <p className="mt-3 text-[11px] font-semibold text-[#333]">
              Unable to load projects
            </p>

            <p className="mt-1 max-w-[280px] text-[9px] leading-4 text-[#999]">
              {error}
            </p>
          </motion.div>
        )}

        {/* =====================================================
            PROJECT CONTENT
        ====================================================== */}
        {!loading && !error && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.06,
                },
              },
            }}
          >
            {/* =================================================
                CURRENT PROJECTS
            ================================================== */}
            {filteredActive.length > 0 && (
              <motion.section
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 8,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.45,
                      ease: pageEase,
                    },
                  },
                }}
                className="mt-7"
              >
                <SectionHeading
                  title="Current Projects"
                  count={filteredActive.length}
                  description="Projects currently underway"
                />

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.08,
                      },
                    },
                  }}
                  className={[
                    "mt-4 grid gap-4",
                    filteredActive.length === 1
                      ? "max-w-[650px]"
                      : "md:grid-cols-2",
                  ].join(" ")}
                >
                  {filteredActive.map((project) => (
                    <motion.div
                      key={project.id}
                      variants={{
                        hidden: {
                          opacity: 0,
                          y: 10,
                        },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.5,
                            ease: pageEase,
                          },
                        },
                      }}
                    >
                      <ProjectCard project={project} />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.section>
            )}

            {/* =================================================
                COMPLETED
            ================================================== */}
            {filteredCompleted.length > 0 && (
              <motion.section
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 8,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.45,
                      ease: pageEase,
                    },
                  },
                }}
                className="mt-11"
              >
                <SectionHeading
                  title="Completed Projects"
                  count={filteredCompleted.length}
                  description="Projects successfully delivered"
                />

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.06,
                      },
                    },
                  }}
                  className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {filteredCompleted.map((project) => (
                    <motion.div
                      key={project.id}
                      variants={{
                        hidden: {
                          opacity: 0,
                          y: 10,
                        },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.45,
                            ease: pageEase,
                          },
                        },
                      }}
                    >
                      <ProjectCard
                        project={project}
                        compact
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.section>
            )}

            {/* =================================================
                EMPTY
            ================================================== */}
            {filteredProjects.length === 0 && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                  ease: pageEase,
                }}
                className="mt-7 flex min-h-[280px] flex-col items-center justify-center rounded-[9px] border border-dashed border-[#dcdcdc] bg-white px-5 text-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e9e9e9] bg-[#fafafa]">
                  <Search
                    className="h-4 w-4 text-[#999]"
                    strokeWidth={1.5}
                  />
                </div>

                <p className="mt-3 text-[11px] font-semibold text-[#444]">
                  No projects found
                </p>

                <p className="mt-1 max-w-[250px] text-[9px] leading-4 text-[#999]">
                  {projects.length === 0
                    ? "You don't have any projects yet."
                    : "Try changing your search or selecting another filter."}
                </p>

                {(search || filter !== "All") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setFilter("All");
                    }}
                    className="mt-4 inline-flex h-7 items-center gap-1.5 rounded-[5px] bg-black px-3 text-[8px] font-semibold text-white transition-colors hover:bg-[#222]"
                  >
                    Clear filters
                    <ArrowUpRight
                      size={10}
                      strokeWidth={1.8}
                    />
                  </button>
                )}
              </motion.div>
            )}

            {/* =================================================
                WORKSPACE FOOTER DETAIL
            ================================================== */}
            {projects.length > 0 && (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.5,
                }}
                className="mt-12 flex items-center justify-between border-t border-[#e8e8e8] pt-4"
              >
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={10}
                    strokeWidth={1.5}
                    className="text-[#999]"
                  />

                  <span className="text-[7px] uppercase tracking-[0.14em] text-[#aaa]">
                    Workspace
                  </span>
                </div>

                <span className="text-[7px] text-[#aaa]">
                  {activeProjects.length} active ·{" "}
                  {completedProjects.length} completed
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}

/* ============================================================
   SECTION HEADING
============================================================ */

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
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-[12px] font-semibold tracking-[-0.02em] text-[#222]">
            {title}
          </h2>

          <span className="flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#ededed] px-1.5 text-[7px] font-semibold text-[#777]">
            {count}
          </span>
        </div>

        <p className="mt-1 text-[7.5px] text-[#aaa]">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function Stat({
  icon: Icon,
  label,
  value,
  active = false,
}: {
  icon: typeof FolderKanban;
  label: string;
  value: number;
  active?: boolean;
}) {
  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      transition={{
        duration: 0.2,
      }}
      className="group relative overflow-hidden rounded-[8px] border border-[#e6e6e6] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.015)] transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.045)]"
    >
      {/* Subtle corner detail */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-12 w-12 rounded-full bg-[#fafafa] transition-transform duration-500 group-hover:scale-125" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-[#f7f7f7]">
            <Icon
              className="h-3.5 w-3.5 text-[#777]"
              strokeWidth={1.5}
            />
          </div>

          <span className="text-[8px] font-medium text-[#999]">
            {label}
          </span>
        </div>

        {active && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-20" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-black" />
          </span>
        )}
      </div>

      <p className="relative mt-3 text-[20px] font-semibold tracking-[-0.045em] text-[#222]">
        {value}
      </p>
    </motion.div>
  );
}