import type { TaskPriority } from "./types";

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
}

const priorityStyles: Record<TaskPriority, string> = {
  Low: "bg-[#f5f5f5] text-[#777]",
  Medium: "bg-[#f1f1f1] text-[#555]",
  High: "bg-[#f8f1e8] text-[#916b3d]",
  Urgent: "bg-[#f9eeee] text-[#a44d4d]",
};

export const TaskPriorityBadge = ({priority}: TaskPriorityBadgeProps) => {
  return (
    <span
      className={`inline-flex rounded-[4px] px-1.5 py-0.5 text-[9px] font-medium ${priorityStyles[priority]}`}
    >
      {priority}
    </span>
  );
}