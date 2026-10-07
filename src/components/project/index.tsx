"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {ArrowUpRight, CheckCircle2, Clock3, FolderOpen, Search, SlidersHorizontal} from "lucide-react";
import { ProjectCard } from "../client/projects/ProjectCard";
import type { Project } from "../client/projects/types";
import Link from "next/link";

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

export const AllProjects = () => {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const controller = new AbortController();
  async function fetchProjects() {
    try {
      setIsLoading(true);
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

      const rawProjects: ApiProject[] = Array.isArray(data)
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

      if (!controller.signal.aborted) {
        setProjects(normalizedProjects);
      }
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
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }

  void fetchProjects();

  return () => controller.abort();

  }, []);

  const activeProjects = projects.filter(
  (project) => project.status === "In Progress"
  );

  const completedProjects = projects.filter(
  (project) => project.status === "Completed"
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

  const filteredActiveProjects = filteredProjects.filter(
  (project) => project.status === "In Progress"
  );

  const filteredCompletedProjects = filteredProjects.filter(
  (project) => project.status === "Completed"
  );

  return ( 
    <main className="min-h-screen bg-[#fafafa] text-[#181818]">
      <section className="relative overflow-hidden border-b border-[#e8e8e8] bg-white"> <div className="mx-auto max-w-[1280px] px-6 pb-14 pt-16 sm:px-10 sm:pb-18 sm:pt-20 lg:px-14 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[850px]"
          > 
            <div className="mb-5 flex items-center gap-3"> 
            <span className="h-px w-8 bg-[#222]" />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#777]">
                Current works
              </span>
            </div>

            <h1 className="max-w-[800px] text-[42px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#151515] sm:text-[58px] lg:text-[72px]">
              Projects built with
              <span className="text-[#999]"> purpose.</span>
            </h1>

            <p className="mt-6 max-w-[540px] text-[13px] leading-6 text-[#777] sm:text-[14px]">
              Explore the websites, applications, and digital
              experiences currently in progress or completed.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-[#eeeeee] pt-5"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-semibold tracking-[-0.03em]">
                {projects.length}
              </span>

              <span className="text-[10px] uppercase tracking-[0.12em] text-[#999]">
                Projects
              </span>
            </div>

            <span className="h-4 w-px bg-[#ddd]" />

            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-semibold tracking-[-0.03em]">
                {activeProjects.length}
              </span>

              <span className="text-[10px] uppercase tracking-[0.12em] text-[#999]">
                In progress
              </span>
            </div>

            <span className="h-4 w-px bg-[#ddd]" />

            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-semibold tracking-[-0.03em]">
                {completedProjects.length}
              </span>

              <span className="text-[10px] uppercase tracking-[0.12em] text-[#999]">
                Completed
              </span>
            </div>
          </motion.div>
        </div>

        <div className="pointer-events-none absolute -bottom-32 -right-20 h-72 w-72 rounded-full border border-[#eeeeee]" />
        <div className="pointer-events-none absolute -bottom-24 -right-12 h-56 w-56 rounded-full border border-[#f1f1f1]" />
      </section>

      <div className="mx-auto max-w-[1280px] px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-[420px] items-center justify-center"
        >
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#222]" />
            <span className="text-[11px] text-[#888]">
              Loading projects
            </span>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex min-h-[420px] flex-col items-center justify-center text-center"
        >
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
            <FolderOpen
              className="h-5 w-5 text-[#777]"
              strokeWidth={1.4}
            />
          </div>

          <h2 className="text-[16px] font-medium tracking-[-0.02em]">
            Unable to load projects
          </h2>

          <p className="mt-2 max-w-[320px] text-[11px] leading-5 text-[#888]">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full bg-[#181818] px-5 py-2.5 text-[10px] font-medium text-white transition-transform hover:-translate-y-0.5"
          >
            Try again
          </button>
        </motion.div>
      )}

    {!isLoading && !error && (
      <>
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <div className="flex flex-col gap-5 border-b border-[#e5e5e5] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-[320px]">
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
                placeholder="Search projects"
                className="h-9 w-full border-b border-[#dcdcdc] bg-transparent pl-7 pr-2 text-[11px] text-[#222] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#222]"
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal
                className="mr-1 h-3.5 w-3.5 text-[#888]"
                strokeWidth={1.5}
              />

              {(
                [
                  "All",
                  "In Progress",
                  "Completed",
                ] as Filter[]
              ).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={[
                    "rounded-full px-3.5 py-2 text-[10px] transition-all",
                    filter === item
                      ? "bg-[#181818] font-medium text-white"
                      : "text-[#777] hover:bg-[#eeeeee] hover:text-[#222]",
                  ].join(" ")}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Active projects */}
        {(filter === "All" ||
          filter === "In Progress") &&
          filteredActiveProjects.length > 0 && (
            <ProjectSection
              title="Currently in progress"
              description="Projects being actively developed."
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

        {/* Completed */}
        {(filter === "All" ||
          filter === "Completed") &&
          filteredCompletedProjects.length > 0 && (
            <ProjectSection
              title="Completed work"
              description="A selection of finished projects and digital experiences."
              icon={
                <CheckCircle2
                  className="h-4 w-4"
                  strokeWidth={1.4}
                />
              }
              projects={filteredCompletedProjects}
            />
          )}

        {/* Empty */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-[380px] flex-col items-center justify-center border-y border-[#e5e5e5] text-center"
          >
            <Search
              className="h-6 w-6 text-[#aaa]"
              strokeWidth={1.2}
            />

            <h2 className="mt-5 text-[18px] font-medium tracking-[-0.025em]">
              Nothing matched your search
            </h2>

            <p className="mt-2 max-w-[300px] text-[11px] leading-5 text-[#999]">
              Try another project name, category, or
              remove the current filter.
            </p>

            {(search || filter !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("All");
                }}
                className="mt-6 text-[10px] font-medium text-[#222] underline underline-offset-4"
              >
                Clear filters
              </button>
            )}
          </motion.div>
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      }}
      className="mb-20 last:mb-0"
    > 
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"> 
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

          <p className="mt-2 text-[11px] leading-5 text-[#999]">
            {description}
          </p>
        </div>

      <div className="hidden items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-[#aaa] sm:flex">
        <span><Link href="https://oduyemi.dev/projects" target="_blank"> Explore</Link></span>
        <ArrowUpRight
          className="h-3 w-3"
          strokeWidth={1.5}
        />
      </div>
    </div>

    <div
      className={[
        "grid gap-6",
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
              y: 16,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            transition={{
              duration: 0.4,
              delay: Math.min(index * 0.04, 0.2),
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
