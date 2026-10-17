"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Layers3,
  Filter,
  CircleDot,
  Inbox,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { ActivityTimeline, ActivityItem } from "./Timeline";

const filters = [
  { label: "All activity", value: "all" },
  { label: "Tasks", value: "task" },
  { label: "Messages", value: "message" },
  { label: "Files", value: "file" },
  { label: "Projects", value: "project" },
  { label: "Deliverables", value: "deliverable" },
  { label: "Milestones", value: "milestone" },
];

interface ActivityResponse {
  success: boolean;
  activities?: ActivityItem[];
  error?: string;
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
  };
}

const filterLabel = (value: string) =>
  filters.find((filter) => filter.value === value)?.label ?? "All activity";

export const Activities = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadActivities = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        const params = new URLSearchParams({
          type: activeFilter,
          search: search.trim(),
          page: String(page),
        });

        const response = await fetch(
          `/api/admin/activity?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = (await response.json()) as ActivityResponse;

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load activity.");
        }

        setActivities(data.activities || []);
        setTotal(data.pagination?.total || 0);
        setTotalPages(Math.max(1, data.pagination?.totalPages || 1));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load activity."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeFilter, search, page]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadActivities();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [loadActivities]);

  function changeFilter(value: string) {
    setActiveFilter(value);
    setPage(1);
  }

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <main className="min-h-full bg-[#f7f8fa] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <header className="mb-8">
          <div className="mb-4 flex items-center gap-2 text-xs font-medium text-neutral-500">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 shadow-sm">
              <Layers3 size={14} />
            </span>
            <span>Workspace</span>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900">Activity</span>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
                  Activity
                </h1>
              </div>
              <p className="text-sm leading-6 text-neutral-500 sm:text-[15px]">
                A clear view of the latest changes, updates, and activity
                across your workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadActivities(true)}
              disabled={loading || refreshing}
              className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-neutral-200 bg-white px-4 text-xs font-semibold text-neutral-700 shadow-sm transition duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh activity"}
            </button>
          </div>
        </header>

        {/* Overview cards */}
        <section
          aria-label="Activity overview"
          className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="group rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm transition hover:border-neutral-300 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 transition group-hover:bg-neutral-900 group-hover:text-white">
                <Activity size={18} />
              </div>
              <span className="rounded-lg border border-neutral-100 bg-neutral-50 px-2 py-1 text-[10px] font-medium text-neutral-500">
                {activeFilter === "all" ? "All categories" : "Filtered view"}
              </span>
            </div>
            <div className="mt-5">
              <p className="text-xs font-medium text-neutral-500">
                Matching events
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight text-neutral-950 tabular-nums">
                  {loading ? "—" : total.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-400">total results</span>
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm transition hover:border-neutral-300 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                <Layers3 size={18} />
              </div>
              <span className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700">
                Current view
              </span>
            </div>
            <div className="mt-5">
              <p className="text-xs font-medium text-neutral-500">
                Activity category
              </p>
              <p className="mt-1 truncate text-xl font-semibold tracking-tight text-neutral-950">
                {filterLabel(activeFilter)}
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Selected filter
              </p>
            </div>
          </div>

          <div className="group rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm transition hover:border-neutral-300 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 transition group-hover:bg-violet-600 group-hover:text-white">
                <CalendarDays size={18} />
              </div>
              <span className="rounded-lg border border-violet-100 bg-violet-50 px-2 py-1 text-[10px] font-medium text-violet-700">
                Pagination
              </span>
            </div>
            <div className="mt-5">
              <p className="text-xs font-medium text-neutral-500">
                Current page
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-neutral-950 tabular-nums">
                {page}
                <span className="ml-1 text-sm font-normal text-neutral-400">
                  / {totalPages}
                </span>
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Browse your activity history
              </p>
            </div>
          </div>
        </section>

        {/* Activity panel */}
        <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
          <div className="border-b border-neutral-200/80 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-neutral-950">
                    Activity history
                  </h2>
                  <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                    {loading ? "Loading" : total.toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Search and filter events to find the updates you need.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative block min-w-0 sm:w-48">
                  <span className="sr-only">Filter activity type</span>
                  <Filter
                    size={14}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <select
                    value={activeFilter}
                    onChange={(event) => changeFilter(event.target.value)}
                    className="h-10 w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50/70 pl-9 pr-9 text-xs font-medium text-neutral-700 outline-none transition hover:bg-white focus:border-neutral-400 focus:bg-white focus:ring-4 focus:ring-neutral-100"
                  >
                    {filters.map((filter) => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                  <ChevronRight
                    size={14}
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-neutral-400"
                  />
                </label>

                <label className="relative block min-w-0 sm:w-64 lg:w-72">
                  <span className="sr-only">Search activity</span>
                  <Search
                    size={15}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => changeSearch(event.target.value)}
                    placeholder="Search activity..."
                    className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50/70 pl-9 pr-9 text-xs text-neutral-800 outline-none transition placeholder:text-neutral-400 hover:bg-white focus:border-neutral-400 focus:bg-white focus:ring-4 focus:ring-neutral-100"
                  />
                  {search && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => changeSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-neutral-400 transition hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                    >
                      <RotateCcw size={13} />
                    </button>
                  )}
                </label>
              </div>
            </div>

            {(activeFilter !== "all" || search.trim()) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-neutral-500">
                  Active filters:
                </span>
                {activeFilter !== "all" && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[11px] font-medium text-neutral-700">
                    <CircleDot size={11} />
                    {filterLabel(activeFilter)}
                    <button
                      type="button"
                      onClick={() => changeFilter("all")}
                      aria-label="Remove category filter"
                      className="ml-1 text-neutral-400 hover:text-neutral-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {search.trim() && (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[11px] font-medium text-neutral-700">
                    <Search size={11} />
                    <span className="max-w-40 truncate">
                      {search.trim()}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeSearch("")}
                      aria-label="Remove search filter"
                      className="ml-1 text-neutral-400 hover:text-neutral-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    changeFilter("all");
                    changeSearch("");
                  }}
                  className="text-[11px] font-medium text-neutral-500 underline-offset-4 transition hover:text-neutral-900 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6">
            {error ? (
              <div className="flex flex-col items-center rounded-2xl border border-red-100 bg-red-50/60 px-5 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-100 bg-white text-red-600 shadow-sm">
                  <AlertCircle size={21} />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-neutral-900">
                  We couldn&apos;t load your activity
                </h3>
                <p role="alert" className="mt-2 max-w-md text-xs leading-5 text-red-700">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => void loadActivities()}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-700"
                >
                  <RefreshCw size={13} />
                  Try again
                </button>
              </div>
            ) : !loading && activities.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-5 py-14 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-400 shadow-sm">
                  <Inbox size={24} />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-neutral-900">
                  No activity found
                </h3>
                <p className="mt-2 max-w-sm text-xs leading-5 text-neutral-500">
                  {search.trim() || activeFilter !== "all"
                    ? "Try changing your search or selecting a different category."
                    : "Workspace events will appear here as activity is recorded."}
                </p>
                {(search.trim() || activeFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      changeFilter("all");
                      changeSearch("");
                    }}
                    className="mt-4 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <ActivityTimeline
                activities={activities}
                loading={loading}
              />
            )}

            {!loading && !error && total > 0 && (
              <div className="mt-6 flex flex-col gap-4 border-t border-neutral-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-neutral-700">
                    Page {page} of {totalPages}
                  </p>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    {total.toLocaleString()}{" "}
                    {total === 1 ? "event" : "events"} matching your filters
                  </p>
                </div>

                <nav
                  aria-label="Activity pagination"
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((value) => Math.max(1, value - 1))
                    }
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </button>

                  <span
                    aria-live="polite"
                    className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-neutral-900 px-3 text-xs font-semibold text-white tabular-nums"
                  >
                    {page}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((value) => Math.min(totalPages, value + 1))
                    }
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </nav>
              </div>
            )}
          </div>
        </section>

        <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-neutral-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Activity feed
          </span>
          <span>
            Showing {loading ? "…" : activities.length} events on this page
          </span>
        </footer>
      </div>
    </main>
  );
}
