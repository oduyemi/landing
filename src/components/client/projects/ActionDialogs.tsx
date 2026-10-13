
"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Plus,
  X,
} from "lucide-react";

type UserRole = "user" | "admin";
type DialogMode = "request" | "create" | null;

type Account = {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  role?: UserRole;
};

type ProjectActionDialogsProps = {
  role: UserRole | null;
  onProjectCreated?: () => void | Promise<void>;
};

type FormFeedback = {
  type: "success" | "error";
  message: string;
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100";

const labelClass = "block text-sm font-medium text-gray-700";

const initialRequestForm = {
  title: "",
  type: "",
  description: "",
  assignedAdmin: "",
  preferredStartDate: "",
  preferredDeadline: "",
};

const initialProjectForm = {
  title: "",
  type: "",
  description: "",
  client: "",
  startDate: "",
  deadline: "",
  status: "Planning",
  progress: "0",
};

export default function ProjectActionDialogs({
  role,
  onProjectCreated,
}: ProjectActionDialogsProps) {
  const [mode, setMode] = useState<DialogMode>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);

  const [requestForm, setRequestForm] = useState(initialRequestForm);
  const [projectForm, setProjectForm] = useState(initialProjectForm);

  const closeDialog = useCallback(() => {
    if (submitting) return;

    setMode(null);
    setFeedback(null);
    setRequestForm(initialRequestForm);
    setProjectForm(initialProjectForm);
  }, [submitting]);

  useEffect(() => {
    if (!mode) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDialog();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, closeDialog]);

  useEffect(() => {
    if (!mode) return;

    const controller = new AbortController();

    async function loadAccounts() {
      setAccountsLoading(true);
      setAccounts([]);
      setFeedback(null);

      const endpoint =
        mode === "create"
          ? "/api/projects/assignees"
          : "/api/project-requests/admin";

      try {
        const response = await fetch(endpoint, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load accounts."
          );
        }

        const list: Account[] =
          mode === "create"
            ? data.users ?? []
            : data.admins ?? [];

        setAccounts(list);
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        setFeedback({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load accounts.",
        });
      } finally {
        if (!controller.signal.aborted) {
          setAccountsLoading(false);
        }
      }
    }

    void loadAccounts();

    return () => controller.abort();
  }, [mode]);

  if (!role) return null;

  const isAdmin = role === "admin";
  const isRequest = mode === "request";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mode || submitting) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const payload = isRequest
        ? {
            title: requestForm.title.trim(),
            type: requestForm.type.trim(),
            description: requestForm.description.trim(),
            assignedAdmin: requestForm.assignedAdmin,
            preferredStartDate:
              requestForm.preferredStartDate || undefined,
            preferredDeadline:
              requestForm.preferredDeadline || undefined,
          }
        : {
            title: projectForm.title.trim(),
            type: projectForm.type.trim(),
            description: projectForm.description.trim(),
            client: projectForm.client,
            startDate: projectForm.startDate,
            deadline: projectForm.deadline,
            status: projectForm.status,
            progress: Number(projectForm.progress),
          };

      const response = await fetch(
        isRequest ? "/api/project-requests" : "/api/projects",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (isRequest
              ? "Unable to submit the request."
              : "Unable to create the project.")
        );
      }

      setFeedback({
        type: "success",
        message: isRequest
          ? "Your project request has been submitted for review."
          : "The project has been created successfully.",
      });

      if (!isRequest) {
        await onProjectCreated?.();
      }
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const succeeded = feedback?.type === "success";

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 sm:bottom-7 sm:right-7">
        <button
          type="button"
          onClick={() => {
            setFeedback(null);
            setMode(isAdmin ? "create" : "request");
          }}
          className="group inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-[#191919] px-4 py-3 text-xs font-semibold text-white shadow-[0_6px_24px_rgba(0,0,0,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#303030] hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 active:scale-[0.98] sm:px-5"
        >
          <Plus
            size={17}
            strokeWidth={2}
            className="transition-transform duration-200 group-hover:rotate-90"
          />
          <span>
            {isAdmin
              ? "Create a new project"
              : "Request a new project"}
          </span>
        </button>
      </div>

      {mode && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-[3px] sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-dialog-title"
            className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-5 py-5 sm:px-7">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                  {isAdmin ? "Project workspace" : "Project enquiry"}
                </p>
                <h2
                  id="project-dialog-title"
                  className="mt-1 text-xl font-semibold tracking-tight text-gray-900"
                >
                  {isAdmin
                    ? "Create a new project"
                    : "Request a new project"}
                </h2>
                <p className="mt-1.5 max-w-lg text-sm leading-5 text-gray-500">
                  {isAdmin
                    ? "Set up the project, choose its owner, and define its timeline."
                    : "Tell us what you need. An administrator will review your request."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDialog}
                disabled={submitting}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40"
              >
                <X size={19} />
              </button>
            </div>

            {succeeded ? (
              <div className="px-5 py-10 text-center sm:px-7">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={25} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {isAdmin ? "Project created" : "Request received"}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  {feedback?.message}
                </p>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#191919] px-5 text-sm font-semibold text-white transition hover:bg-[#303030]"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-5 px-5 py-6 sm:px-7">
                  {feedback?.type === "error" && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700"
                    >
                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                      />
                      <span>{feedback.message}</span>
                    </div>
                  )}

                  <div>
                    <label className={labelClass} htmlFor="project-title">
                      Project title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="project-title"
                      className={inputClass}
                      placeholder="e.g. Website redesign"
                      value={
                        isRequest
                          ? requestForm.title
                          : projectForm.title
                      }
                      onChange={(event) =>
                        isRequest
                          ? setRequestForm({
                              ...requestForm,
                              title: event.target.value,
                            })
                          : setProjectForm({
                              ...projectForm,
                              title: event.target.value,
                            })
                      }
                      maxLength={150}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="project-type">
                      Project type <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="project-type"
                      className={inputClass}
                      placeholder="e.g. Web development, SEO, design"
                      value={
                        isRequest
                          ? requestForm.type
                          : projectForm.type
                      }
                      onChange={(event) =>
                        isRequest
                          ? setRequestForm({
                              ...requestForm,
                              type: event.target.value,
                            })
                          : setProjectForm({
                              ...projectForm,
                              type: event.target.value,
                            })
                      }
                      maxLength={100}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className={labelClass}
                      htmlFor="project-description"
                    >
                      {isAdmin
                        ? "Project description"
                        : "What do you need?"}
                      <span className="text-red-500"> *</span>
                    </label>
                    <textarea
                      id="project-description"
                      className={`${inputClass} min-h-28 resize-y`}
                      placeholder={
                        isAdmin
                          ? "Outline the scope, deliverables, and important details..."
                          : "Describe your goals, requirements, and expected outcome..."
                      }
                      value={
                        isRequest
                          ? requestForm.description
                          : projectForm.description
                      }
                      onChange={(event) =>
                        isRequest
                          ? setRequestForm({
                              ...requestForm,
                              description: event.target.value,
                            })
                          : setProjectForm({
                              ...projectForm,
                              description: event.target.value,
                            })
                      }
                      maxLength={5000}
                      required
                    />
                    <p className="mt-1.5 text-right text-xs text-gray-400">
                      {(isRequest
                        ? requestForm.description
                        : projectForm.description
                      ).length}
                      /5000
                    </p>
                  </div>

                  <div>
                    <label
                      className={labelClass}
                      htmlFor="project-assignee"
                    >
                      {isAdmin ? "Assign project to" : "Send request to"}
                      <span className="text-red-500"> *</span>
                    </label>
                    <select
                      id="project-assignee"
                      className={inputClass}
                      value={
                        isRequest
                          ? requestForm.assignedAdmin
                          : projectForm.client
                      }
                      onChange={(event) =>
                        isRequest
                          ? setRequestForm({
                              ...requestForm,
                              assignedAdmin: event.target.value,
                            })
                          : setProjectForm({
                              ...projectForm,
                              client: event.target.value,
                            })
                      }
                      required
                      disabled={accountsLoading}
                    >
                      <option value="">
                        {accountsLoading
                          ? "Loading accounts..."
                          : isAdmin
                            ? "Choose a client or administrator"
                            : "Choose an administrator"}
                      </option>
                      {accounts.map((account) => (
                        <option key={account._id} value={account._id}>
                          {account.fname} {account.lname} — {account.email}
                          {isAdmin
                            ? ` (${account.role === "admin" ? "Admin" : "Client"})`
                            : ""}
                        </option>
                      ))}
                    </select>
                    {!accountsLoading && accounts.length === 0 && (
                      <p className="mt-1.5 text-xs text-amber-700">
                        No assignable accounts were found. Please try again later.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        className={labelClass}
                        htmlFor="project-start-date"
                      >
                        {isAdmin ? "Start date" : "Preferred start date"}
                        {!isAdmin && (
                          <span className="ml-1 font-normal text-gray-400">
                            (optional)
                          </span>
                        )}
                        {isAdmin && (
                          <span className="text-red-500"> *</span>
                        )}
                      </label>
                      <input
                        id="project-start-date"
                        type="date"
                        className={inputClass}
                        value={
                          isRequest
                            ? requestForm.preferredStartDate
                            : projectForm.startDate
                        }
                        onChange={(event) =>
                          isRequest
                            ? setRequestForm({
                                ...requestForm,
                                preferredStartDate: event.target.value,
                              })
                            : setProjectForm({
                                ...projectForm,
                                startDate: event.target.value,
                              })
                        }
                        required={!isRequest}
                      />
                    </div>

                    <div>
                      <label
                        className={labelClass}
                        htmlFor="project-deadline"
                      >
                        {isAdmin ? "Deadline" : "Preferred deadline"}
                        {!isAdmin && (
                          <span className="ml-1 font-normal text-gray-400">
                            (optional)
                          </span>
                        )}
                        {isAdmin && (
                          <span className="text-red-500"> *</span>
                        )}
                      </label>
                      <input
                        id="project-deadline"
                        type="date"
                        className={inputClass}
                        value={
                          isRequest
                            ? requestForm.preferredDeadline
                            : projectForm.deadline
                        }
                        min={
                          isRequest
                            ? requestForm.preferredStartDate || undefined
                            : projectForm.startDate || undefined
                        }
                        onChange={(event) =>
                          isRequest
                            ? setRequestForm({
                                ...requestForm,
                                preferredDeadline: event.target.value,
                              })
                            : setProjectForm({
                                ...projectForm,
                                deadline: event.target.value,
                              })
                        }
                        required={!isRequest}
                      />
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          className={labelClass}
                          htmlFor="project-status"
                        >
                          Initial status
                        </label>
                        <select
                          id="project-status"
                          className={inputClass}
                          value={projectForm.status}
                          onChange={(event) =>
                            setProjectForm({
                              ...projectForm,
                              status: event.target.value,
                            })
                          }
                        >
                          {[
                            "Planning",
                            "In Progress",
                            "Completed",
                            "On Hold",
                            "Cancelled",
                          ].map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          className={labelClass}
                          htmlFor="project-progress"
                        >
                          Initial progress (%)
                        </label>
                        <input
                          id="project-progress"
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          className={inputClass}
                          value={projectForm.progress}
                          onChange={(event) =>
                            setProjectForm({
                              ...projectForm,
                              progress: event.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                  <button
                    type="button"
                    onClick={closeDialog}
                    disabled={submitting}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      accountsLoading ||
                      accounts.length === 0
                    }
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#191919] px-5 text-sm font-semibold text-white transition hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting && (
                      <LoaderCircle size={16} className="animate-spin" />
                    )}
                    {submitting
                      ? isAdmin
                        ? "Creating project..."
                        : "Submitting request..."
                      : isAdmin
                        ? "Create project"
                        : "Submit request"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
