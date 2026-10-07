"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileCheck2, LoaderCircle, AlertCircle } from "lucide-react";

interface ActionTask {
  _id: string;
  title: string;
  status:
    | "Pending"
    | "In Progress"
    | "Completed"
    | "On Hold"
    | "Cancelled";
  priority:
    | "Low"
    | "Medium"
    | "High"
    | "Urgent";
  dueDate?: string | null;
  project?: {
    _id: string;
    title: string;
  } | null;
}

export const ActionRequired = () => {
  const [tasks, setTasks] = useState<ActionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchActions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/tasks/action-required",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to load required actions."
          );
        }

        if (!controller.signal.aborted) {
          setTasks(data.tasks ?? []);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "FETCH ACTION REQUIRED ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load required actions."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchActions();

    return () => controller.abort();
  }, []);

  const formatDeadline = (date?: string | null) => {
    if (!date) {
      return null;
    }

    const deadline = new Date(date);

    if (Number.isNaN(deadline.getTime())) {
      return null;
    }

    return `Due ${deadline.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    )}`;
  };

  return (
    <section className="overflow-hidden rounded-[6px] border border-[#e7e7e7] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#eeeeee] px-4 py-3">
        <div>
          <h2 className="text-[11px] font-semibold text-[#222]">
            Action Required
          </h2>

          {!loading && !error && (
            <p className="mt-0.5 text-[8px] text-[#999]">
              {tasks.length === 0
                ? "Nothing requires your attention"
                : `${tasks.length} ${
                    tasks.length === 1
                      ? "action"
                      : "actions"
                  } require your attention`}
            </p>
          )}
        </div>

        {!loading && !error && tasks.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f4f4f4] px-1.5 text-[8px] font-semibold text-[#555]">
            {tasks.length}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="divide-y divide-[#f0f0f0]">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="h-[22px] w-[22px] animate-pulse rounded-full bg-[#f1f1f1]" />

              <div className="min-w-0 flex-1">
                <div className="h-2.5 w-3/5 animate-pulse rounded bg-[#f1f1f1]" />

                <div className="mt-1.5 h-2 w-2/5 animate-pulse rounded bg-[#f5f5f5]" />
              </div>

              <div className="h-2 w-12 animate-pulse rounded bg-[#f3f3f3]" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex min-h-[90px] flex-col items-center justify-center px-4 py-6 text-center">
          <AlertCircle
            className="h-3.5 w-3.5 text-[#999]"
            strokeWidth={1.6}
          />

          <p className="mt-2 text-[9px] text-[#888]">
            {error}
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && tasks.length === 0 && (
        <div className="flex min-h-[100px] flex-col items-center justify-center px-4 py-6 text-center">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e7e7e7] bg-[#fafafa]">
            <FileCheck2
              className="h-3 w-3 text-[#999]"
              strokeWidth={1.6}
            />
          </div>

          <p className="mt-2 text-[9px] font-medium text-[#444]">
            You&apos;re all caught up
          </p>

          <p className="mt-1 text-[8px] text-[#aaa]">
            Nothing currently requires your attention.
          </p>
        </div>
      )}

      {/* Tasks */}
      {!loading && !error && tasks.length > 0 && (
        <div className="divide-y divide-[#f0f0f0]">
          {tasks.map((task, index) => {
            const deadline = formatDeadline(
              task.dueDate
            );

            return (
              <motion.div
                key={task._id}
                initial={{
                  opacity: 0,
                  y: 4,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.05,
                }}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#fcfcfc]"
              >
                {/* Task icon */}
                <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-[#e4e4e4]">
                  <FileCheck2
                    className="h-[11px] w-[11px] text-[#444]"
                    strokeWidth={1.8}
                  />
                </div>

                {/* Task information */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium text-[#333]">
                    {task.title}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-[#999]">
                    {task.project?.title ??
                      "Project"}
                  </p>
                </div>

                {/* Deadline */}
                {deadline && (
                  <span className="whitespace-nowrap text-[10px] font-medium text-[#444]">
                    {deadline}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
};