"use client";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
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

interface ApiProject {
  _id: string;
  title: string;
  type?: string;
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

const normalizeTask = (
  task: ApiTask
): ClientTask => {
  return {
    id: task._id,

    title: task.title,

    description: task.description,

    projectId:
      task.project?._id || "",

    projectName:
      task.project?.title ||
      "General task",

    projectType:
      task.project?.type ||
      "Project",

    dueDate:
      task.dueDate || undefined,

    status:
      task.status === "Completed"
        ? "Completed"
        : "Pending",

    createdAt:
      task.createdAt,

    completedAt:
      task.completedAt ||
      undefined,
  };
};

export const TasksDashboard = () => {
  const [activeFilter, setActiveFilter] =
    useState<TaskFilter>("all");

  const [tasks, setTasks] = useState<
    ClientTask[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchTasks = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/tasks?limit=100",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to load tasks."
          );
        }

        const apiTasks =
          data?.tasks ??
          data?.data ??
          [];

        setTasks(
          apiTasks.map(
            normalizeTask
          )
        );
      } catch (error) {
        console.error(
          "FETCH TASKS ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load tasks."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = useMemo(() => {
    if (
      activeFilter === "pending"
    ) {
      return tasks.filter(
        (task) =>
          task.status ===
          "Pending"
      );
    }

    if (
      activeFilter === "completed"
    ) {
      return tasks.filter(
        (task) =>
          task.status ===
          "Completed"
      );
    }

    return tasks;
  }, [activeFilter, tasks]);

  const pendingCount =
    tasks.filter(
      (task) =>
        task.status ===
        "Pending"
    ).length;

  const completedCount =
    tasks.filter(
      (task) =>
        task.status ===
        "Completed"
    ).length;

  return (
    <section className="w-full bg-[#fafafa]">
      <motion.div
        initial={{
          opacity: 0,
          y: 6,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
        className="w-full"
      >
        {/* Header */}
        <div className="flex items-end justify-between gap-4 px-1 pb-5 pt-10">
          <div>
            <h1 className="text-[13px] font-semibold tracking-[-0.025em] text-black sm:text-[14px]">
              Tasks
            </h1>

            <p className="mt-1 text-[7px] text-neutral-400 sm:text-[10px]">
              Action items across your projects
            </p>
          </div>

          <CreateTask
            onCreated={fetchTasks}
          />
        </div>

        {/* Small summary */}
        {!loading && !error && (
          <div className="mb-4 flex items-center gap-4 px-1">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-black" />

              <span className="text-[8px] text-neutral-500">
                {pendingCount} pending
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />

              <span className="text-[8px] text-neutral-400">
                {completedCount} completed
              </span>
            </div>
          </div>
        )}

        {/* Filters */}
        <TaskFilters
          activeFilter={activeFilter}
          onChange={setActiveFilter}
        />

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2
                className="h-3.5 w-3.5 animate-spin text-neutral-400"
                strokeWidth={1.7}
              />

              <p className="text-[8px] text-neutral-400">
                Loading tasks...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-red-50">
                <AlertCircle
                  className="h-3.5 w-3.5 text-red-500"
                  strokeWidth={1.7}
                />
              </div>

              <p className="mt-2 text-[9px] font-medium text-black">
                Unable to load tasks
              </p>

              <p className="mt-1 max-w-[240px] text-[7px] leading-relaxed text-neutral-400">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchTasks}
                className="mx-auto mt-3 inline-flex items-center gap-1.5 text-[8px] font-medium text-black transition hover:text-neutral-500"
              >
                <RefreshCw
                  className="h-2.5 w-2.5"
                  strokeWidth={1.8}
                />

                Try again
              </button>
            </div>
          </div>
        )}

        {/* Tasks */}
        {!loading &&
          !error && (
            <TaskList
              tasks={filteredTasks}
            />
          )}
      </motion.div>
    </section>
  );
};