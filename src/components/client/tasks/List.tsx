"use client";
import { AnimatePresence } from "framer-motion";
import { TaskRow } from "./Row";
import type { ClientTask } from "./index";

interface TaskListProps {
  tasks: ClientTask[];
}

export const TaskList = ({
  tasks,
}: TaskListProps) => {
  if (!tasks.length) {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <div className="text-center">
          <p className="text-[10px] font-medium text-black">
            No tasks found
          </p>

          <p className="mt-1 text-[7px] text-neutral-400">
            There are no tasks in this category.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-100">
      <AnimatePresence initial={false}>
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};