"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  FolderKanban,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  Upload,
} from "lucide-react";

import { ProjectDetailHeader } from "@/components/admin/projects/DetailHeader";
import {
  ProjectDetailTabs,
  type ProjectDetailTab,
} from "@/components/admin/projects/DetailTabs";
import { ProjectOverviewPanel } from "@/components/admin/projects/OverviewPanel";
import type {
  AdminProject,
  ProjectTaskItem,
} from "@/components/admin/projects/types";

type Person = {
  _id: string;
  fname?: string;
  lname?: string;
  email?: string;
  role?: string;
};

type ProjectFile = {
  _id: string;
  name?: string;
  originalName?: string;
  url: string;
  category: "image" | "brand-asset" | "deliverable";
  assetType?: string;
  size?: number;
  description?: string;
  createdAt?: string;
  uploadedBy?: Person | string;
};

type ProjectMessage = {
  _id: string;
  content: string;
  createdAt: string;
  sender?: Person | string;
  recipient?: Person | string;
  task?: { _id: string; title: string } | string | null;
};

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  kind: "task" | "file" | "message";
};

type ApiResult<T> = {
  success?: boolean;
  error?: string;
  message?: string;
  project?: T;
  projects?: T[];
  tasks?: ProjectTaskItem[];
  data?: T[];
  files?: ProjectFile[];
  messages?: ProjectMessage[];
};

const panelClass =
  "overflow-hidden rounded-2xl border border-neutral-200 bg-white";

const mutedText = "text-xs leading-5 text-neutral-500";

function personName(person?: Person | string | null) {
  if (!person) return "Unknown user";
  if (typeof person === "string") return "Workspace member";

  return (
    [person.fname, person.lname].filter(Boolean).join(" ") ||
    person.email ||
    "Workspace member"
  );
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatSize(bytes?: number) {
  if (typeof bytes !== "number" || bytes < 0) return "";

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    cache: "no-store",
  });

  const result = (await response.json()) as T & {
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(
      result.error ||
        result.message ||
        `Request failed (${response.status}).`
    );
  }

  return result;
}

function SectionHeading({
  eyebrow,
  title,
  description,
  count,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  count?: number;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-100 px-5 py-5 sm:px-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700">
          <FolderKanban size={17} strokeWidth={1.8} />
        </div>

        <div>
          {eyebrow && (
            <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">
              {eyebrow}
            </p>
          )}

          <h2 className="text-sm font-semibold tracking-tight text-neutral-950">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              {description}
            </p>
          )}
        </div>
      </div>

      {count !== undefined && (
        <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium tabular-nums text-neutral-600">
          {count}
        </span>
      )}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="px-5 py-14 text-center sm:py-16">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-neutral-500">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-semibold tracking-tight text-neutral-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-neutral-500">
        {description}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-6 pb-8">
      <div className="h-4 w-36 animate-pulse rounded bg-neutral-100" />

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
        <div className="h-4 w-32 animate-pulse rounded bg-neutral-100" />
        <div className="mt-5 h-8 w-2/3 max-w-sm animate-pulse rounded-lg bg-neutral-100" />
        <div className="mt-3 h-4 w-full max-w-md animate-pulse rounded bg-neutral-100" />

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-20 animate-pulse rounded-xl border border-neutral-100 bg-neutral-50"
            />
          ))}
        </div>
      </div>

      <div className="h-12 animate-pulse rounded-xl bg-neutral-100" />

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="h-5 w-40 animate-pulse rounded bg-neutral-100" />
        <div className="mt-5 h-28 animate-pulse rounded-xl bg-neutral-50" />
      </div>

      <div className="flex items-center justify-center gap-2 py-3 text-xs text-neutral-500">
        <LoaderCircle size={15} className="animate-spin" />
        Loading project workspace…
      </div>
    </div>
  );
}

