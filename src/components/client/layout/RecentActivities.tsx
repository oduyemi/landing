"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Bell,
  FileText,
  FolderKanban,
  Image as ImageIcon,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type ActivityKind =
  | "task"
  | "file"
  | "message"
  | "project"
  | "request";

interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  description: string;
  date: string;
  href: string;
}

interface ApiResponse<T> {
  success?: boolean;
  error?: string;
  data?: T;
  tasks?: T;
  files?: T;
  messages?: T;
  projects?: T;
  requests?: T;
}

type AnyRecord = Record<string, unknown>;

const asRecord = (value: unknown): AnyRecord | null =>
  value && typeof value === "object"
    ? (value as AnyRecord)
    : null;

const asArray = (value: unknown): AnyRecord[] =>
  Array.isArray(value)
    ? value.filter(
        (item): item is AnyRecord =>
          !!item && typeof item === "object",
      )
    : [];

const getId = (value: unknown): string => {
  if (typeof value === "string") return value;

  const record = asRecord(value);
  if (!record) return "";

  if (typeof record._id === "string") return record._id;
  if (record._id && typeof record._id === "object") {
    return String(record._id);
  }

  return "";
};

const getText = (
  value: unknown,
  fallback = "",
): string =>
  typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;

const getName = (value: unknown): string => {
  const record = asRecord(value);
  if (!record) return "Someone";

  const name = [
    getText(record.fname),
    getText(record.lname),
  ]
    .filter(Boolean)
    .join(" ");

  return name || "Someone";
};

const getProjectTitle = (value: unknown): string => {
  const project = asRecord(value);
  return getText(project?.title, "a project");
};

const getTimestamp = (value: unknown): string => {
  if (typeof value !== "string" && !(value instanceof Date)) {
    return new Date(0).toISOString();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? new Date(0).toISOString()
    : date.toISOString();
};

const isUpdated = (record: AnyRecord): boolean => {
  const created = new Date(String(record.createdAt ?? "")).getTime();
  const updated = new Date(String(record.updatedAt ?? "")).getTime();

  return (
    Number.isFinite(created) &&
    Number.isFinite(updated) &&
    updated - created > 60_000
  );
};

const relativeTime = (value: string): string => {
  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp) || timestamp === 0) {
    return "Date unavailable";
  }

  const diff = Date.now() - timestamp;
  const minutes = Math.floor(Math.max(0, diff) / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year:
      new Date(value).getFullYear() !== new Date().getFullYear()
        ? "numeric"
        : undefined,
  }).format(new Date(value));
};

const activityIcon = (kind: ActivityKind) => {
  switch (kind) {
    case "task":
      return ClipboardList;
    case "file":
      return FileText;
    case "message":
      return MessageSquare;
    case "project":
      return FolderKanban;
    case "request":
      return Sparkles;
    default:
      return Activity;
  }
};

const activityTone = (kind: ActivityKind) => {
  switch (kind) {
    case "task":
      return "bg-amber-50 text-amber-700";
    case "file":
      return "bg-violet-50 text-violet-700";
    case "message":
      return "bg-blue-50 text-blue-700";
    case "project":
      return "bg-emerald-50 text-emerald-700";
    case "request":
      return "bg-orange-50 text-orange-700";
    default:
      return "bg-[#f2f2f2] text-[#555]";
  }
};

