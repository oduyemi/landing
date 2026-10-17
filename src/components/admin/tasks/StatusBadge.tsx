import type { TaskStatus } from "./types";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

const statusStyles: Record<TaskStatus, string> = {
  Pending: "border-[#e8e1cf] bg-[#faf8f1] text-[#8a7441]",
  "In Progress": "border-[#dce6f5] bg-[#f2f6fc] text-[#426b9c]",
  Completed: "border-[#d7e9dc] bg-[#f0f8f2] text-[#477b55]",
  "On Hold": "border-[#e7e0f1] bg-[#f7f4fb] text-[#78619b]",
  Cancelled: "border-[#e8dada] bg-[#faf3f3] text-[#9a6262]",
};

export const TaskStatusBadge = ({status}: TaskStatusBadgeProps) => {
  return (
    <span
      className={`inline-flex whitespace-nowrap items-center rounded-full border px-2 py-0.5 text-[9px] font-medium ${statusStyles[status]}`}
    >
      <span className="mr-1.5 h-1 w-1 rounded-full bg-current" />
      {status}
    </span>
  );
}