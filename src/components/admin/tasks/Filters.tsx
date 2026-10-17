"use client";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { TaskStatus } from "./types";
import { TASK_STATUSES } from "./types";


export type TaskTypeFilter = "all" | "client" | "admin";



interface TaskFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  project: string;
  onProjectChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  type: TaskTypeFilter;
  onTypeChange: (value: TaskTypeFilter) => void;
  projects: { _id: string; title: string }[];
  onReset: () => void;
}

const inputClass =
  "h-[34px] w-full rounded-[5px] border border-[#e8e8e8] bg-white px-3 text-[10px] text-[#333] outline-none transition placeholder:text-[#a0a0a0] focus:border-[#bdbdbd] focus:ring-2 focus:ring-black/[0.03]";

const selectClass =
  "h-[34px] min-w-0 rounded-[5px] border border-[#e8e8e8] bg-white px-2.5 text-[10px] text-[#444] outline-none transition focus:border-[#bdbdbd]";

export const TaskFilters = ({
  search,
  onSearchChange,
  project,
  onProjectChange,
  status,
  onStatusChange,
  type,
  onTypeChange,
  projects,
  onReset,
}: TaskFiltersProps) => {
  const hasFilters = Boolean(
    search.trim() ||
    project ||
    status ||
    type !== "all"
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={13}
            strokeWidth={1.8}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#999]"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder="Search tasks..."
            aria-label="Search tasks"
            className={`${inputClass} pl-8 pr-8`}
          />

          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#222]"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0">
          <select
            value={project}
            onChange={(event) =>
              onProjectChange(event.target.value)
            }
            aria-label="Filter by project"
            className={`${selectClass} w-full sm:w-[126px]`}
          >
            <option value="">All Projects</option>
            {projects.map((item) => (
              <option key={item._id} value={item._id}>
                {item.title}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value)
            }
            aria-label="Filter by status"
            className={`${selectClass} w-full sm:w-[112px]`}
          >
            <option value="">All Statuses</option>
            {TASK_STATUSES.map((item: TaskStatus) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={type}
            onChange={(event) =>
              onTypeChange(event.target.value as TaskTypeFilter)
            }
            aria-label="Filter by assignment type"
            className={`${selectClass} w-full sm:w-[100px]`}
          >
            <option value="all">All Types</option>
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {hasFilters && (
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] text-[#888]">
            <SlidersHorizontal size={11} />
            Filters applied
          </span>

          <button
            type="button"
            onClick={onReset}
            className="text-[10px] font-medium text-[#555] transition hover:text-black"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
