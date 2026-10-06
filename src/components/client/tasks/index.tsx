"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TaskFilters, TaskFilter } from "./Filters";
import { TaskList } from "./List";

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

const tasks: ClientTask[] = [
  {
    id: "staff-photographs",
    title: "Provide final staff photographs",
    projectId: "global-crossfire",
    projectName: "Global Crossfire Church",
    projectType: "Website Development",
    dueDate: "Sep 20, 2024",
    status: "Pending",
  },
  {
    id: "homepage-design",
    title: "Approve homepage design",
    projectId: "global-crossfire",
    projectName: "Global Crossfire Church",
    projectType: "Website Development",
    dueDate: "Sep 30, 2024",
    status: "Pending",
  },
  {
    id: "church-email",
    title: "Provide church email",
    projectId: "global-crossfire",
    projectName: "Global Crossfire Church",
    projectType: "Website Development",
    dueDate: "Oct 1, 2024",
    status: "Pending",
  },
  {
    id: "logo-resolution",
    title: "Share logo in high resolution",
    projectId: "global-crossfire",
    projectName: "Global Crossfire Church",
    projectType: "Website Development",
    dueDate: "Sep 27, 2024",
    status: "Completed",
    completedAt: "Sep 27, 2024",
  },
];

export const TasksDashboard = () => {
  const [activeFilter, setActiveFilter] =
    useState<TaskFilter>("all");

  const filteredTasks = useMemo(() => {
    if (activeFilter === "pending") {
      return tasks.filter(
        (task) => task.status === "Pending"
      );
    }

    if (activeFilter === "completed") {
      return tasks.filter(
        (task) => task.status === "Completed"
      );
    }

    return tasks;
  }, [activeFilter]);

  return (
    <section className="w-full bg-[#fafafa]">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-full"
      >
        {/* Project heading */}
        <div className="px-1 pb-5 pt-10">
          <h1 className="text-[13px] font-semibold tracking-[-0.025em] text-black sm:text-[14px]">
            Global Crossfire Church
          </h1>

          <p className="mt-1 text-[7px] text-neutral-400 sm:text-[10px]">
            Website Development
          </p>
        </div>

        {/* Filters */}
        <TaskFilters
          activeFilter={activeFilter}
          onChange={setActiveFilter}
        />

        {/* Task list */}
        <TaskList tasks={filteredTasks} />
      </motion.div>
    </section>
  );
};