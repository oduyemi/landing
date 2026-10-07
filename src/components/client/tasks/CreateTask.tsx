"use client";
import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Project {
  _id: string;
  title: string;
  type?: string;
}

interface Assignee {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  image?: string | null;
  role: "user" | "admin";
}

interface CreateTaskProps {
  onCreated?: () => void;
}

interface FormState {
  project: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  assignedUser: string;
  dueDate: string;
}

const initialForm: FormState = {
  project: "",
  title: "",
  description: "",
  priority: "Medium",
  assignedUser: "",
  dueDate: "",
};

export const CreateTask = ({
  onCreated,
}: CreateTaskProps) => {
  const [open, setOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>(
    []
  );

  const [assignees, setAssignees] = useState<
    Assignee[]
  >([]);

  const [form, setForm] =
    useState<FormState>(initialForm);

  const [loadingOptions, setLoadingOptions] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) return;

    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        setError("");

        const [projectsResponse, assigneesResponse] =
          await Promise.all([
            fetch("/api/projects", {
              credentials: "include",
              cache: "no-store",
            }),

            fetch("/api/tasks/assignees", {
              credentials: "include",
              cache: "no-store",
            }),
          ]);

        const projectsData =
          await projectsResponse.json();

        const assigneesData =
          await assigneesResponse.json();

        if (!projectsResponse.ok) {
          throw new Error(
            projectsData?.error ||
              "Unable to load projects."
          );
        }

        if (!assigneesResponse.ok) {
          throw new Error(
            assigneesData?.error ||
              "Unable to load assignees."
          );
        }

        const loadedProjects =
          projectsData?.projects ??
          projectsData?.data ??
          [];

        const loadedAssignees =
          assigneesData?.users ??
          assigneesData?.data ??
          [];

        setProjects(loadedProjects);
        setAssignees(loadedAssignees);

        /**
         * Conveniently select the first available
         * project and assignee.
         */
        setForm((current) => ({
          ...current,
          project:
            current.project ||
            loadedProjects[0]?._id ||
            "",
          assignedUser:
            current.assignedUser ||
            loadedAssignees[0]?._id ||
            "",
        }));
      } catch (error) {
        console.error(
          "LOAD CREATE TASK OPTIONS ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load task options."
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, [open]);

  const close = () => {
    if (submitting) return;

    setOpen(false);
    setError("");
    setSuccess("");
    setForm(initialForm);
  };

  const updateField = <
    K extends keyof FormState
  >(
    field: K,
    value: FormState[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.project) {
      setError("Please select a project.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    if (!form.assignedUser) {
      setError(
        "Please select who this task should be assigned to."
      );
      return;
    }

    try {
      setSubmitting(true);

      /**
       * The API determines whether the current user
       * should create an admin or client task.
       *
       * We still send assignedTo based on the selected
       * assignee's role.
       */
      const selectedAssignee =
        assignees.find(
          (person) =>
            person._id === form.assignedUser
        );

      if (!selectedAssignee) {
        throw new Error(
          "The selected assignee could not be found."
        );
      }

      const assignedTo =
        selectedAssignee.role === "admin"
          ? "admin"
          : "client";

      const response = await fetch(
        "/api/tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            project: form.project,
            title: form.title.trim(),
            description:
              form.description.trim(),
            priority: form.priority,
            assignedTo,
            assignedUser:
              form.assignedUser,
            dueDate:
              form.dueDate || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to create task."
        );
      }

      setSuccess(
        "Task created successfully."
      );

      onCreated?.();

      setTimeout(() => {
        setOpen(false);
        setForm(initialForm);
        setSuccess("");
      }, 700);
    } catch (error) {
      console.error(
        "CREATE TASK ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create task."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-1.5 rounded-[5px] bg-black px-3 text-[9px] font-medium text-white transition hover:bg-neutral-800"
      >
        <Plus
          className="h-3 w-3"
          strokeWidth={1.8}
        />

        Create Task
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{
                opacity: 0,
                y: 12,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 12,
                scale: 0.98,
              }}
              transition={{
                duration: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="fixed inset-x-3 top-1/2 z-50 max-h-[90vh] -translate-y-1/2 overflow-y-auto rounded-[8px] border border-neutral-200 bg-white shadow-2xl sm:left-1/2 sm:right-auto sm:w-[460px] sm:-translate-x-1/2"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
                <div>
                  <h2 className="text-[12px] font-semibold text-black">
                    Create Task
                  </h2>

                  <p className="mt-1 text-[8px] text-neutral-400">
                    Create an action item and assign it
                    to the appropriate person.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={close}
                  disabled={submitting}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-black disabled:opacity-40"
                  aria-label="Close"
                >
                  <X
                    className="h-3.5 w-3.5"
                    strokeWidth={1.7}
                  />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4 p-5"
              >
                {error && (
                  <div className="flex items-start gap-2 rounded-[5px] border border-red-100 bg-red-50 px-3 py-2.5">
                    <AlertCircle
                      className="mt-0.5 h-3 w-3 shrink-0 text-red-500"
                      strokeWidth={1.8}
                    />

                    <p className="text-[8px] leading-relaxed text-red-600">
                      {error}
                    </p>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 rounded-[5px] border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                    <Check
                      className="h-3 w-3 text-emerald-600"
                      strokeWidth={1.8}
                    />

                    <p className="text-[8px] text-emerald-700">
                      {success}
                    </p>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-[8px] font-medium text-neutral-600">
                    Project
                  </label>

                  <div className="relative">
                    <select
                      value={form.project}
                      onChange={(event) =>
                        updateField(
                          "project",
                          event.target.value
                        )
                      }
                      disabled={loadingOptions}
                      className="h-9 w-full appearance-none rounded-[5px] border border-neutral-200 bg-white px-3 pr-8 text-[9px] text-black outline-none transition focus:border-black disabled:bg-neutral-50"
                    >
                      <option value="">
                        Select project
                      </option>

                      {projects.map((project) => (
                        <option
                          key={project._id}
                          value={project._id}
                        >
                          {project.title}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[8px] font-medium text-neutral-600">
                    Task title
                  </label>

                  <input
                    type="text"
                    value={form.title}
                    onChange={(event) =>
                      updateField(
                        "title",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Rework About page content"
                    className="h-9 w-full rounded-[5px] border border-neutral-200 bg-white px-3 text-[9px] text-black outline-none placeholder:text-neutral-300 focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[8px] font-medium text-neutral-600">
                    Details
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Add any details, requirements or context..."
                    rows={4}
                    className="w-full resize-none rounded-[5px] border border-neutral-200 bg-white px-3 py-2.5 text-[9px] leading-relaxed text-black outline-none placeholder:text-neutral-300 focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[8px] font-medium text-neutral-600">
                      Assign to
                    </label>

                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400" />

                      <select
                        value={
                          form.assignedUser
                        }
                        onChange={(event) =>
                          updateField(
                            "assignedUser",
                            event.target.value
                          )
                        }
                        disabled={loadingOptions}
                        className="h-9 w-full appearance-none rounded-[5px] border border-neutral-200 bg-white pl-8 pr-8 text-[9px] text-black outline-none focus:border-black disabled:bg-neutral-50"
                      >
                        <option value="">
                          Select person
                        </option>

                        {assignees.map(
                          (person) => (
                            <option
                              key={person._id}
                              value={person._id}
                            >
                              {person.fname}{" "}
                              {person.lname}
                              {" · "}
                              {person.role ===
                              "admin"
                                ? "Admin"
                                : "Client"}
                            </option>
                          )
                        )}
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[8px] font-medium text-neutral-600">
                      Priority
                    </label>

                    <div className="relative">
                      <select
                        value={form.priority}
                        onChange={(event) =>
                          updateField(
                            "priority",
                            event.target
                              .value as FormState["priority"]
                          )
                        }
                        className="h-9 w-full appearance-none rounded-[5px] border border-neutral-200 bg-white px-3 pr-8 text-[9px] text-black outline-none focus:border-black"
                      >
                        <option value="Low">
                          Low
                        </option>

                        <option value="Medium">
                          Medium
                        </option>

                        <option value="High">
                          High
                        </option>

                        <option value="Urgent">
                          Urgent
                        </option>
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[8px] font-medium text-neutral-600">
                    Due date
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400" />

                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(event) =>
                        updateField(
                          "dueDate",
                          event.target.value
                        )
                      }
                      className="h-9 w-full rounded-[5px] border border-neutral-200 bg-white pl-8 pr-3 text-[9px] text-black outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-4">
                  <button
                    type="button"
                    onClick={close}
                    disabled={submitting}
                    className="h-8 rounded-[5px] px-3 text-[9px] font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-black disabled:opacity-40"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      loadingOptions
                    }
                    className="inline-flex h-8 min-w-[92px] items-center justify-center gap-1.5 rounded-[5px] bg-black px-3 text-[9px] font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus
                          className="h-3 w-3"
                          strokeWidth={1.8}
                        />
                        Create Task
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};