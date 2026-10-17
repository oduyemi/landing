"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  FileText,
  LoaderCircle,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

type AssignmentType = "client" | "admin";
type AdminAssignment = "self" | "other";

type TaskStatus =
  | "Pending"
  | "In Progress"
  | "Completed"
  | "On Hold"
  | "Cancelled";

type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

type TaskPerson = {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  image?: string;
  role: string;
};

type TaskProject = {
  _id: string;
  title?: string;
  name?: string;
  client?: string | TaskPerson | null;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  error?: string;
  projects?: T[];
  users?: T[];
  data?: T[] | T;
  currentUserId?: string;
};

type CreateTaskDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type TaskForm = {
  project: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: AssignmentType;
  adminAssignment: AdminAssignment;
  assignedClient: string;
  assignedAdmin: string;
  dueDate: string;
};

const initialForm: TaskForm = {
  project: "",
  title: "",
  description: "",
  status: "Pending",
  priority: "Medium",
  assignedTo: "client",
  adminAssignment: "self",
  assignedClient: "",
  assignedAdmin: "",
  dueDate: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50";

const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

function getProjects(
  payload: ApiResponse<TaskProject>
): TaskProject[] {
  if (Array.isArray(payload.projects)) return payload.projects;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

function getUsers(
  payload: ApiResponse<TaskPerson>
): TaskPerson[] {
  if (Array.isArray(payload.users)) return payload.users;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

function getClientId(client: TaskProject["client"]): string {
  if (typeof client === "string") return client;
  return client?._id ?? "";
}

function getProjectName(project: TaskProject): string {
  return project.title || project.name || "Untitled project";
}

function getPersonName(person: TaskPerson): string {
  return `${person.fname} ${person.lname}`.trim() || person.email;
}

export default function CreateTaskDialog({
  open,
  onClose,
  onSuccess,
}: CreateTaskDialogProps) {
  const [form, setForm] = useState<TaskForm>(initialForm);
  const [projects, setProjects] = useState<TaskProject[]>([]);
  const [users, setUsers] = useState<TaskPerson[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadOptions = useCallback(async () => {
    setLoadingOptions(true);
    setError("");

    try {
      const [projectsResponse, usersResponse] = await Promise.all([
        fetch("/api/projects", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),
        fetch("/api/tasks/assignees", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      const [projectsPayload, usersPayload]: [
        ApiResponse<TaskProject>,
        ApiResponse<TaskPerson>,
      ] = await Promise.all([
        projectsResponse.json(),
        usersResponse.json(),
      ]);

      if (!projectsResponse.ok || projectsPayload.success === false) {
        throw new Error(
          projectsPayload.error ||
            projectsPayload.message ||
            "Unable to load projects."
        );
      }

      if (!usersResponse.ok || usersPayload.success === false) {
        throw new Error(
          usersPayload.error ||
            usersPayload.message ||
            "Unable to load task assignees."
        );
      }

      const availableProjects = getProjects(projectsPayload);
      const availableUsers = getUsers(usersPayload);

      setProjects(availableProjects);
      setUsers(availableUsers);

      // The API must return currentUserId for self-assignment.
      setCurrentUserId(usersPayload.currentUserId ?? "");

      setForm((previous) => {
        const projectStillExists = availableProjects.some(
          (project) => project._id === previous.project
        );

        const projectId = projectStillExists
          ? previous.project
          : availableProjects[0]?._id ?? "";

        const selectedProject = availableProjects.find(
          (project) => project._id === projectId
        );

        return {
          ...previous,
          project: projectId,
          assignedClient: getClientId(selectedProject?.client),
        };
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the task form."
      );
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      void loadOptions();
    }
  }, [open, loadOptions]);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === form.project),
    [projects, form.project]
  );

  const projectClientId = useMemo(
    () => getClientId(selectedProject?.client),
    [selectedProject]
  );

  // Only the project client depends on the selected project.
  const projectClients = useMemo(
    () =>
      users.filter(
        (user) =>
          user.role === "user" && user._id === projectClientId
      ),
    [users, projectClientId]
  );

  // Admins are global assignees, independent of projects.
  const admins = useMemo(
    () => users.filter((user) => user.role === "admin"),
    [users]
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
    if (form.assignedTo === "client") {
      return form.assignedClient;
    }

    if (form.adminAssignment === "self") {
      return currentUserId;
    }

    return form.assignedAdmin;
  }, [
    form.assignedTo,
    form.assignedClient,
    form.adminAssignment,
    form.assignedAdmin,
    currentUserId,
  ]);

  const updateForm = <K extends keyof TaskForm>(
    key: K,
    value: TaskForm[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleProjectChange = (projectId: string) => {
    const project = projects.find((item) => item._id === projectId);

    setForm((previous) => ({
      ...previous,
      project: projectId,
      assignedClient: getClientId(project?.client),
    }));
  };

  const handleAssignmentChange = (assignedTo: AssignmentType) => {
    setError("");

    setForm((previous) => ({
      ...previous,
      assignedTo,
      assignedClient:
        assignedTo === "client" ? projectClientId : "",
      adminAssignment: "self",
      assignedAdmin: "",
    }));
  };

  const resetForm = () => {
    setForm({
      ...initialForm,
      project: projects[0]?._id ?? "",
      assignedClient: getClientId(projects[0]?.client),
    });

    setError("");
    setSuccessMessage("");
  };

  const handleClose = () => {
    if (submitting) return;

    resetForm();
    onClose();
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!form.project) {
      setError("Please select a project.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    if (form.assignedTo === "client") {
      if (!form.assignedClient) {
        setError(
          "The selected project does not have an available client to assign this task to."
        );
        return;
      }

      if (
        !projectClients.some(
          (client) => client._id === form.assignedClient
        )
      ) {
        setError(
          "The selected client does not belong to this project."
        );
        return;
      }
    }

    if (form.assignedTo === "admin") {
      if (!assignedUser) {
        setError(
          form.adminAssignment === "self"
            ? "Unable to identify your admin account. Please refresh the dialog and try again."
            : "Please select an admin to assign this task to."
        );
        return;
      }

      if (!admins.some((admin) => admin._id === assignedUser)) {
        setError(
          "The selected assignee is not in the list of available admins. Please reload the dialog."
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project: form.project,
          title: form.title.trim(),
          description: form.description.trim(),
          status: form.status,
          priority: form.priority,
          assignedTo: form.assignedTo,
          assignedUser,
          dueDate: form.dueDate || undefined,
        }),
      });

      const payload: ApiResponse<unknown> = await response.json();

      if (!response.ok || payload.success === false) {
        throw new Error(
          payload.error ||
            payload.message ||
            "Unable to create the task."
        );
      }

      setSuccessMessage(
        payload.message || "Task created successfully."
      );

      onSuccess?.();

      window.setTimeout(() => {
        resetForm();
        onClose();
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the task."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-title"
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-5 sm:px-8">
          <div>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <BriefcaseBusiness size={20} />
            </div>

            <h2
              id="create-task-title"
              className="text-xl font-bold tracking-tight text-slate-900"
            >
              Create a task
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create a task and assign responsibility.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            aria-label="Close dialog"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-6 sm:px-8">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <p>{error}</p>
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
              >
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <p>{successMessage}</p>
              </div>
            )}

            {loadingOptions ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-slate-500">
                <LoaderCircle
                  size={28}
                  className="animate-spin text-indigo-600"
                />
                <p className="text-sm">
                  Loading projects and assignees...
                </p>
              </div>
            ) : (
              <>
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <FileText size={17} className="text-indigo-600" />
                    Task details
                  </div>

                  <div>
                    <label htmlFor="task-project" className={labelClass}>
                      Project <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <select
                        id="task-project"
                        value={form.project}
                        onChange={(event) =>
                          handleProjectChange(event.target.value)
                        }
                        className={`${inputClass} appearance-none pr-10`}
                        required
                        disabled={projects.length === 0}
                      >
                        <option value="">Select a project</option>

                        {projects.map((project) => (
                          <option
                            key={project._id}
                            value={project._id}
                          >
                            {getProjectName(project)}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={17}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>

                    {projects.length === 0 && (
                      <p className="mt-2 text-xs text-amber-700">
                        No projects are available. Create a project before
                        creating a task.
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="task-title" className={labelClass}>
                      Task title <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="task-title"
                      type="text"
                      value={form.title}
                      onChange={(event) =>
                        updateForm("title", event.target.value)
                      }
                      placeholder="e.g. Prepare project documentation"
                      className={inputClass}
                      maxLength={200}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="task-description"
                      className={labelClass}
                    >
                      Description
                    </label>

                    <textarea
                      id="task-description"
                      value={form.description}
                      onChange={(event) =>
                        updateForm("description", event.target.value)
                      }
                      placeholder="Describe the task, expected outcome, and any useful context..."
                      className={`${inputClass} min-h-28 resize-y`}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="task-status" className={labelClass}>
                        Status
                      </label>

                      <div className="relative">
                        <select
                          id="task-status"
                          value={form.status}
                          onChange={(event) =>
                            updateForm(
                              "status",
                              event.target.value as TaskStatus
                            )
                          }
                          className={`${inputClass} appearance-none pr-10`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="task-priority"
                        className={labelClass}
                      >
                        Priority
                      </label>

                      <div className="relative">
                        <select
                          id="task-priority"
                          value={form.priority}
                          onChange={(event) =>
                            updateForm(
                              "priority",
                              event.target.value as TaskPriority
                            )
                          }
                          className={`${inputClass} appearance-none pr-10`}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>

                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="task-due-date" className={labelClass}>
                      Due date
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="task-due-date"
                        type="date"
                        value={form.dueDate}
                        onChange={(event) =>
                          updateForm("dueDate", event.target.value)
                        }
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                </section>

                <div className="border-t border-slate-100" />

                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Users size={17} className="text-indigo-600" />
                    Assign responsibility
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleAssignmentChange("client")}
                      className={`rounded-xl border p-4 text-left transition ${
                        form.assignedTo === "client"
                          ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/10"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <UserRound
                          size={19}
                          className={
                            form.assignedTo === "client"
                              ? "text-indigo-600"
                              : "text-slate-500"
                          }
                        />

                        <span
                          className={`h-4 w-4 rounded-full border-2 ${
                            form.assignedTo === "client"
                              ? "border-indigo-600 bg-indigo-600 ring-2 ring-indigo-200 ring-offset-1"
                              : "border-slate-300"
                          }`}
                        />
                      </div>

                      <p className="text-sm font-bold text-slate-900">
                        Assign to client
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Assign the task to the client associated with this
                        project.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAssignmentChange("admin")}
                      className={`rounded-xl border p-4 text-left transition ${
                        form.assignedTo === "admin"
                          ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/10"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <ShieldCheck
                          size={19}
                          className={
                            form.assignedTo === "admin"
                              ? "text-indigo-600"
                              : "text-slate-500"
                          }
                        />

                        <span
                          className={`h-4 w-4 rounded-full border-2 ${
                            form.assignedTo === "admin"
                              ? "border-indigo-600 bg-indigo-600 ring-2 ring-indigo-200 ring-offset-1"
                              : "border-slate-300"
                          }`}
                        />
                      </div>

                      <p className="text-sm font-bold text-slate-900">
                        Assign to admin
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Assign the task to yourself or another administrator.
                      </p>
                    </button>
                  </div>

                  {form.assignedTo === "client" ? (
                    <div>
                      <label htmlFor="task-client" className={labelClass}>
                        Project client{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <CircleUserRound
                          size={17}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <select
                          id="task-client"
                          value={form.assignedClient}
                          onChange={(event) =>
                            updateForm(
                              "assignedClient",
                              event.target.value
                            )
                          }
                          className={`${inputClass} appearance-none pl-11 pr-10`}
                          required
                          disabled={projectClients.length === 0}
                        >
                          <option value="">
                            {selectedProject
                              ? "Select project client"
                              : "Select a project first"}
                          </option>

                          {projectClients.map((client) => (
                            <option
                              key={client._id}
                              value={client._id}
                            >
                              {getPersonName(client)} ({client.email})
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                      </div>

                      {selectedProject && projectClients.length === 0 && (
                        <p className="mt-2 text-xs text-amber-700">
                          No client is associated with this project. Choose
                          admin assignment or update the project client.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>
                          Admin assignment
                        </label>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => {
                              setError("");
                              setForm((previous) => ({
                                ...previous,
                                adminAssignment: "self",
                                assignedAdmin: "",
                              }));
                            }}
                            className={`rounded-xl border px-4 py-3 text-left transition ${
                              form.adminAssignment === "self"
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <p className="text-sm font-semibold text-slate-800">
                              Assign to myself
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              You will be responsible for this task.
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setError("");
                              setForm((previous) => ({
                                ...previous,
                                adminAssignment: "other",
                                assignedAdmin: "",
                              }));
                            }}
                            className={`rounded-xl border px-4 py-3 text-left transition ${
                              form.adminAssignment === "other"
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <p className="text-sm font-semibold text-slate-800">
                              Another admin
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Choose any other administrator.
                            </p>
                          </button>
                        </div>
                      </div>

                      {form.adminAssignment === "self" ? (
                        <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                              <ShieldCheck size={19} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900">
                                {currentAdmin
                                  ? getPersonName(currentAdmin)
                                  : "Current administrator"}
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                {currentAdmin?.email ??
                                  "The task will be assigned to your account."}
                              </p>
                            </div>

                            <CheckCircle2
                              size={18}
                              className="ml-auto shrink-0 text-indigo-600"
                            />
                          </div>

                          {!currentUserId && (
                            <p className="mt-3 text-xs text-amber-700">
                              Your admin ID was not returned by the
                              assignees API. The form can still be submitted,
                              but self-assignment needs a valid ID.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <label htmlFor="task-admin" className={labelClass}>
                            Select admin{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <div className="relative">
                            <ShieldCheck
                              size={17}
                              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <select
                              id="task-admin"
                              value={form.assignedAdmin}
                              onChange={(event) =>
                                updateForm(
                                  "assignedAdmin",
                                  event.target.value
                                )
                              }
                              className={`${inputClass} appearance-none pl-11 pr-10`}
                              required
                              disabled={otherAdmins.length === 0}
                            >
                              <option value="">Select an admin</option>

                              {otherAdmins.map((admin) => (
                                <option
                                  key={admin._id}
                                  value={admin._id}
                                >
                                  {getPersonName(admin)} ({admin.email})
                                </option>
                              ))}
                            </select>

                            <ChevronDown
                              size={17}
                              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                          </div>

                          {otherAdmins.length === 0 && (
                            <p className="mt-2 text-xs text-slate-500">
                              No other administrators are available. You can
                              assign the task to yourself instead.
                            </p>
                          )}

                          <p className="mt-2 text-xs text-slate-500">
                            This list includes all administrators, regardless
                            of their project assignments.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loadingOptions ||
                submitting ||
                projects.length === 0 ||
                !form.project
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Creating task...
                </>
              ) : (
                <>
                  <BriefcaseBusiness size={17} />
                  Create task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}