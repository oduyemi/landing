
"use client";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";

export type TaskStatus =
  | "Pending"
  | "In Progress"
  | "Completed"
  | "On Hold"
  | "Cancelled";

export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

interface TaskPerson {
  _id?: string;
  fname?: string;
  lname?: string;
  name?: string;
  email?: string;
  image?: string;
}

interface TaskProject {
  _id?: string;
  title?: string;
}

export interface AdminTask {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  project?: string | TaskProject | null;
  assignedUser?: string | TaskPerson | null;
  createdBy?: string | TaskPerson | null;
  assignedTo?: "client" | "admin";
}

interface TasksTableProps {
  tasks: AdminTask[];
  onEdit: (task: AdminTask) => void;
  onDelete: (task: AdminTask) => void | Promise<void>;
  deletingTaskId?: string | null;
  statusStyles?: Record<TaskStatus, string>;
  priorityStyles?: Record<TaskPriority, string>;
  onView?: (task: AdminTask) => void;
  loading?: boolean;
}

const statusStyles: Record<TaskStatus, string> = {
  Pending: "border-amber-200 bg-amber-50 text-amber-800",
  "In Progress": "border-blue-200 bg-blue-50 text-blue-800",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  "On Hold": "border-neutral-200 bg-neutral-100 text-neutral-700",
  Cancelled: "border-red-200 bg-red-50 text-red-700",
};

const priorityStyles: Record<TaskPriority, string> = {
  Low: "bg-neutral-100 text-neutral-600",
  Medium: "bg-blue-50 text-blue-700",
  High: "bg-orange-50 text-orange-700",
  Urgent: "bg-red-50 text-red-700",
};

function getPersonName(person?: string | TaskPerson | null) {
  if (!person) return "Unassigned";

  if (typeof person === "string") return "Assigned user";

  const name = [person.fname, person.lname].filter(Boolean).join(" ");

  return name || person.name || person.email || "Assigned user";
}

function getProjectName(project?: string | TaskProject | null) {
  if (!project) return "No project";
  if (typeof project === "string") return "Project";
  return project.title || "Untitled project";
}

function formatDate(date?: string | Date | null) {
  if (!date) return "No deadline";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "No deadline";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function isOverdue(task: AdminTask) {
  if (!task.dueDate || task.status === "Completed" || task.status === "Cancelled") {
    return false;
  }

  const deadline = new Date(task.dueDate);

  if (Number.isNaN(deadline.getTime())) return false;

  deadline.setHours(23, 59, 59, 999);

  return deadline.getTime() < Date.now();
}

function StatusBadge({
  status,
  styles = statusStyles,
}: {
  status: TaskStatus;
  styles?: Record<TaskStatus, string>;
}) {
  const icons: Record<TaskStatus, typeof Circle> = {
    Pending: Circle,
    "In Progress": Clock3,
    Completed: CheckCircle2,
    "On Hold": Circle,
    Cancelled: XCircle,
  };

  const Icon = icons[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-medium ${styles[status]}`}
    >
      <Icon size={11} strokeWidth={2} />
      {status}
    </span>
  );
}

function PriorityBadge({
  priority,
  styles = priorityStyles,
}: {
  priority: TaskPriority;
  styles?: Record<TaskPriority, string>;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold ${styles[priority]}`}
    >
      {(priority === "Urgent" || priority === "High") && (
        <AlertTriangle size={11} />
      )}
      {priority}
    </span>
  );
}

