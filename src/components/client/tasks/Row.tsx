"use client";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { ClientTask } from "./index";


interface TaskRowProps {
  task: ClientTask;
}

export const TaskRow = ({
  task,
}: TaskRowProps) => {
  const completed =
    task.status === "Completed";

  return (
    <motion.button
      type="button"
      initial={{
        opacity: 0,
        y: 4,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -4,
      }}
      transition={{
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        backgroundColor: "rgba(250,250,250,0.8)",
      }}
      className="group flex w-full items-center gap-3 px-1 py-4 text-left transition-colors"
    >
      {/* Checkbox */}
      <span
        className={[
          "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[2px] border",
          completed
            ? "border-black bg-black"
            : "border-neutral-300 bg-white",
        ].join(" ")}
      >
        {completed && (
          <svg
            viewBox="0 0 12 12"
            fill="none"
            className="h-2.5 w-2.5 text-white"
          >
            <path
              d="M2.2 6.1 4.8 8.6 9.8 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>

      {/* Task information */}
      <div className="min-w-0 flex-1">
        <p
          className={[
            "truncate text-[10px] font-medium",
            completed
              ? "text-neutral-500"
              : "text-black",
          ].join(" ")}
        >
          {task.title}
        </p>

        <div className="mt-1 flex items-center gap-1">
          <span className="text-[6.5px] text-neutral-400">
            Due {task.dueDate ?? "No due date"}
          </span>

          {completed && task.completedAt && (
            <>
              <span className="text-[6px] text-neutral-300">
                ·
              </span>

              <span className="text-[6.5px] text-neutral-400">
                {task.completedAt}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Status */}
      <span
        className={[
          "shrink-0 rounded-full px-2 py-1 text-[6px] font-medium",
          completed
            ? "bg-emerald-50 text-emerald-700"
            : "bg-neutral-100 text-neutral-500",
        ].join(" ")}
      >
        {task.status}
      </span>

      {/* Arrow */}
      <ChevronRight
        size={11}
        strokeWidth={1.5}
        className="shrink-0 text-neutral-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-black"
      />
    </motion.button>
  );
};