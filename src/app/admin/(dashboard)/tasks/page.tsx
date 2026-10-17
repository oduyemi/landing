"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  CircleDashed,
  Clock3,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { TaskTable, type AdminTask, type TaskPriority, type TaskStatus } from "@/components/admin/tasks/TasksTable";
import { motion, AnimatePresence } from "framer-motion";


function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="mb-1.5 block text-[11px] font-medium text-[#444]">
      {children}
      {required && (
        <span className="ml-1 text-rose-500" aria-hidden="true">
          *
        </span>
      )}
    </div>
  );
}

function toDateInputValue(value?: string | Date | null): string {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const inputClass =
  "h-10 w-full rounded-[5px] border border-[#e5e5e5] bg-white px-3 text-[11px] text-[#222] outline-none placeholder:text-[#a3a3a3] focus:border-[#aaa]";

const selectClass =
  "h-10 w-full rounded-[5px] border border-[#e5e5e5] bg-white px-3 text-[11px] text-[#444] outline-none focus:border-[#aaa] disabled:opacity-60";

  function TaskModal({
    open,
    onClose,
    onSaved,
    projects,
    clients = [],
    currentUserId,
    initialTask,
  }: {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
    projects: ProjectOption[];
    clients?: UserOption[];
    currentUserId: string;
    initialTask?: AdminTask | null;
  }) {
    const editing = Boolean(initialTask);
  
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [projectId, setProjectId] = useState("");
    const [assignedTo, setAssignedTo] =
      useState<"client" | "admin">("client");
    const [adminAssignment, setAdminAssignment] =
      useState<"self" | "other">("self");
    const [otherAdminId, setOtherAdminId] = useState("");
    const [status, setStatus] = useState<TaskStatus>("Pending");
    const [priority, setPriority] =
      useState<TaskPriority>("Medium");
    const [dueDate, setDueDate] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
  
    const selectedProject = useMemo(
      () => projects.find((item) => item._id === projectId),
      [projects, projectId]
    );
  
    const projectClientId =
      selectedProject?.client &&
      typeof selectedProject.client !== "string"
        ? selectedProject.client._id
        : typeof selectedProject?.client === "string"
          ? selectedProject.client
          : "";
  
    const availableClients = useMemo(
      () =>
        projectClientId
          ? clients.filter(
              (client) =>
                client._id === projectClientId &&
                client.role !== "admin"
            )
          : [],
      [clients, projectClientId]
    );
  
    const admins = useMemo(
      () => clients.filter((user) => user.role === "admin"),
      [clients]
    );
  
    const currentAdmin = useMemo(
      () => admins.find((admin) => admin._id === currentUserId),
      [admins, currentUserId]
    );
  
    const otherAdmins = useMemo(
      () => admins.filter((admin) => admin._id !== currentUserId),
      [admins, currentUserId]
    );
  
    const assignedUser = useMemo(() => {
      if (assignedTo === "client") {
        return projectClientId;
      }
  
      return adminAssignment === "self"
        ? currentUserId
        : otherAdminId;
    }, [
      assignedTo,
      projectClientId,
      adminAssignment,
      currentUserId,
      otherAdminId,
    ]);
  
    useEffect(() => {
      if (!open) return;
  
      const existingProject: string =
        initialTask?.project &&
        typeof initialTask.project !== "string"
          ? initialTask.project._id ?? ""
          : typeof initialTask?.project === "string"
            ? initialTask.project
            : "";
  
      setTitle(initialTask?.title || "");
      setDescription(initialTask?.description || "");
      setProjectId(existingProject);
      setStatus(initialTask?.status || "Pending");
      setPriority(initialTask?.priority || "Medium");
      setDueDate(toDateInputValue(initialTask?.dueDate));
      setAssignedTo("client");
      setAdminAssignment("self");
      setOtherAdminId("");
      setError("");
  
      // Editing changes task details, not the existing assignee.
    }, [open, initialTask]);
  
    useEffect(() => {
      if (!otherAdmins.length) {
        setOtherAdminId("");
        return;
      }
  
      setOtherAdminId((current) =>
        current && otherAdmins.some((admin) => admin._id === current)
          ? current
          : otherAdmins[0]._id
      );
    }, [otherAdmins]);
  
    async function handleSubmit(
      event: React.FormEvent<HTMLFormElement>
    ) {
      event.preventDefault();
      setError("");
  
      if (!title.trim() || !projectId) {
        setError("Enter a task title and select a project.");
        return;
      }
  
      if (!editing && assignedTo === "client") {
        if (!projectClientId || availableClients.length === 0) {
          setError(
            "The selected project does not have a matching client."
          );
          return;
        }
      }
  
      if (!editing && assignedTo === "admin") {
        if (!currentUserId || !currentAdmin) {
          setError(
            "Unable to identify your admin account. Reload the page and try again."
          );
          return;
        }
  
        if (
          adminAssignment === "other" &&
          (!otherAdminId ||
            !otherAdmins.some((admin) => admin._id === otherAdminId))
        ) {
          setError("Select another admin to assign this task to.");
          return;
        }
      }
  
      setSaving(true);
  
      try {
        const url = editing
          ? `/api/tasks/${initialTask!._id}`
          : "/api/tasks";
  
        const method = editing ? "PATCH" : "POST";
  
        const payload = editing
          ? {
              title: title.trim(),
              description: description.trim(),
              status,
              priority,
              dueDate: dueDate || null,
            }
          : {
              project: projectId,
              title: title.trim(),
              description: description.trim(),
              status,
              priority,
              assignedTo,
              assignedUser,
              dueDate: dueDate || null,
            };
  
        const response = await fetch(url, {
          method,
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
  
        const result = (await response.json()) as ApiResponse<AdminTask>;
        if (!response.ok || !result.success) {
          throw new Error(
            result.error || result.message || "Unable to save task."
          );
        }
  
        await onSaved();
        onClose();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to save task."
        );
      } finally {
        setSaving(false);
      }
    }
  
    const fieldDisabled = saving || editing;
  
    const inactivePanel =
      "pointer-events-none select-none opacity-40";
  
    const personLabel = (user: UserOption) => {
      const name = `${user.fname ?? ""} ${user.lname ?? ""}`.trim();
      return name || user.email || "Unnamed user";
    };
  
    return (
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close task form"
              disabled={saving}
              className="fixed inset-0 z-[80] cursor-default bg-black/25 backdrop-blur-[1px] disabled:cursor-wait"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
  
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="task-modal-title"
              className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto p-4"
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.99 }}
              transition={{ duration: 0.18 }}
            >
              <form
                onSubmit={handleSubmit}
                className="my-auto w-full max-w-[560px] rounded-[9px] border border-[#e7e7e7] bg-white shadow-xl"
              >
                <div className="flex items-start justify-between border-b border-[#ededed] px-5 py-4">
                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-[0.13em] text-[#999]">
                      Task management
                    </p>
  
                    <h2
                      id="task-modal-title"
                      className="mt-1 text-[15px] font-semibold tracking-[-0.03em] text-[#171717]"
                    >
                      {editing ? "Edit task" : "Create task"}
                    </h2>
  
                    <p className="mt-1 text-[10px] text-[#888]">
                      {editing
                        ? "Update task details and progress."
                        : "Assign work to a project client or an admin."}
                    </p>
                  </div>
  
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="rounded-[5px] p-1.5 text-[#777] hover:bg-[#f5f5f5] disabled:opacity-50"
                    aria-label="Close"
                  >
                    <X size={15} />
                  </button>
                </div>
  
                <div className="max-h-[75vh] space-y-4 overflow-y-auto p-5">
                  {error && (
                    <div
                      role="alert"
                      className="flex gap-2 rounded-[5px] border border-[#f0dada] bg-[#fff7f7] p-3 text-[10px] text-[#a44444]"
                    >
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
  
                  <div>
                    <FieldLabel required>Task title</FieldLabel>
                    <input
                      autoFocus
                      required
                      maxLength={160}
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="e.g. Complete homepage design"
                      disabled={saving}
                      className={inputClass}
                    />
                  </div>
  
                  <div>
                    <FieldLabel>Description</FieldLabel>
                    <textarea
                      rows={3}
                      maxLength={4000}
                      value={description}
                      onChange={(event) =>
                        setDescription(event.target.value)
                      }
                      placeholder="Add instructions or context for this task..."
                      disabled={saving}
                      className="w-full resize-y rounded-[5px] border border-[#e5e5e5] px-3 py-2.5 text-[11px] outline-none placeholder:text-[#a3a3a3] focus:border-[#aaa] disabled:opacity-60"
                    />
                  </div>
  
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <FieldLabel required>Project</FieldLabel>
                      <select
                        required
                        disabled={fieldDisabled}
                        value={projectId}
                        onChange={(event) => {
                          setProjectId(event.target.value);
                          setError("");
                        }}
                        className={selectClass}
                      >
                        <option value="">Select project</option>
                        {projects.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.title}
                          </option>
                        ))}
                      </select>
  
                      {editing && (
                        <p className="mt-1 text-[9px] text-[#999]">
                          The project cannot be changed here.
                        </p>
                      )}
                    </div>
  
                    {editing ? (
                      <div>
                        <FieldLabel>Current assignee</FieldLabel>
                        <div className="flex h-10 items-center rounded-[5px] border border-[#e5e5e5] bg-[#fafafa] px-3 text-[11px] text-[#666]">
                          {initialTask?.assignedUser &&
                          typeof initialTask.assignedUser !== "string"
                            ? [
                                initialTask.assignedUser.fname,
                                initialTask.assignedUser.lname,
                              ]
                                .filter(Boolean)
                                .join(" ") ||
                              initialTask.assignedUser.email ||
                              "Assigned user"
                            : "Existing assignee"}
                        </div>
                        <p className="mt-1 text-[9px] text-[#999]">
                          Change assignment when creating a new task.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <FieldLabel>Project client</FieldLabel>
                        <select
                          value={assignedTo === "client" ? projectClientId : ""}
                          disabled
                          className={selectClass}
                          aria-label="Project client"
                        >
                          <option value="">
                            {projectId
                              ? "No client available"
                              : "Select a project first"}
                          </option>
                          {availableClients.map((client) => (
                            <option key={client._id} value={client._id}>
                              {personLabel(client)}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-[9px] text-[#999]">
                          The client is determined by the selected project.
                        </p>
                      </div>
                    )}
                  </div>
  
                  {!editing && (
                    <section className="space-y-3 rounded-[6px] border border-[#e8e8e8] p-3.5">
                      <div>
                        <FieldLabel required>Assign task to</FieldLabel>
                        <p className="text-[10px] leading-4 text-[#888]">
                          Choose one assignment target: the project client
                          or an admin.
                        </p>
                      </div>
  
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAssignedTo("client");
                            setError("");
                          }}
                          disabled={saving}
                          aria-pressed={assignedTo === "client"}
                          className={`rounded-[5px] border p-3 text-left transition ${
                            assignedTo === "client"
                              ? "border-[#333] bg-[#f7f7f7]"
                              : "border-[#e5e5e5] hover:border-[#bbb]"
                          }`}
                        >
                          <span className="block text-[11px] font-semibold text-[#222]">
                            Project client
                          </span>
                          <span className="mt-1 block text-[9px] leading-4 text-[#888]">
                            Assign work to the client
                          </span>
                        </button>
  
                        <button
                          type="button"
                          onClick={() => {
                            setAssignedTo("admin");
                            setError("");
                          }}
                          disabled={saving}
                          aria-pressed={assignedTo === "admin"}
                          className={`rounded-[5px] border p-3 text-left transition ${
                            assignedTo === "admin"
                              ? "border-[#333] bg-[#f7f7f7]"
                              : "border-[#e5e5e5] hover:border-[#bbb]"
                          }`}
                        >
                          <span className="block text-[11px] font-semibold text-[#222]">
                            Admin
                          </span>
                          <span className="mt-1 block text-[9px] leading-4 text-[#888]">
                            Yourself or another admin
                          </span>
                        </button>
                      </div>
  
                      <div
                        className={`space-y-2 rounded-[5px] border border-[#ededed] p-3 ${
                          assignedTo !== "client" ? inactivePanel : ""
                        }`}
                        aria-disabled={assignedTo !== "client"}
                      >
                        <FieldLabel>Client assignment</FieldLabel>
                        <select
                          value={assignedTo === "client" ? projectClientId : ""}
                          disabled={
                            assignedTo !== "client" ||
                            saving ||
                            !projectId ||
                            availableClients.length === 0
                          }
                          className={selectClass}
                        >
                          <option value="">
                            {!projectId
                              ? "Select a project first"
                              : "No matching project client"}
                          </option>
                          {availableClients.map((client) => (
                            <option key={client._id} value={client._id}>
                              {personLabel(client)}
                              {client.email ? ` (${client.email})` : ""}
                            </option>
                          ))}
                        </select>
                        {assignedTo === "client" &&
                          projectId &&
                          availableClients.length === 0 && (
                            <p className="text-[9px] text-[#a16b16]">
                              This project has no matching client.
                            </p>
                          )}
                      </div>
  
                      <div
                        className={`space-y-3 rounded-[5px] border border-[#ededed] p-3 ${
                          assignedTo !== "admin" ? inactivePanel : ""
                        }`}
                        aria-disabled={assignedTo !== "admin"}
                      >
                        <div>
                          <FieldLabel>Admin assignment</FieldLabel>
                          <select
                            value={adminAssignment}
                            onChange={(event) => {
                              setAdminAssignment(
                                event.target.value as "self" | "other"
                              );
                              setError("");
                            }}
                            disabled={assignedTo !== "admin" || saving}
                            className={selectClass}
                          >
                            <option value="self">Myself</option>
                            <option value="other">Another admin</option>
                          </select>
                        </div>
  
                        {adminAssignment === "self" ? (
                          <div className="rounded-[5px] bg-[#fafafa] px-3 py-2.5">
                            <p className="text-[9px] text-[#999]">
                              Task assignee
                            </p>
                            <p className="mt-1 text-[11px] font-medium text-[#333]">
                              {currentAdmin
                                ? personLabel(currentAdmin)
                                : "Signed-in admin not found"}
                            </p>
                            {currentAdmin?.email && (
                              <p className="mt-0.5 text-[9px] text-[#888]">
                                {currentAdmin.email}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <FieldLabel required>Select another admin</FieldLabel>
                            <select
                              value={otherAdminId}
                              onChange={(event) =>
                                setOtherAdminId(event.target.value)
                              }
                              disabled={
                                assignedTo !== "admin" ||
                                saving ||
                                otherAdmins.length === 0
                              }
                              required={
                                assignedTo === "admin" &&
                                adminAssignment === "other"
                              }
                              className={selectClass}
                            >
                              <option value="">Select admin</option>
                              {otherAdmins.map((admin) => (
                                <option key={admin._id} value={admin._id}>
                                  {personLabel(admin)}
                                  {admin.email ? ` (${admin.email})` : ""}
                                </option>
                              ))}
                            </select>
  
                            {otherAdmins.length === 0 && (
                              <p className="mt-1 text-[9px] text-[#a16b16]">
                                No other admins are available.
                              </p>
                            )}
                          </div>
                        )}
  
                        <p className="text-[9px] leading-4 text-[#888]">
                          The admin assignee does not have to be the
                          project&apos;s client. The task remains linked
                          to the selected project.
                        </p>
                      </div>
                    </section>
                  )}
  
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <FieldLabel>Status</FieldLabel>
                      <select
                        value={status}
                        onChange={(event) =>
                          setStatus(event.target.value as TaskStatus)
                        }
                        disabled={saving}
                        className={selectClass}
                      >
                        {STATUSES.filter((value) => value !== "All").map(
                          (value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          )
                        )}
                      </select>
                    </div>
  
                    <div>
                      <FieldLabel>Priority</FieldLabel>
                      <select
                        value={priority}
                        onChange={(event) =>
                          setPriority(event.target.value as TaskPriority)
                        }
                        disabled={saving}
                        className={selectClass}
                      >
                        {PRIORITIES.filter((value) => value !== "All").map(
                          (value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          )
                        )}
                      </select>
                    </div>
  
                    <div>
                      <FieldLabel>Due date</FieldLabel>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(event) => setDueDate(event.target.value)}
                        disabled={saving}
                        className={selectClass}
                      />
                    </div>
                  </div>
                </div>
  
                <div className="flex items-center justify-end gap-2 border-t border-[#ededed] px-5 py-3.5">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="h-8 rounded-[5px] border border-[#e5e5e5] px-3 text-[10px] font-medium text-[#555] hover:bg-[#f7f7f7] disabled:opacity-50"
                  >
                    Cancel
                  </button>
  
                  <button
                    type="submit"
                    disabled={
                      saving ||
                      !title.trim() ||
                      !projectId ||
                      (!editing &&
                        assignedTo === "client" &&
                        (!projectClientId || availableClients.length === 0)) ||
                      (!editing &&
                        assignedTo === "admin" &&
                        (!currentUserId ||
                          (adminAssignment === "self" && !currentAdmin) ||
                          (adminAssignment === "other" && !otherAdminId)))
                    }
                    className="inline-flex h-8 items-center gap-2 rounded-[5px] bg-[#111] px-3.5 text-[10px] font-medium text-white hover:bg-[#292929] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving && (
                      <LoaderCircle size={12} className="animate-spin" />
                    )}
                    {saving
                      ? "Saving..."
                      : editing
                        ? "Save changes"
                        : "Create task"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
}
const PAGE_SIZE = 10;

const STATUSES: ("All" | TaskStatus)[] = [
  "All",
  "Pending",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
];

const PRIORITIES: ("All" | TaskPriority)[] = [
  "All",
  "Low",
  "Medium",
  "High",
  "Urgent",
];

interface ProjectOption {
  _id: string;
  title: string;
  client:
    | string
    | {
        _id: string;
        fname?: string;
        lname?: string;
        email?: string;
      };
}

interface UserOption {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  role?: "user" | "admin";
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  tasks?: T;
  projects?: ProjectOption[];
  users?: UserOption[];
  currentUserId?: string;
  pagination?: Pagination;
  message?: string;
  error?: string;
}

type Notice = {
  type: "success" | "error";
  message: string;
};

type TaskModalMode = "create" | "edit";

const STATUS_STYLES: Record<TaskStatus, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-100",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-100",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  "On Hold": "bg-orange-50 text-orange-700 border-orange-100",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-100",
};

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  Low: "bg-gray-50 text-gray-600 border-gray-200",
  Medium: "bg-sky-50 text-sky-700 border-sky-100",
  High: "bg-orange-50 text-orange-700 border-orange-100",
  Urgent: "bg-rose-50 text-rose-700 border-rose-100",
};

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  return error instanceof Error ? error.message : fallback;
}

