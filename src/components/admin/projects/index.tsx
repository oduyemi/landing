"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDot,
  Clock3,
  FolderKanban,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { ProjectsTable } from "./ProjectsTable";
import type { AdminProject } from "./types";

type ProjectFilter = "All" | "In Progress" | "Client Review" | "Completed";

interface ProjectsResponse {
  projects?: AdminProject[];
  data?: AdminProject[] | { projects?: AdminProject[] };
  error?: string;
  message?: string;
}

const filters: ProjectFilter[] = [
  "All",
  "In Progress",
  "Client Review",
  "Completed",
];

function extractProjects(response: ProjectsResponse): AdminProject[] {
  if (Array.isArray(response.projects)) return response.projects;
  if (Array.isArray(response.data)) return response.data;

  if (response.data && !Array.isArray(response.data)) {
    return response.data.projects ?? [];
  }

  return [];
}

const statConfig = [
  {
    key: "total",
    label: "Total projects",
    description: "Across your workspace",
    icon: FolderKanban,
    iconClass: "bg-neutral-100 text-neutral-700",
  },
  {
    key: "active",
    label: "In progress",
    description: "Currently being worked on",
    icon: CircleDot,
    iconClass: "bg-blue-50 text-blue-700",
  },
  {
    key: "review",
    label: "Client review",
    description: "Awaiting client feedback",
    icon: Clock3,
    iconClass: "bg-amber-50 text-amber-700",
  },
  {
    key: "completed",
    label: "Completed",
    description: "Successfully delivered",
    icon: CheckCircle2,
    iconClass: "bg-emerald-50 text-emerald-700",
  },
] as const;

