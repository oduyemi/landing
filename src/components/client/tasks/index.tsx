"use client";
import { AlertCircle, ArrowUpRight, CheckCircle2, ClipboardList, Clock3, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TaskFilters, TaskFilter } from "./Filters";
import { TaskList } from "./List";
import { CreateTask } from "./CreateTask";

export interface ClientTask {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  projectName: string;
  projectType: string;
  dueDate?: string;
  status: "Pending" | "Completed";
  createdAt?: string;
  completedAt?: string;
}

interface ApiTask {
  _id: string;
  title: string;
  description?: string;
  project?: {
    _id: string;
    title: string;
    type?: string;
  } | null;
  dueDate?: string | null;
  status:
    | "Pending"
    | "In Progress"
    | "Completed"
    | "On Hold"
    | "Cancelled";
  createdAt?: string;
  completedAt?: string | null;
}

interface TasksApiResponse {
  success?: boolean;
  tasks?: ApiTask[];
  data?: ApiTask[];
  error?: string;
}

function TaskSkeleton() {
  return (
    <div
      aria-label="Loading tasks"
      aria-busy="true"
      className="space-y-3 p-4 sm:p-5"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-start gap-4 rounded-xl border border-slate-100 p-4"
        >
          <div className="mt-1 h-5 w-5 shrink-0 rounded-md bg-slate-100" />

          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-3.5 w-2/5 rounded-full bg-slate-200" />
            <div className="h-3 w-4/5 rounded-full bg-slate-100" />
            <div className="flex gap-2">
              <div className="h-5 w-20 rounded-md bg-slate-100" />
              <div className="h-5 w-24 rounded-md bg-slate-100" />
            </div>
          </div>

          <div className="h-5 w-16 shrink-0 rounded-md bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function TaskStat({
  label,
  value,
  description,
  icon: Icon,
  variant = "neutral",
}: {
  label: string;
  value: number;
  description: string;
  icon: typeof ClipboardList;
  variant?: "neutral" | "blue" | "green";
}) {
  const styles = {
    neutral: {
      icon: "bg-slate-100 text-slate-700",
      accent: "bg-slate-900",
    },
    blue: {
      icon: "bg-blue-50 text-blue-700",
      accent: "bg-blue-600",
    },
    green: {
      icon: "bg-emerald-50 text-emerald-700",
      accent: "bg-emerald-500",
    },
  }[variant] ?? {
    icon: "bg-slate-100 text-slate-700",
    accent: "bg-slate-900",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)] transition duration-200 hover:border-slate-300 hover:shadow-sm sm:p-5">
      <div
        className={`absolute inset-x-0 top-0 h-[2px] ${styles.accent}`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {value.toLocaleString()}
          </p>

          <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          <Icon size={19} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}