async function fetchJson<T>(
  url: string,
): Promise<T | null> {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${url}`);
  }

  return (await response.json()) as T;
}

function extractArray(
  response: unknown,
  keys: string[],
): AnyRecord[] {
  const record = asRecord(response);

  if (!record) return [];

  for (const key of keys) {
    const items = asArray(record[key]);

    if (items.length > 0 || Array.isArray(record[key])) {
      return items;
    }
  }

  return [];
}

function buildTaskActivities(
  records: AnyRecord[],
): ActivityItem[] {
  return records.map((task) => {
    const updated = isUpdated(task);
    const title = getText(task.title, "Untitled task");
    const projectTitle = getProjectTitle(task.project);

    return {
      id: `task-${getId(task)}`,
      kind: "task",
      title: updated ? "Task updated" : "Task created",
      description: `${title} · ${projectTitle}`,
      date: getTimestamp(
        updated ? task.updatedAt : task.createdAt,
      ),
      href: "/client/tasks",
    };
  });
}

function buildFileActivities(
  records: AnyRecord[],
): ActivityItem[] {
  return records.map((file) => {
    const projectTitle = getProjectTitle(file.project);
    const name = getText(
      file.name,
      getText(file.originalName, "a file"),
    );

    const category = getText(file.category);
    const description =
      category === "brand-asset"
        ? "Brand asset uploaded"
        : category === "deliverable"
          ? "Deliverable uploaded"
          : "File uploaded";

    return {
      id: `file-${getId(file)}`,
      kind: "file",
      title: description,
      description: `${name} · ${projectTitle}`,
      date: getTimestamp(file.createdAt),
      href: "/client/files",
    };
  });
}

function buildMessageActivities(
  records: AnyRecord[],
  currentUserId: string,
): ActivityItem[] {
  return records.map((message) => {
    const senderId = getId(message.sender);
    const sender = getName(message.sender);
    const projectTitle = getProjectTitle(message.project);
    const content = getText(message.content, "New message");

    const sentByCurrentUser =
      !!currentUserId && senderId === currentUserId;

    return {
      id: `message-${getId(message)}`,
      kind: "message",
      title: sentByCurrentUser
        ? "Message sent"
        : `Message from ${sender}`,
      description: `${content.slice(0, 90)}${content.length > 90 ? "…" : ""} · ${projectTitle}`,
      date: getTimestamp(message.createdAt),
      href: "/client/messages",
    };
  });
}

function buildProjectActivities(
  records: AnyRecord[],
): ActivityItem[] {
  return records.map((project) => {
    const updated = isUpdated(project);

    return {
      id: `project-${getId(project)}-${updated ? "updated" : "created"}`,
      kind: "project",
      title: updated ? "Project updated" : "Project added",
      description: getText(project.title, "Untitled project"),
      date: getTimestamp(
        updated ? project.updatedAt : project.createdAt,
      ),
      href: "/client/projects",
    };
  });
}

function buildRequestActivities(
  records: AnyRecord[],
): ActivityItem[] {
  return records.map((request) => {
    const requester = getName(request.requester);

    return {
      id: `request-${getId(request)}`,
      kind: "request",
      title: "Project request received",
      description: `${getText(request.title, "New project request")} · ${requester}`,
      date: getTimestamp(request.createdAt),
      href: "/admin/project-requests",
    };
  });
}

export function RecentActivity() {
  const { user } = useAuth();

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const userId = user?._id ? String(user._id) : "";
  const role = user?.role;

  const fetchActivities = useCallback(
    async (silent = false) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const results = await Promise.allSettled([
          fetchJson<ApiResponse<unknown>>("/api/tasks?limit=30"),
          fetchJson<ApiResponse<unknown>>("/api/files?limit=30"),
          fetchJson<ApiResponse<unknown>>("/api/messages?limit=30"),
          fetchJson<ApiResponse<unknown>>("/api/projects"),
          ...(role === "admin"
            ? [
                fetchJson<ApiResponse<unknown>>(
                  "/api/project-request",
                ),
              ]
            : []),
        ]);

        const taskResult = results[0];
        const fileResult = results[1];
        const messageResult = results[2];
        const projectResult = results[3];
        const requestResult =
          role === "admin" ? results[4] : undefined;

        const rejectedCount = results.filter(
          (result) => result.status === "rejected",
        ).length;

        const taskResponse =
          taskResult.status === "fulfilled"
            ? taskResult.value
            : null;

        const fileResponse =
          fileResult.status === "fulfilled"
            ? fileResult.value
            : null;

        const messageResponse =
          messageResult.status === "fulfilled"
            ? messageResult.value
            : null;

        const projectResponse =
          projectResult.status === "fulfilled"
            ? projectResult.value
            : null;

        const tasks = extractArray(taskResponse, ["tasks", "data"]);
        const files = extractArray(fileResponse, ["files", "data"]);
        const messages = extractArray(messageResponse, ["messages", "data"]);
        const projects = extractArray(projectResponse, ["projects", "data"]);

        const requests =
          requestResult?.status === "fulfilled"
            ? extractArray(requestResult.value, ["requests"])
            : [];

        const merged = [
          ...buildTaskActivities(tasks),
          ...buildFileActivities(files),
          ...buildMessageActivities(messages, userId),
          ...buildProjectActivities(projects),
          ...buildRequestActivities(requests),
        ]
          .filter((item) => item.id !== "task-" && item.id !== "file-" && item.id !== "message-" && item.id !== "project-" && item.id !== "request-")
          .sort(
            (a, b) =>
              new Date(b.date).getTime() -
              new Date(a.date).getTime(),
          )
          .slice(0, 8);

        setActivities(merged);

        if (rejectedCount === results.length) {
          throw new Error("Unable to load recent activity.");
        }

        if (rejectedCount > 0) {
          console.warn(
            `${rejectedCount} recent activity source(s) could not be loaded.`,
          );
        }
      } catch (fetchError) {
        console.error("FETCH RECENT ACTIVITY ERROR:", fetchError);
        setError("We couldn't refresh recent activity. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [role, userId],
  );

  useEffect(() => {
    void fetchActivities();

    const onFocus = () => void fetchActivities(true);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchActivities(true);
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange,
      );
    };
  }, [fetchActivities]);

  return (
    <section aria-labelledby="recent-activity-title">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2
              id="recent-activity-title"
              className="text-sm font-semibold tracking-tight text-[#202020]"
            >
              Recent activity
            </h2>
          </div>

          <p className="mt-2 text-xs leading-5 text-[#858585]">
            The latest updates across your workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchActivities(true)}
          disabled={loading || refreshing}
          aria-label="Refresh recent activity"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#ededed] text-[#777] transition hover:bg-[#f7f7f7] hover:text-[#222] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={refreshing ? "animate-spin" : ""}
          />
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-[#888]">
            <LoaderCircle size={15} className="animate-spin" />
            Loading recent activity...
          </div>
        </div>
      ) : error && activities.length === 0 ? (
        <div className="rounded-xl border border-[#ededed] bg-[#fafafa] px-4 py-8 text-center">
          <p className="text-xs text-[#777]">{error}</p>

          <button
            type="button"
            onClick={() => void fetchActivities()}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#222] hover:underline"
          >
            <RefreshCw size={12} />
            Try again
          </button>
        </div>
      ) : activities.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-[#e6e6e6] px-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f4f4] text-[#888]">
            <Bell size={18} strokeWidth={1.6} />
          </div>

          <p className="mt-3 text-xs font-semibold text-[#333]">
            No activity yet
          </p>

          <p className="mt-1 max-w-xs text-[11px] leading-5 text-[#888]">
            Project updates, tasks, messages, and uploaded files will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#f0f0f0]">
          {activities.map((item) => {
            const Icon = activityIcon(item.kind);

            return (
              <Link
                key={item.id}
                href={item.href}
                className="group flex gap-3 py-3.5 first:pt-0 last:pb-0"
              >
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${activityTone(item.kind)}`}
                >
                  <Icon size={15} strokeWidth={1.8} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold leading-5 text-[#303030] transition group-hover:text-black">
                      {item.title}
                    </p>

                    <span className="shrink-0 pt-0.5 text-[10px] tabular-nums text-[#999]">
                      {relativeTime(item.date)}
                    </span>
                  </div>

                  <p className="mt-0.5 line-clamp-2 break-words text-[11px] leading-5 text-[#858585]">
                    {item.description}
                  </p>
                </div>

                <ArrowUpRight
                  size={13}
                  className="mt-1 shrink-0 text-[#c4c4c4] opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                />
              </Link>
            );
          })}
        </div>
      )}

      {!loading && activities.length > 0 && (
        <div className="mt-4 border-t border-[#f0f0f0] pt-3">
          <Link
            href="/client/notifications"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#777] transition hover:text-[#222]"
          >
            View all updates
            <ArrowUpRight size={12} />
          </Link>
        </div>
      )}
    </section>
  );
}