export const ProjectsOverview = () => {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadProjects = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch("/api/projects", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = (await response.json()) as ProjectsResponse;

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Unable to load projects."
        );
      }

      setProjects(extractProjects(result));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load projects."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      const clientName =
        typeof project.client === "string"
          ? ""
          : `${project.client?.fname ?? ""} ${project.client?.lname ?? ""}`;

      const matchesSearch = [
        project.title,
        project.type,
        clientName,
        project.status,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );

      const matchesFilter =
        filter === "All" || project.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [projects, search, filter]);

  const stats = useMemo(
    () => ({
      total: projects.length,
      active: projects.filter(
        (project) => project.status === "In Progress"
      ).length,
      review: projects.filter(
        (project) => project.status === "Client Review"
      ).length,
      completed: projects.filter(
        (project) => project.status === "Completed"
      ).length,
    }),
    [projects]
  );

  const hasActiveFilters = search.trim().length > 0 || filter !== "All";

  const clearFilters = () => {
    setSearch("");
    setFilter("All");
  };

  return (
    <main className="min-w-0 space-y-7 pb-8 text-neutral-950 sm:space-y-8">
      {/* Page heading */}
      <header className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(to right, #f1f1f1 1px, transparent 1px), linear-gradient(to bottom, #f1f1f1 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "linear-gradient(to left, black, transparent 78%)",
          }}
        />

        <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between lg:p-8">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-3 py-1.5 text-[10px] font-medium text-neutral-600 shadow-sm">
              <BriefcaseBusiness size={12} />
              Workspace / Projects
              <ArrowDownRight size={11} className="text-neutral-400" />
            </div>

            <h1 className="text-2xl font-semibold tracking-[-0.055em] text-neutral-950 sm:text-3xl">
              Projects overview
            </h1>

            <p className="mt-2 max-w-lg text-xs leading-6 text-neutral-500 sm:text-sm">
              Keep track of active work, client reviews, and completed
              deliverables — all in one place.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-neutral-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Project workspace
              </span>
              <span className="hidden h-3 w-px bg-neutral-200 sm:block" />
              <span>
                {loading
                  ? "Updating project data..."
                  : `${projects.length} ${
                      projects.length === 1 ? "project" : "projects"
                    } in your workspace`}
              </span>
            </div>
          </div>

          <div className="relative flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void loadProjects(true)}
              disabled={loading || refreshing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={13}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              href="/admin/projects/new"
              className="group inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 text-xs font-medium text-white shadow-sm transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
            >
              <Plus size={14} />
              Create project
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Statistics */}
      <section aria-label="Project statistics">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
              At a glance
            </h2>
            <p className="mt-1 text-[11px] text-neutral-500">
              A quick snapshot of your project portfolio.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 text-[10px] text-neutral-400">
            Live overview
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
          {statConfig.map((stat) => {
            const Icon = stat.icon;
            const value = stats[stat.key];

            return (
              <article
                key={stat.key}
                className="group rounded-xl border border-neutral-200 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.045)] sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-neutral-600">
                      {stat.label}
                    </p>
                    <p className="mt-1.5 text-[10px] leading-4 text-neutral-400">
                      {stat.description}
                    </p>
                  </div>

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}
                  >
                    <Icon size={16} strokeWidth={1.8} />
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between gap-3">
                  <p className="text-3xl font-semibold leading-none tracking-[-0.06em] text-neutral-950 tabular-nums">
                    {loading ? (
                      <span className="inline-block h-8 w-12 animate-pulse rounded-md bg-neutral-100" />
                    ) : (
                      value.toLocaleString()
                    )}
                  </p>

                  <span className="mb-0.5 text-[10px] text-neutral-400">
                    {stat.key === "total"
                      ? "Overall"
                      : stats.total > 0
                        ? `${Math.round((value / stats.total) * 100)}%`
                        : "0%"}
                  </span>
                </div>

                {stat.key !== "total" && (
                  <div className="mt-4 h-1 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stat.key === "active"
                          ? "bg-blue-600"
                          : stat.key === "review"
                            ? "bg-amber-500"
                            : "bg-emerald-600"
                      }`}
                      style={{
                        width: `${
                          stats.total > 0
                            ? Math.min((value / stats.total) * 100, 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Project library */}
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                  <FolderKanban size={15} />
                </div>

                <h2 className="text-sm font-semibold tracking-tight text-neutral-950">
                  Project library
                </h2>

                {!loading && (
                  <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                    {filteredProjects.length}
                  </span>
                )}
              </div>

              <p className="mt-2 text-[11px] leading-5 text-neutral-500">
                Search, filter, and manage your projects.
              </p>
            </div>

            <label className="relative block w-full lg:max-w-[300px]">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by project, client..."
                aria-label="Search projects"
                className="h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50/70 pl-9 pr-9 text-xs text-neutral-800 outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-400 focus:bg-white focus:ring-4 focus:ring-neutral-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                >
                  <X size={13} />
                </button>
              )}
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[10px] font-medium text-neutral-500">
              <SlidersHorizontal size={13} />
              Filter by status
            </div>

            <div
              className="flex max-w-full flex-wrap items-center gap-1.5"
              role="group"
              aria-label="Filter projects by status"
            >
              {filters.map((item) => {
                const count =
                  item === "All"
                    ? projects.length
                    : projects.filter(
                        (project) => project.status === item
                      ).length;

                const isActive = filter === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    aria-pressed={isActive}
                    className={`inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-[10px] font-medium transition ${
                      isActive
                        ? "border-neutral-950 bg-neutral-950 text-white shadow-sm"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    {item}
                    <span
                      className={`tabular-nums ${
                        isActive ? "text-neutral-300" : "text-neutral-400"
                      }`}
                    >
                      {loading ? "—" : count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mx-4 mt-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50/70 p-4 sm:mx-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-red-600">
                <RefreshCw size={14} />
              </div>

              <div>
                <p className="text-xs font-semibold text-red-900">
                  Could not load projects
                </p>
                <p className="mt-1 text-[11px] leading-5 text-red-700">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadProjects()}
              className="inline-flex h-8 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-red-200 bg-white px-3 text-[11px] font-medium text-red-800 transition hover:bg-red-50 sm:self-center"
            >
              <RefreshCw size={12} />
              Try again
            </button>
          </div>
        )}

        <div className="min-w-0 p-2 sm:p-4">
          <ProjectsTable projects={filteredProjects} loading={loading} />
        </div>

        <div className="flex flex-col gap-2 border-t border-neutral-100 bg-neutral-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-[10px] text-neutral-500">
            {loading
              ? "Loading your project library..."
              : error
                ? "Project data may be temporarily unavailable."
                : hasActiveFilters
                  ? `Showing ${filteredProjects.length} of ${projects.length} projects`
                  : `${projects.length} ${
                      projects.length === 1 ? "project" : "projects"
                    } in total`}
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 self-start text-[10px] font-medium text-neutral-600 transition hover:text-neutral-950 sm:self-auto"
            >
              <X size={12} />
              Clear filters
            </button>
          )}
        </div>
      </section>
    </main>
  );
};
