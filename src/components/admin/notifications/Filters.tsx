
"use client";
import { RotateCcw, SlidersHorizontal } from "lucide-react";


export type NotificationTypeFilter =
  | "all"
  | "task"
  | "message"
  | "file"
  | "project"
  | "deliverable"
  | "milestone"
  | "system";

export type NotificationReadFilter =
  | "all"
  | "unread"
  | "read";

interface NotificationFiltersProps {
  type: NotificationTypeFilter;
  readStatus: NotificationReadFilter;
  onTypeChange: (value: NotificationTypeFilter) => void;
  onReadStatusChange: (value: NotificationReadFilter) => void;
  onReset: () => void;
}

const typeOptions: {
  value: NotificationTypeFilter;
  label: string;
}[] = [
  { value: "all", label: "All types" },
  { value: "task", label: "Tasks" },
  { value: "message", label: "Messages" },
  { value: "file", label: "Files" },
  { value: "project", label: "Projects" },
  { value: "deliverable", label: "Deliverables" },
  { value: "milestone", label: "Milestones" },
  { value: "system", label: "System" },
];

const readOptions: {
  value: NotificationReadFilter;
  label: string;
}[] = [
  { value: "all", label: "All notifications" },
  { value: "unread", label: "Unread only" },
  { value: "read", label: "Read only" },
];

const selectClass =
  "h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-xs text-neutral-700 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100";

export const NotificationFilters = ({
  type,
  readStatus,
  onTypeChange,
  onReadStatusChange,
  onReset,
}: NotificationFiltersProps) => {
  const hasActiveFilters =
    type !== "all" || readStatus !== "all";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex items-center gap-2 pb-0.5 text-neutral-500 sm:mr-1">
        <SlidersHorizontal size={14} />
        <span className="text-xs font-medium">Filters</span>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="notification-type"
            className="block text-[11px] font-medium text-neutral-500"
          >
            Notification type
          </label>

          <select
            id="notification-type"
            value={type}
            onChange={(event) =>
              onTypeChange(
                event.target.value as NotificationTypeFilter
              )
            }
            className={selectClass}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="notification-read-status"
            className="block text-[11px] font-medium text-neutral-500"
          >
            Read status
          </label>

          <select
            id="notification-read-status"
            value={readStatus}
            onChange={(event) =>
              onReadStatusChange(
                event.target.value as NotificationReadFilter
              )
            }
            className={selectClass}
          >
            {readOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      )}
    </div>
  );
}