function TaskActions({
  task,
  onView,
  onEdit,
  onDelete,
  isDeleting = false,
}: {
  task: AdminTask;
  onView: (task: AdminTask) => void;
  onEdit: (task: AdminTask) => void;
  onDelete: (task: AdminTask) => void | Promise<void>;
  isDeleting?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative flex items-center justify-end gap-1">
      <button
        type="button"
        disabled={isDeleting}
        onClick={() => onView(task)}
        aria-label={`View ${task.title}`}
        title="View task"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Eye size={15} />
      </button>

      <button
        type="button"
        onClick={() => onEdit(task)}
        aria-label={`Edit ${task.title}`}
        title="Edit task"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
      >
        <Pencil size={14} />
      </button>

      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={`More actions for ${task.title}`}
        aria-expanded={menuOpen}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
      >
        <MoreHorizontal size={17} />
      </button>

      {menuOpen && (
  <>
    <button
      type="button"
      aria-label="Close task actions"
      className="fixed inset-0 z-10 cursor-default"
      onClick={() => setMenuOpen(false)}
    />

    <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-lg">
      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          onView(task);
        }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-neutral-700 transition hover:bg-neutral-50"
      >
        <Eye size={13} />
        View details
      </button>

      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          onEdit(task);
        }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-neutral-700 transition hover:bg-neutral-50"
      >
        <Pencil size={13} />
        Edit task
      </button>

      <div className="my-1 border-t border-neutral-100" />

      <button
        type="button"
        disabled={isDeleting}
        onClick={() => onDelete(task)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 size={13} />
        Delete task
      </button>
    </div>
  </>
)}
    </div>
  );
}