function TaskError({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div className="mx-4 my-6 rounded-2xl border border-rose-100 bg-rose-50/60 p-5 sm:mx-6 sm:p-7">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
          <AlertCircle size={23} strokeWidth={1.7} />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          We couldn&apos;t load your tasks
        </h3>

        <p className="mt-2 text-xs leading-5 text-slate-600">
          {message}
        </p>

        <button
          type="button"
          disabled={retrying}
          onClick={onRetry}
          className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {retrying ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          {retrying ? "Retrying..." : "Try again"}
        </button>
      </div>
    </div>
  );
}

const normalizeTask = (task: ApiTask): ClientTask => ({
  id: task._id,
  title: task.title,
  description: task.description,
  projectId: task.project?._id || "",
  projectName: task.project?.title || "General task",
  projectType: task.project?.type || "Project",
  dueDate: task.dueDate || undefined,
  status: task.status === "Completed" ? "Completed" : "Pending",
  createdAt: task.createdAt,
  completedAt: task.completedAt || undefined,
});

export const TasksDashboard = () => {
  const [activeFilter, setActiveFilter] =
    useState<TaskFilter>("all");

  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchTasks = useCallback(async () => {
    const isInitialLoad = tasks.length === 0;

    if (isInitialLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const response = await fetch("/api/tasks?limit=100", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data =
        (await response.json()) as TasksApiResponse;

      if (!response.ok || data.success === false) {
        throw new Error(data.error || "Unable to load tasks.");
      }

      const apiTasks = data.tasks ?? data.data ?? [];

      setTasks(
        apiTasks
          .filter(
            (task): task is ApiTask =>
              Boolean(task && task._id && task.title)
          )
          .map(normalizeTask)
      );
    } catch (err) {
      console.error("FETCH TASKS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load tasks."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tasks.length]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const pendingCount = useMemo(
    () => tasks.filter((task) => task.status === "Pending").length,
    [tasks]
  );

  const completedCount = useMemo(
    () => tasks.filter((task) => task.status === "Completed").length,
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    if (activeFilter === "pending") {
      return tasks.filter((task) => task.status === "Pending");
    }

    if (activeFilter === "completed") {
      return tasks.filter((task) => task.status === "Completed");
    }

    return tasks;
  }, [activeFilter, tasks]);

  const completionRate =
    tasks.length > 0
      ? Math.round((completedCount / tasks.length) * 100)
      : 0;

  return (
    <section className="min-h-full w-full bg-[#f7f8fa] text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mx-auto w-full max-w-[1440px] px-4 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-8"
      >
        {/* Page heading */}
        <header className="mb-7 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Tasks
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Organize your action items, track progress, and keep
              every project moving forward.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void fetchTasks()}
              disabled={loading || refreshing}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={14}
                className={
                  loading || refreshing ? "animate-spin" : ""
                }
              />
              Refresh
            </button>

            <CreateTask onCreated={fetchTasks} />
          </div>
        </header>

        {/* Task statistics */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <TaskStat
            label="All tasks"
            value={tasks.length}
            description="Tasks across your workspace"
            icon={ClipboardList}
            variant="neutral"
          />

          <TaskStat
            label="Pending"
            value={pendingCount}
            description={
              pendingCount > 0
                ? "Items awaiting completion"
                : "Nothing outstanding"
            }
            icon={Clock3}
            variant="green"
          />

          <TaskStat
            label="Completed"
            value={completedCount}
            description={`${completionRate}% of loaded tasks completed`}
            icon={CheckCircle2}
            variant="neutral"
          />
        </div>

        {/* Progress overview */}
        {!loading && !error && tasks.length > 0 && (
          <div className="mb-6 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Overall progress
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Your task completion at a glance.
                </p>
              </div>

              <p className="text-lg font-semibold tracking-tight text-slate-900">
                {completionRate}
                <span className="ml-0.5 text-sm font-medium text-slate-400">
                  %
                </span>
              </p>
            </div>

            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label="Task completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completionRate}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="h-full rounded-full bg-slate-900"
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-slate-500">
              <span>{completedCount} completed</span>
              <span>{pendingCount} pending</span>
            </div>
          </div>
        )}

        {/* Main task panel */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.035)]">
          <div className="border-b border-slate-100 px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <ClipboardList size={18} strokeWidth={1.8} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Your task list
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {loading
                      ? "Retrieving your tasks..."
                      : `${filteredTasks.length} ${
                          filteredTasks.length === 1 ? "task" : "tasks"
                        } ${
                          activeFilter === "all"
                            ? "in total"
                            : `matching the ${activeFilter} filter`
                        }`}
                  </p>
                </div>
              </div>

              {!loading && !error && (
                <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {tasks.length} loaded
                </div>
              )}
            </div>

            <div className="mt-5">
              <TaskFilters
                activeFilter={activeFilter}
                onChange={setActiveFilter}
              />
            </div>
          </div>

          {loading ? (
            <TaskSkeleton />
          ) : error ? (
            <TaskError
              message={error}
              onRetry={() => void fetchTasks()}
              retrying={refreshing || loading}
            />
          ) : tasks.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-400">
                <ClipboardList size={27} strokeWidth={1.5} />
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-900">
                No tasks yet
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Your tasks will appear here as they are created.
                Create a task to start organizing your work.
              </p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <CheckCircle2 size={25} strokeWidth={1.6} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No {activeFilter} tasks
              </h3>

              <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
                There are no tasks matching this filter. Try another
                view to see more of your work.
              </p>

              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View all tasks
                <ArrowUpRight size={13} />
              </button>
            </div>
          ) : (
            <TaskList tasks={filteredTasks} />
          )}

          {!loading && !error && tasks.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-[11px] text-slate-500">
                Showing {filteredTasks.length} of {tasks.length} loaded tasks
              </p>

              {refreshing && (
                <span className="inline-flex items-center gap-2 text-[11px] text-slate-500">
                  <Loader2 size={12} className="animate-spin" />
                  Updating tasks...
                </span>
              )}
            </div>
          )}
        </section>

        <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">
          A clear view of your work, one task at a time.
        </p>
      </motion.div>
    </section>
  );
};