async function readResponse<T>(
  response: Response
): Promise<ApiResponse<T>> {
  const result = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok || result.success === false) {
    throw new Error(
      result.error ||
        result.message ||
        "The request could not be completed."
    );
  }

  return result;
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | TaskStatus>("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | TaskPriority>("All");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<TaskModalMode>("create");
  const [selectedTask, setSelectedTask] = useState<AdminTask | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");

  const fetchTasks = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
        });

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (statusFilter !== "All") {
          params.set("status", statusFilter);
        }

        if (priorityFilter !== "All") {
          params.set("priority", priorityFilter);
        }

        const response = await fetch(
          `/api/tasks?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const result = await readResponse<AdminTask[]>(response);

        const nextTasks = result.data ?? result.tasks ?? [];

        setTasks(nextTasks);

        setPagination(
          result.pagination ?? {
            page,
            limit: PAGE_SIZE,
            total: nextTasks.length,
            totalPages: 1,
          }
        );
      } catch (error) {
        setNotice({
          type: "error",
          message: getErrorMessage(
            error,
            "Unable to load tasks."
          ),
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, statusFilter, priorityFilter]
  );

  const fetchOptions = useCallback(async () => {
    setLoadingOptions(true);
  
    try {
      const [projectsResponse, usersResponse] = await Promise.all([
        fetch("/api/projects", {
          credentials: "include",
          cache: "no-store",
        }),
        fetch("/api/tasks/assignees", {
          credentials: "include",
          cache: "no-store",
        }),
      ]);
  
      const [projectsResult, usersResult] = await Promise.all([
        readResponse<ProjectOption[]>(projectsResponse),
        readResponse<UserOption[]>(usersResponse),
      ]);
  
      const nextProjects =
        projectsResult.projects ?? projectsResult.data ?? [];
  
      const nextUsers =
        usersResult.users ?? usersResult.data ?? [];
  
      setProjects(nextProjects);
      setUsers(nextUsers);
      setCurrentUserId(usersResult.currentUserId ?? "");
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(
          error,
          "Unable to load project and assignee options."
        ),
      });
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchTasks();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [fetchTasks]);

  useEffect(() => {
    void fetchOptions();
  }, [fetchOptions]);

  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 4500);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const stats = useMemo(() => {
    const total = pagination.total;
    const completed = tasks.filter(
      (task) => task.status === "Completed"
    ).length;
    const inProgress = tasks.filter(
      (task) => task.status === "In Progress"
    ).length;
    const pending = tasks.filter(
      (task) => task.status === "Pending"
    ).length;

    return {
      total,
      completed,
      inProgress,
      pending,
    };
  }, [tasks, pagination.total]);

  const openCreateModal = () => {
    setSelectedTask(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEditModal = (task: AdminTask) => {
    setSelectedTask(task);
    setModalMode("edit");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaved = async (message?: string) => {
    closeModal();

    setNotice({
      type: "success",
      message:
        message ??
        (modalMode === "create"
          ? "Task created successfully."
          : "Task updated successfully."),
    });

    await fetchTasks(true);
  };

  const handleDelete = async (task: AdminTask) => {
    const taskId = task._id;

    if (!taskId) {
      setNotice({
        type: "error",
        message: "This task has no valid ID.",
      });
      return;
    }

    const confirmed = window.confirm(
      `Delete "${task.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingTaskId(taskId);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await readResponse<unknown>(response);

      setNotice({
        type: "success",
        message: result.message ?? "Task deleted successfully.",
      });

      // If this was the only task on the page, go back one page.
      if (tasks.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await fetchTasks(true);
      }
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(
          error,
          "Unable to delete this task."
        ),
      });
    } finally {
      setDeletingTaskId(null);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setPage(1);
  };

  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "All" ||
    priorityFilter !== "All";

  const totalPages = Math.max(
    pagination.totalPages || 1,
    1
  );

  const rangeStart =
    pagination.total === 0
      ? 0
      : (page - 1) * PAGE_SIZE + 1;

  const rangeEnd = Math.min(
    page * PAGE_SIZE,
    pagination.total
  );

  return (
    <main className="min-h-screen bg-[#fafafa] px-4 py-6 text-[#222] sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        {/* Header */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#858585]">
              <span>Workspace</span>
              <span>/</span>
              <span className="text-[#333]">Tasks</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
              Task management
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#777]">
              Create tasks, track progress, and manage work
              across your projects.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void fetchTasks(true)}
              disabled={refreshing || loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-3.5 text-sm font-medium text-[#555] transition hover:border-[#ccc] hover:text-[#222] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#222] px-4 text-sm font-medium text-white transition hover:bg-black"
            >
              <Plus size={16} />
              Create task
            </button>
          </div>
        </section>

        {/* Notice */}
        {notice && (
          <div
            role="status"
            className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
              notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {notice.type === "success" ? (
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0"
              />
            ) : (
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0"
              />
            )}

            <p className="flex-1">{notice.message}</p>

            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss notification"
              className="rounded p-0.5 opacity-70 hover:opacity-100"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Summary cards */}
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-semibold">
              Overview
            </h2>
            <p className="mt-1 text-xs text-[#888]">
              A quick snapshot of your task list.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard
              label="Total tasks"
              value={stats.total}
              icon={<CircleDashed size={17} />}
              detail="All matching tasks"
            />

            <StatCard
              label="In progress"
              value={stats.inProgress}
              icon={<Clock3 size={17} />}
              detail="On the current page"
            />

            <StatCard
              label="Pending"
              value={stats.pending}
              icon={<SlidersHorizontal size={17} />}
              detail="On the current page"
            />

            <StatCard
              label="Completed"
              value={stats.completed}
              icon={<CheckCircle2 size={17} />}
              detail="On the current page"
            />
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-xl border border-[#e9e9e9] bg-white p-4 sm:p-5">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-sm font-semibold">
                All tasks
              </h2>
              <p className="mt-1 text-xs text-[#888]">
                Search and filter your tasks.
              </p>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-[#666] transition hover:text-black"
              >
                <X size={13} />
                Clear filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(220px,1fr)_190px_170px]">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search task title or description..."
                aria-label="Search tasks"
                className="h-10 w-full rounded-lg border border-[#e7e7e7] bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-[#aaa] focus:border-[#999]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(
                  event.target.value as "All" | TaskStatus
                );
                setPage(1);
              }}
              aria-label="Filter by status"
              className="h-10 rounded-lg border border-[#e7e7e7] bg-white px-3 text-sm text-[#555] outline-none focus:border-[#999]"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === "All"
                    ? "All statuses"
                    : status}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(event) => {
                setPriorityFilter(
                  event.target.value as "All" | TaskPriority
                );
                setPage(1);
              }}
              aria-label="Filter by priority"
              className="h-10 rounded-lg border border-[#e7e7e7] bg-white px-3 text-sm text-[#555] outline-none focus:border-[#999]"
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority === "All"
                    ? "All priorities"
                    : priority}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Table */}
        <section className="overflow-hidden rounded-xl border border-[#e9e9e9] bg-white">
          <div className="flex flex-col justify-between gap-2 border-b border-[#eee] px-4 py-4 sm:flex-row sm:items-center sm:px-5">
            <div>
              <h2 className="text-sm font-semibold">
                Task list
              </h2>
              <p className="mt-1 text-xs text-[#888]">
                {loading
                  ? "Loading tasks..."
                  : `${pagination.total} task${
                      pagination.total === 1 ? "" : "s"
                    } found`}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#888]">
              {refreshing && (
                <LoaderCircle
                  size={14}
                  className="animate-spin"
                />
              )}
              {hasFilters && "Filters applied"}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4">
              <LoaderCircle
                size={23}
                className="animate-spin text-[#777]"
              />
              <p className="text-sm text-[#888]">
                Loading tasks...
              </p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#eee] bg-[#fafafa] text-[#777]">
                <CircleDashed size={21} />
              </div>

              <h3 className="mt-4 text-sm font-semibold">
                {hasFilters
                  ? "No matching tasks"
                  : "No tasks yet"}
              </h3>

              <p className="mt-1 max-w-sm text-sm leading-6 text-[#888]">
                {hasFilters
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Create a task to start organizing work across your projects."}
              </p>

              {hasFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 rounded-lg border border-[#e5e5e5] px-3 py-2 text-xs font-medium hover:bg-[#fafafa]"
                >
                  Clear filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#222] px-3.5 py-2.5 text-xs font-medium text-white hover:bg-black"
                >
                  <Plus size={14} />
                  Create your first task
                </button>
              )}
            </div>
          ) : (
            <TaskTable
              tasks={tasks}
              onEdit={openEditModal}
              onDelete={handleDelete}
              deletingTaskId={deletingTaskId}
              statusStyles={STATUS_STYLES}
              priorityStyles={PRIORITY_STYLES}
            />
          )}

          {/* Pagination */}
          {!loading && pagination.total > 0 && (
            <div className="flex flex-col justify-between gap-3 border-t border-[#eee] px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
              <p className="text-xs text-[#888]">
                Showing{" "}
                <span className="font-medium text-[#444]">
                  {rangeStart}–{rangeEnd}
                </span>{" "}
                of{" "}
                <span className="font-medium text-[#444]">
                  {pagination.total}
                </span>{" "}
                tasks
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-[#e7e7e7] px-2.5 text-xs font-medium text-[#555] hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowDown
                    size={13}
                    className="rotate-90"
                  />
                  Previous
                </button>

                <span className="min-w-20 text-center text-xs text-[#777]">
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    page >= totalPages ||
                    pagination.hasNextPage === false
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.min(totalPages, current + 1)
                    )
                  }
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-[#e7e7e7] px-2.5 text-xs font-medium text-[#555] hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ArrowUp
                    size={13}
                    className="rotate-45"
                  />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <TaskModal
        open={modalOpen}
        onClose={closeModal}
        onSaved={handleSaved}
        projects={projects}
        clients={users}
        currentUserId={currentUserId}
        initialTask={selectedTask}
      />
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  detail,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-[#e9e9e9] bg-white p-4 transition-shadow hover:shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#777]">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#222]">
            {value.toLocaleString()}
          </p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#eee] bg-[#fafafa] text-[#555]">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-[11px] text-[#999]">
        {detail}
      </p>
    </div>
  );
}