function TaskSkeleton() {
  return (
    <div className="divide-y divide-neutral-100">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 px-4 py-4 sm:px-5"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-2/5 animate-pulse rounded bg-neutral-100" />
            <div className="h-3 w-3/5 animate-pulse rounded bg-neutral-100" />
          </div>
          <div className="hidden h-6 w-20 animate-pulse rounded-full bg-neutral-100 sm:block" />
          <div className="hidden h-6 w-16 animate-pulse rounded bg-neutral-100 md:block" />
          <div className="h-3 w-16 animate-pulse rounded bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

export const TaskTable = ({
  tasks,
  loading = false,
  onView,
  onEdit,
  onDelete,
  deletingTaskId = null,
  statusStyles: customStatusStyles,
  priorityStyles: customPriorityStyles,
}: TasksTableProps) => {
  const safeTasks = useMemo(() => tasks ?? [], [tasks]);

  const handleView = onView ?? (() => {});
  const resolvedStatusStyles = customStatusStyles ?? statusStyles;
  const resolvedPriorityStyles = customPriorityStyles ?? priorityStyles;

  if (loading) {
    return (
      <div className="min-w-0 w-full">
        <TaskSkeleton />
      </div>
    );
  }

  if (safeTasks.length === 0) {
    return (
      <div className="px-5 py-14 text-center sm:py-16">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-neutral-500">
          <Check size={20} strokeWidth={1.6} />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-neutral-900">
          No tasks found
        </h3>

        <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-neutral-500">
          There are no tasks matching your current filters. Try adjusting your
          search or filter selections.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full">
      {/* Desktop table: 1200px and above */}
      <div className="hidden min-[1200px]:block">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse text-left">
            <thead>
              <tr className="border-y border-neutral-100 bg-neutral-50/70">
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Task
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Project
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Assignee
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Priority
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Status
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Due date
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {safeTasks.map((task) => {
                const overdue = isOverdue(task);

                return (
                  <tr
                    key={task._id}
                    className="group transition-colors hover:bg-neutral-50/70"
                  >
                    <td className="max-w-[300px] px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleView(task)}
                        className="block max-w-full text-left focus-visible:outline-none focus-visible:underline"
                      >
                        <span className="block truncate text-xs font-semibold text-neutral-800 transition group-hover:text-black">
                          {task.title}
                        </span>
                        <span className="mt-1 block truncate text-[11px] text-neutral-400">
                          {task.description || "No description provided"}
                        </span>
                      </button>
                    </td>

                    <td className="max-w-[170px] px-4 py-4">
                      <span className="block truncate text-xs text-neutral-600">
                        {getProjectName(task.project)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-500">
                          <UserRound size={13} />
                        </span>
                        <span className="max-w-[140px] truncate text-xs text-neutral-600">
                          {getPersonName(task.assignedUser)}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <PriorityBadge
  priority={task.priority}
  styles={resolvedPriorityStyles}
/>

                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge
  status={task.status}
  styles={resolvedStatusStyles}
/>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs ${
                          overdue ? "font-medium text-red-600" : "text-neutral-500"
                        }`}
                      >
                        <CalendarDays size={12} />
                        {formatDate(task.dueDate)}
                      </span>
                      {overdue && (
                        <span className="mt-1 block text-[10px] text-red-500">
                          Overdue
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                    <TaskActions
                      task={task}
                      onView={handleView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isDeleting={deletingTaskId === task._id}
                    />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablet table: 768px through 1199px */}
      <div className="hidden md:block min-[1200px]:hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-y border-neutral-100 bg-neutral-50/70">
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Task
                </th>
                <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Assignee
                </th>
                <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Priority
                </th>
                <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Status
                </th>
                <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Due date
                </th>
                <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {safeTasks.map((task) => {
                const overdue = isOverdue(task);

                return (
                  <tr
                    key={task._id}
                    className="group transition-colors hover:bg-neutral-50/70"
                  >
                    <td className="max-w-[230px] px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleView(task)}
                        className="block max-w-full text-left focus-visible:outline-none focus-visible:underline"
                      >
                        <span className="block truncate text-xs font-semibold text-neutral-800">
                          {task.title}
                        </span>
                        <span className="mt-1 block truncate text-[11px] text-neutral-400">
                          {getProjectName(task.project)}
                        </span>
                      </button>
                    </td>

                    <td className="max-w-[140px] px-3 py-4">
                      <span className="block truncate text-xs text-neutral-600">
                        {getPersonName(task.assignedUser)}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <PriorityBadge
  priority={task.priority}
  styles={resolvedPriorityStyles}
/>

                    </td>

                    <td className="px-3 py-4">
                      <StatusBadge
  status={task.status}
  styles={resolvedStatusStyles}
/>
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`whitespace-nowrap text-xs ${
                          overdue ? "font-medium text-red-600" : "text-neutral-500"
                        }`}
                      >
                        {formatDate(task.dueDate)}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                    <TaskActions
                      task={task}
                      onView={handleView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isDeleting={deletingTaskId === task._id}
                    />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="divide-y divide-neutral-100 md:hidden">
        {safeTasks.map((task) => {
          const overdue = isOverdue(task);

          return (
            <article
              key={task._id}
              className="px-4 py-4 transition-colors hover:bg-neutral-50/70 sm:px-5"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleView(task)}
                  className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:underline"
                >
                  <span className="block break-words text-sm font-semibold leading-5 text-neutral-900">
                    {task.title}
                  </span>
                  <span className="mt-1.5 block truncate text-[11px] text-neutral-500">
                    {getProjectName(task.project)}
                  </span>
                </button>

                <PriorityBadge
                  priority={task.priority}
                  styles={resolvedPriorityStyles}
                />
              </div>

              {task.description && (
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-500">
                  {task.description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge
                  status={task.status}
                  styles={resolvedStatusStyles}
                />

                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] ${
                    overdue ? "font-medium text-red-600" : "text-neutral-500"
                  }`}
                >
                  <CalendarDays size={12} />
                  {formatDate(task.dueDate)}
                </span>

                {overdue && (
                  <span className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-medium text-red-600">
                    Overdue
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-500">
                    <UserRound size={13} />
                  </span>

                  <div className="min-w-0">
                    <span className="block text-[10px] text-neutral-400">
                      Assigned to
                    </span>
                    <span className="block max-w-[180px] truncate text-xs font-medium text-neutral-700">
                      {getPersonName(task.assignedUser)}
                    </span>
                  </div>
                </div>

                <TaskActions
                  task={task}
                  onView={handleView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isDeleting={deletingTaskId === task._id}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
