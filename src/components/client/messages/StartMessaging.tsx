"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Loader2, MessageSquarePlus, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";


interface Project {
  _id: string;
  title: string;
  type?: string;
}


interface Recipient {
  _id: string;
  fname?: string;
  lname?: string;
  email?: string;
  role?: "user" | "admin";
}

interface Task {
  _id: string;
  title: string;
  status?: string;
  priority?: string;
}

interface StartMessagingProps {
  onStarted?: (message: any) => void;
  compact?: boolean;
}

export const StartMessaging = ({
  onStarted,
  compact = false,
}: StartMessagingProps) => {
  const [open, setOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [projectId, setProjectId] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [content, setContent] = useState("");

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === projectId),
    [projects, projectId],
  );

  const selectedRecipient = useMemo(
    () =>
      recipients.find(
        (recipient) => recipient._id === recipientId,
      ),
    [recipients, recipientId],
  );

  useEffect(() => {
    if (!open) return;

    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        setError("");

        const response = await fetch(
          "/api/projects?limit=100",
          {
            credentials: "include",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Unable to load projects.",
          );
        }

        const items = Array.isArray(data)
          ? data
          : data.projects ?? [];

        setProjects(items);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load projects.",
        );
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, [open]);

  useEffect(() => {
    if (!projectId) {
      setRecipients([]);
      setTasks([]);
      setRecipientId("");
      setTaskId("");
      return;
    }

    const loadProjectData = async () => {
      try {
        setLoadingRecipients(true);
        setLoadingTasks(true);
        setError("");

        const [recipientResponse, taskResponse] =
          await Promise.all([
            fetch(
              `/api/tasks/assignees?projectId=${encodeURIComponent(
                projectId,
              )}`,
              {
                credentials: "include",
              },
            ),
            fetch(
              `/api/tasks?project=${encodeURIComponent(
                projectId,
              )}&limit=100`,
              {
                credentials: "include",
              },
            ),
          ]);

        const recipientData =
          await recipientResponse.json();

        const taskData = await taskResponse.json();

        if (!recipientResponse.ok) {
          throw new Error(
            recipientData?.error ||
              "Unable to load recipients.",
          );
        }

        if (!taskResponse.ok) {
          throw new Error(
            taskData?.error ||
              "Unable to load project tasks.",
          );
        }

        const recipientItems = Array.isArray(
          recipientData,
        )
          ? recipientData
          : recipientData.assignees ??
            recipientData.users ??
            [];

        const taskItems = Array.isArray(taskData)
          ? taskData
          : taskData.tasks ?? [];

        setRecipients(recipientItems);
        setTasks(taskItems);

        setRecipientId("");
        setTaskId("");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load project information.",
        );
      } finally {
        setLoadingRecipients(false);
        setLoadingTasks(false);
      }
    };

    loadProjectData();
  }, [projectId]);

  const close = () => {
    if (sending) return;

    setOpen(false);
    setError("");
    setProjectId("");
    setRecipientId("");
    setTaskId("");
    setContent("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!projectId || !recipientId || !content.trim()) {
      setError(
        "Select a project, recipient, and enter a message.",
      );
      return;
    }

    try {
      setSending(true);
      setError("");

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          projectId,
          recipientId,
          content: content.trim(),
          ...(taskId ? { taskId } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to start conversation.",
        );
      }

      const createdMessage = data.message;

      setOpen(false);
      setProjectId("");
      setRecipientId("");
      setTaskId("");
      setContent("");

      onStarted?.(createdMessage);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start conversation.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          "flex items-center justify-center gap-1.5 rounded-[6px]",
          "bg-[#111] text-white transition-colors",
          "hover:bg-[#272727]",
          compact
            ? "h-7 px-2.5 text-[9px]"
            : "h-9 px-3.5 text-[10px] font-medium",
        ].join(" ")}
      >
        <MessageSquarePlus
          className={compact ? "h-3 w-3" : "h-3.5 w-3.5"}
          strokeWidth={1.7}
        />

        <span>Start Messaging</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4 backdrop-blur-[2px]"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                close();
              }
            }}
          >
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
                y: 8,
                scale: 0.98,
              }}
              transition={{
                duration: 0.18,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full max-w-[440px] overflow-hidden rounded-[10px] border border-neutral-200 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.14)]"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
                <div>
                  <h2 className="text-[12px] font-semibold text-black">
                    Start a conversation
                  </h2>

                  <p className="mt-1 text-[8px] text-neutral-400">
                    Send a new message about one of your
                    projects.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={close}
                  disabled={sending}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black disabled:opacity-40"
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
                  <div className="rounded-[6px] border border-red-100 bg-red-50 px-3 py-2 text-[8px] leading-relaxed text-red-600">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-[8px] font-medium text-neutral-500">
                    Project
                  </label>

                  <div className="relative">
                    <select
                      value={projectId}
                      onChange={(event) =>
                        setProjectId(event.target.value)
                      }
                      disabled={loadingProjects || sending}
                      className="h-9 w-full appearance-none rounded-[6px] border border-neutral-200 bg-white px-3 pr-8 text-[9px] text-black outline-none transition-colors focus:border-neutral-400 disabled:bg-neutral-50"
                    >
                      <option value="">
                        {loadingProjects
                          ? "Loading projects..."
                          : "Select a project"}
                      </option>

                      {projects.map((project) => (
                        <option
                          key={project._id}
                          value={project._id}
                        >
                          {project.title}
                          {project.type
                            ? ` · ${project.type}`
                            : ""}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[8px] font-medium text-neutral-500">
                    Recipient
                  </label>

                  <div className="relative">
                    <select
                      value={recipientId}
                      onChange={(event) =>
                        setRecipientId(event.target.value)
                      }
                      disabled={
                        !projectId ||
                        loadingRecipients ||
                        sending
                      }
                      className="h-9 w-full appearance-none rounded-[6px] border border-neutral-200 bg-white px-3 pr-8 text-[9px] text-black outline-none transition-colors focus:border-neutral-400 disabled:bg-neutral-50"
                    >
                      <option value="">
                        {!projectId
                          ? "Select a project first"
                          : loadingRecipients
                            ? "Loading recipients..."
                            : "Select a recipient"}
                      </option>

                      {recipients.map((recipient) => {
                        const name =
                          `${recipient.fname ?? ""} ${recipient.lname ?? ""}`.trim();

                        return (
                          <option
                            key={recipient._id}
                            value={recipient._id}
                          >
                            {name || recipient.email}
                            {recipient.role
                              ? ` · ${recipient.role}`
                              : ""}
                          </option>
                        );
                      })}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[8px] font-medium text-neutral-500">
                    Related task
                    <span className="ml-1 font-normal text-neutral-300">
                      Optional
                    </span>
                  </label>

                  <div className="relative">
                    <select
                      value={taskId}
                      onChange={(event) =>
                        setTaskId(event.target.value)
                      }
                      disabled={
                        !projectId ||
                        loadingTasks ||
                        sending
                      }
                      className="h-9 w-full appearance-none rounded-[6px] border border-neutral-200 bg-white px-3 pr-8 text-[9px] text-black outline-none transition-colors focus:border-neutral-400 disabled:bg-neutral-50"
                    >
                      <option value="">
                        {!projectId
                          ? "Select a project first"
                          : loadingTasks
                            ? "Loading tasks..."
                            : "General conversation"}
                      </option>

                      {tasks.map((task) => (
                        <option
                          key={task._id}
                          value={task._id}
                        >
                          {task.title}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[8px] font-medium text-neutral-500">
                    Message
                  </label>

                  <textarea
                    value={content}
                    onChange={(event) =>
                      setContent(event.target.value)
                    }
                    disabled={sending}
                    maxLength={5000}
                    rows={5}
                    placeholder="Write your message..."
                    className="w-full resize-none rounded-[6px] border border-neutral-200 bg-white px-3 py-2.5 text-[9px] leading-relaxed text-black outline-none placeholder:text-neutral-300 focus:border-neutral-400 disabled:bg-neutral-50"
                  />

                  <div className="mt-1 flex justify-end text-[7px] text-neutral-300">
                    {content.length}/5000
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                  <div className="min-w-0">
                    {selectedProject && (
                      <p className="truncate text-[7px] text-neutral-400">
                        {selectedProject.title}
                        {selectedRecipient
                          ? ` → ${selectedRecipient.fname ?? ""} ${selectedRecipient.lname ?? ""}`.trim()
                          : ""}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={
                      sending ||
                      !projectId ||
                      !recipientId ||
                      !content.trim()
                    }
                    className="flex h-8 items-center gap-1.5 rounded-[5px] bg-[#111] px-3 text-[8px] font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                  >
                    {sending ? (
                      <>
                        <Loader2
                          className="h-3 w-3 animate-spin"
                          strokeWidth={1.8}
                        />
                        Sending
                      </>
                    ) : (
                      <>
                        <Check
                          className="h-3 w-3"
                          strokeWidth={1.8}
                        />
                        Start conversation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};