export default function AdminProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [project, setProject] = useState<AdminProject | null>(null);
  const [tasks, setTasks] = useState<ProjectTaskItem[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [activeTab, setActiveTab] =
    useState<ProjectDetailTab>("overview");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const loadProject = useCallback(
    async (quiet = false) => {
      if (!projectId) return;

      if (quiet) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        const result = await getJson<ApiResult<AdminProject>>(
          `/api/projects/${projectId}`
        );

        if (!result.project) {
          throw new Error(
            "The project response did not include a project."
          );
        }

        setProject(result.project);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this project."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [projectId]
  );

  const loadTasks = useCallback(async () => {
    if (!projectId) return;

    try {
      const result = await getJson<ApiResult<ProjectTaskItem>>(
        "/api/tasks?limit=100"
      );

      const allTasks = result.tasks ?? result.data ?? [];

      setTasks(
        allTasks.filter((task) => {
          const taskProject = (
            task as ProjectTaskItem & {
              project?: string | { _id?: string };
            }
          ).project;

          const taskProjectId =
            typeof taskProject === "string"
              ? taskProject
              : taskProject?._id;

          return taskProjectId === projectId;
        })
      );
    } catch (err) {
      console.error("Unable to load project tasks:", err);
    }
  }, [projectId]);

  const loadFiles = useCallback(async () => {
    if (!projectId) return;

    try {
      const result = await getJson<ApiResult<never>>(
        `/api/projects/${projectId}/files`
      );

      setFiles(result.files ?? []);
    } catch (err) {
      console.error("Unable to load project files:", err);
    }
  }, [projectId]);

  const loadMessages = useCallback(async () => {
    if (!projectId) return;

    try {
      const result = await getJson<ApiResult<never>>(
        `/api/messages?projectId=${encodeURIComponent(projectId)}&limit=100`
      );

      setMessages(result.messages ?? []);
    } catch (err) {
      console.error("Unable to load project messages:", err);
    }
  }, [projectId]);

  const refreshWorkspace = useCallback(async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        loadProject(true),
        loadTasks(),
        loadFiles(),
        loadMessages(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [loadProject, loadTasks, loadFiles, loadMessages]);

  useEffect(() => {
    void Promise.all([
      loadProject(),
      loadTasks(),
      loadFiles(),
      loadMessages(),
    ]);
  }, [loadProject, loadTasks, loadFiles, loadMessages]);

  async function handleUpload(file: File) {
    setUploadError("");
    setUploadMessage("");
    setUploading(true);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      const imageExtensions = [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "gif",
        "avif",
      ];

      const category: ProjectFile["category"] =
        imageExtensions.includes(extension) ? "image" : "deliverable";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const response = await fetch(
        `/api/projects/${projectId}/files`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const result = (await response.json()) as {
        error?: string;
        message?: string;
        file?: ProjectFile;
      };

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Upload failed."
        );
      }

      setUploadMessage("File uploaded successfully.");

      await Promise.all([loadFiles(), loadProject(true)]);
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : "Unable to upload this file."
      );
    } finally {
      setUploading(false);
    }
  }

  const activity: ActivityItem[] = useMemo(
    () =>
      [
        ...tasks.map((task) => ({
          id: `task-${task._id}`,
          title: task.title,
          description: `Task status: ${task.status || "Updated"}`,
          date:
            (task as ProjectTaskItem & { updatedAt?: string }).updatedAt ||
            (task as ProjectTaskItem & { createdAt?: string }).createdAt ||
            "",
          kind: "task" as const,
        })),
        ...files.map((file) => ({
          id: `file-${file._id}`,
          title: `File uploaded: ${
            file.originalName || file.name || "Untitled file"
          }`,
          description: `Uploaded by ${personName(file.uploadedBy)}`,
          date: file.createdAt || "",
          kind: "file" as const,
        })),
        ...messages.map((message) => ({
          id: `message-${message._id}`,
          title: `Message from ${personName(message.sender)}`,
          description: message.content,
          date: message.createdAt,
          kind: "message" as const,
        })),
      ].sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [tasks, files, messages]
  );

  const taskStats = useMemo(
    () => ({
      total: tasks.length,
      completed: tasks.filter(
        (task) => task.status?.toLowerCase() === "completed"
      ).length,
    }),
    [tasks]
  );

  if (loading) {
    return <LoadingState />;
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldAlert size={21} />
          </div>

          <h1 className="mt-5 text-lg font-semibold tracking-tight text-neutral-950">
            Unable to open project
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            {error || "The requested project could not be found."}
          </p>

          <button
            type="button"
            onClick={() => void loadProject()}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-neutral-950 px-4 text-xs font-medium text-white transition hover:bg-neutral-800"
          >
            <RefreshCw size={13} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto min-w-0 max-w-[1440px] space-y-5 pb-10 sm:space-y-6">
      {/* Workspace toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <FolderKanban size={14} />
          <span>Workspace</span>
          <span className="text-neutral-300">/</span>
          <span className="font-medium text-neutral-800">Project details</span>
        </div>

        <button
          type="button"
          onClick={() => void refreshWorkspace()}
          disabled={refreshing}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={13}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Refreshing…" : "Refresh workspace"}
        </button>
      </div>

      {/* Existing project header */}
      <ProjectDetailHeader project={project} />

      {/* Project summary strip */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          icon={<CheckCircle2 size={16} />}
          label="Tasks completed"
          value={`${taskStats.completed} / ${taskStats.total}`}
          accent="emerald"
        />

        <SummaryCard
          icon={<FileText size={16} />}
          label="Project files"
          value={files.length.toLocaleString()}
          accent="neutral"
        />

        <SummaryCard
          icon={<MessageSquare size={16} />}
          label="Messages"
          value={messages.length.toLocaleString()}
          accent="blue"
        />

        <SummaryCard
          icon={<Activity size={16} />}
          label="Activity entries"
          value={activity.length.toLocaleString()}
          accent="amber"
        />
      </section>

      {/* Tabs */}
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white p-1.5">
        <ProjectDetailTabs
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <ProjectOverviewPanel
          project={project}
          tasks={tasks}
          onAddTask={() => setActiveTab("tasks")}
          onUploadFile={() => setActiveTab("files")}
          onSendUpdate={() => setActiveTab("messages")}
        />
      )}

      {/* Tasks */}
      {activeTab === "tasks" && (
        <section className={panelClass}>
          <SectionHeading
            title="Project tasks"
            description="Track the work required to deliver this project."
            count={tasks.length}
          />

          {tasks.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 size={20} />}
              title="No tasks yet"
              description="Tasks created for this project will appear here."
            />
          ) : (
            <div className="divide-y divide-neutral-100">
              {tasks.map((task) => {
                const isCompleted =
                  task.status?.toLowerCase() === "completed";

                return (
                  <article
                    key={task._id}
                    className="group flex flex-col gap-3 px-5 py-4 transition hover:bg-neutral-50/70 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          isCompleted
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        <CheckCircle2 size={16} />
                      </span>

                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-neutral-900">
                          {task.title}
                        </h3>

                        <p className="mt-1 text-xs text-neutral-500">
                          Task status
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={task.status || "Pending"} />
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Files */}
      {activeTab === "files" && (
        <section className={panelClass}>
          <div className="flex flex-col gap-4 border-b border-neutral-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700">
                <FileText size={17} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-neutral-950">
                  Project files
                </h2>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Images, brand assets, and project deliverables.
                </p>
                <p className="mt-2 text-[11px] text-neutral-400">
                  {files.length} {files.length === 1 ? "file" : "files"}
                </p>
              </div>
            </div>

            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 self-start rounded-lg bg-neutral-950 px-4 text-xs font-medium text-white transition hover:bg-neutral-800 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
              {uploading ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}

              {uploading ? "Uploading…" : "Upload file"}

              <input
                type="file"
                className="sr-only"
                disabled={uploading}
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0];

                  if (selectedFile) {
                    void handleUpload(selectedFile);
                  }

                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          {(uploadError || uploadMessage) && (
            <div className="px-5 pt-4 sm:px-6">
              {uploadError && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"
                >
                  {uploadError}
                </p>
              )}

              {uploadMessage && (
                <p
                  role="status"
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-800"
                >
                  {uploadMessage}
                </p>
              )}
            </div>
          )}

          {files.length === 0 ? (
            <EmptyState
              icon={<Upload size={20} />}
              title="Your project files will live here"
              description="Upload project images, brand assets, or deliverables to keep everything organized in one place."
            />
          ) : (
            <div className="divide-y divide-neutral-100">
              {files.map((file) => (
                <article
                  key={file._id}
                  className="flex flex-col gap-3 px-5 py-4 transition hover:bg-neutral-50/70 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-600">
                      <FileText size={17} />
                    </div>

                    <div className="min-w-0">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-sm font-medium text-neutral-900 transition hover:text-neutral-600 hover:underline"
                      >
                        {file.originalName || file.name || "Untitled file"}
                      </a>

                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                        <span className="capitalize">
                          {file.category.replace("-", " ")}
                        </span>

                        {file.size !== undefined && (
                          <>
                            <span className="text-neutral-300">·</span>
                            <span>{formatSize(file.size)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <time className="text-[11px] text-neutral-400">
                      {formatDate(file.createdAt)}
                    </time>

                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${
                        file.originalName || file.name || "file"
                      }`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:bg-white hover:text-neutral-950"
                    >
                      <ArrowRight size={14} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Messages */}
      {activeTab === "messages" && (
        <section className={panelClass}>
          <SectionHeading
            title="Project messages"
            description="Conversations associated with this project."
            count={messages.length}
          />

          {messages.length === 0 ? (
            <EmptyState
              icon={<MessageSquare size={20} />}
              title="No messages yet"
              description="Messages linked to this project will appear here when conversations are started."
            />
          ) : (
            <div className="space-y-3 bg-neutral-50/60 p-4 sm:p-6">
              {messages.map((message) => (
                <article
                  key={message._id}
                  className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-700">
                        {personName(message.sender)
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-neutral-900">
                          {personName(message.sender)}
                        </h3>
                        <p className="mt-1 text-[11px] text-neutral-500">
                          Project conversation
                        </p>
                      </div>
                    </div>

                    <time className="text-[11px] text-neutral-400">
                      {formatDate(message.createdAt)}
                    </time>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap break-words text-xs leading-6 text-neutral-600">
                    {message.content}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Activity */}
      {activeTab === "activity" && (
        <section className={panelClass}>
          <SectionHeading
            title="Project activity"
            description="A timeline of recorded tasks, file uploads, and messages."
            count={activity.length}
          />

          {activity.length === 0 ? (
            <EmptyState
              icon={<Activity size={20} />}
              title="Nothing to report just yet"
              description="Activity will appear here as the project develops."
            />
          ) : (
            <div className="px-5 py-5 sm:px-7 sm:py-6">
              <div className="relative space-y-0">
                {activity.slice(0, 30).map((item, index) => (
                  <div
                    key={item.id}
                    className="relative flex gap-4 pb-6 last:pb-0"
                  >
                    {index !== Math.min(activity.length, 30) - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-[17px] top-9 w-px bg-neutral-200"
                      />
                    )}

                    <div
                      className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                        item.kind === "task"
                          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                          : item.kind === "file"
                            ? "border-blue-100 bg-blue-50 text-blue-700"
                            : "border-neutral-200 bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {item.kind === "task" ? (
                        <CheckCircle2 size={15} />
                      ) : item.kind === "file" ? (
                        <FileText size={15} />
                      ) : (
                        <MessageSquare size={15} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <h3 className="text-xs font-semibold leading-5 text-neutral-900">
                          {item.title}
                        </h3>

                        <time className="shrink-0 text-[11px] text-neutral-400">
                          {formatDate(item.date)}
                        </time>
                      </div>

                      <p className="mt-1 break-words text-xs leading-5 text-neutral-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Milestones */}
      {activeTab === "milestones" && (
        <section className={panelClass}>
          <EmptyState
            icon={<CalendarDays size={20} />}
            title="Milestones are not configured yet"
            description="The current project model does not provide a persisted milestone collection. Add the milestone schema and API before enabling milestone creation."
          />
        </section>
      )}

      {/* Updates */}
      {activeTab === "updates" && (
        <section className={panelClass}>
          <EmptyState
            icon={<Activity size={20} />}
            title="Project updates"
            description="A dedicated project-update record and API are needed to publish and retain formal project updates."
          />
        </section>
      )}

      {/* Settings */}
      {activeTab === "settings" && (
        <section className={panelClass}>
          <SectionHeading
            title="Project settings"
            description="Reference information for this project."
          />

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Project identifier
              </p>

              <p className="mt-2 break-all font-mono text-xs leading-5 text-neutral-700">
                {project._id}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Client
              </p>

              <p className="mt-2 text-sm font-medium text-neutral-900">
                {personName(
                  (
                    project as AdminProject & {
                      client?: Person | string;
                    }
                  ).client
                )}
              </p>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4">
                <Clock3
                  size={16}
                  className="mt-0.5 shrink-0 text-amber-700"
                />

                <div>
                  <p className="text-xs font-semibold text-amber-950">
                    Editing controls are not connected
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-900/80">
                    Connect the project edit form and deletion confirmation
                    to your existing API endpoints before enabling
                    configuration changes here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="flex flex-col gap-2 border-t border-neutral-200 pt-4 text-[11px] text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Project workspace
        </span>

        <span>Project ID: {project._id}</span>
      </footer>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "neutral" | "emerald" | "blue" | "amber";
}) {
  const iconStyles = {
    neutral: "bg-neutral-100 text-neutral-700",
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-neutral-500">{label}</p>

        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconStyles[accent]}`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-neutral-950 tabular-nums">
        {value}
      </p>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  const styles =
    normalized === "completed"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : normalized === "in progress"
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : normalized === "client review"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-neutral-200 bg-neutral-50 text-neutral-600";

  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
