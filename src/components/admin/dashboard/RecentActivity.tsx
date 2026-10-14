
"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  CheckCircle2,
  FileUp,
  FolderPlus,
  MessageSquare,
  RefreshCw,
  ListTodo,
} from "lucide-react";

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  href: string;
  kind: "project" | "task" | "message" | "file" | "notification";
};

type RecordData = Record<string, unknown>;

type ApiResult = {
  success?: boolean;
  error?: string;
  projects?: RecordData[];
  tasks?: RecordData[];
  messages?: RecordData[];
  files?: RecordData[];
  notifications?: RecordData[];
  data?: unknown;
};

function asRecord(value: unknown): RecordData | null {
  return value !== null && typeof value === "object"
    ? (value as RecordData)
    : null;
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function idOf(value: unknown): string {
  if (typeof value === "string") return value;
  const record = asRecord(value);
  if (!record) return "";

  const id = record._id ?? record.id;
  return typeof id === "string" ? id : "";
}

function dateOf(record: RecordData): string {
  const value = record.createdAt ?? record.updatedAt;
  return typeof value === "string" ? value : "";
}

function getArray(
  result: ApiResult | null,
  keys: (keyof ApiResult)[]
): RecordData[] {
  if (!result) return [];

  for (const key of keys) {
    const value = result[key];

    if (Array.isArray(value)) {
      return value.filter(
        (item): item is RecordData => asRecord(item) !== null
      );
    }
  }

  const data = asRecord(result.data);

  if (data) {
    for (const key of keys) {
      const value = data[key];

      if (Array.isArray(value)) {
        return value.filter(
          (item): item is RecordData => asRecord(item) !== null
        );
      }
    }
  }

  if (Array.isArray(result.data)) {
    return result.data.filter(
      (item): item is RecordData => asRecord(item) !== null
    );
  }

  return [];
}

async function fetchOptional(
  url: string,
  signal: AbortSignal
): Promise<ApiResult | null> {
  try {
    const response = await fetch(url, {
      credentials: "include",
      cache: "no-store",
      signal,
    });

    if (!response.ok) return null;
    return (await response.json()) as ApiResult;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    return null;
  }
}

function relativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Recently";

  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function projectTitle(value: unknown) {
  const project = asRecord(value);
  if (project) return stringValue(project.title, "a project");
  return "a project";
}

function activityIcon(kind: ActivityItem["kind"]) {
  const className = "h-3.5 w-3.5";

  switch (kind) {
    case "project":
      return <FolderPlus className={className} />;
    case "task":
      return <ListTodo className={className} />;
    case "message":
      return <MessageSquare className={className} />;
    case "file":
      return <FileUp className={className} />;
    default:
      return <Bell className={className} />;
  }
}

function buildActivities(
  projects: RecordData[],
  tasks: RecordData[],
  messages: RecordData[],
  files: RecordData[],
  notifications: RecordData[]
): ActivityItem[] {
  const items: ActivityItem[] = [];

  // Notifications are already explicit activity events.
  for (const record of notifications) {
    const id = idOf(record);
    const createdAt = dateOf(record);
    if (!id || !createdAt) continue;

    const type = stringValue(record.type, "system");
    const href = stringValue(record.href, "/admin/notifications");

    items.push({
      id: `notification-${id}`,
      title: stringValue(record.title, "Workspace update"),
      detail: stringValue(record.description, "An update was recorded."),
      createdAt,
      href: href.startsWith("/") ? href : "/admin/notifications",
      kind:
        type === "task" || type === "message" || type === "file" || type === "project"
          ? type
          : "notification",
    });
  }

  // Use source records as fallback activity events, not in addition to
  // notifications for the same entity when the IDs match.
  const notifiedEntityIds = new Set(
    notifications
      .map((item) => idOf(item.project) || idOf(item.task) || idOf(item.message) || idOf(item.file))
      .filter(Boolean)
  );

  for (const record of projects) {
    const id = idOf(record);
    const createdAt = dateOf(record);
    if (!id || !createdAt || notifiedEntityIds.has(id)) continue;

    items.push({
      id: `project-${id}`,
      title: "Project created",
      detail: stringValue(record.title, "A new project was added"),
      createdAt,
      href: `/admin/projects/${id}`,
      kind: "project",
    });
  }

  for (const record of tasks) {
    const id = idOf(record);
    const createdAt = dateOf(record);
    if (!id || !createdAt || notifiedEntityIds.has(id)) continue;

    items.push({
      id: `task-${id}`,
      title: "Task updated",
      detail: stringValue(record.title, "A project task was updated"),
      createdAt,
      href: `/admin/tasks`,
      kind: "task",
    });
  }

  for (const record of messages) {
    const id = idOf(record);
    const createdAt = dateOf(record);
    if (!id || !createdAt || notifiedEntityIds.has(id)) continue;

    const sender = asRecord(record.sender);
    const senderName = sender
      ? [sender.fname, sender.lname].filter(
          (value): value is string => typeof value === "string"
        ).join(" ")
      : "A user";

    items.push({
      id: `message-${id}`,
      title: "New message",
      detail: `${senderName || "A user"} sent a message`,
      createdAt,
      href: "/admin/messages",
      kind: "message",
    });
  }

  for (const record of files) {
    const id = idOf(record);
    const createdAt = dateOf(record);
    if (!id || !createdAt || notifiedEntityIds.has(id)) continue;

    items.push({
      id: `file-${id}`,
      title: "File uploaded",
      detail: stringValue(record.name, "A project file was uploaded"),
      createdAt,
      href: "/admin/files",
      kind: "file",
    });
  }

  return items
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 6);
}

export default function AdminRecentActivity() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadActivities = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.all([
        fetchOptional("/api/notifications?limit=30", signal),
        fetchOptional("/api/projects", signal),
        fetchOptional("/api/tasks?limit=30", signal),
        fetchOptional("/api/messages?limit=30", signal),
        fetchOptional("/api/files?limit=30", signal),
      ]);

      if (signal.aborted) return;

      const [notificationResult, projectResult, taskResult, messageResult, fileResult] =
        results;

      const nextItems = buildActivities(
        getArray(projectResult, ["projects"]),
        getArray(taskResult, ["tasks"]),
        getArray(messageResult, ["messages"]),
        getArray(fileResult, ["files"]),
        getArray(notificationResult, ["notifications"])
      );

      setItems(nextItems);

      if (results.every((result) => result === null)) {
        setError("Recent activity is temporarily unavailable.");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Recent activity is temporarily unavailable.");
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadActivities(controller.signal);
    return () => controller.abort();
  }, [loadActivities]);

  return (
    <section className="min-w-0 rounded-[6px] border border-[#e8e8e8] bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-[#ededed] px-4 py-3.5">
        <div>
          <h2 className="text-[11px] font-semibold text-[#222]">
            Recent activity
          </h2>
          <p className="mt-0.5 text-[9px] text-[#999]">
            Latest workspace updates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Refresh recent activity"
            disabled={loading}
            onClick={() => {
              const controller = new AbortController();
              void loadActivities(controller.signal);
            }}
            className="flex h-6 w-6 items-center justify-center rounded text-[#999] hover:bg-[#f5f5f5] hover:text-[#333] disabled:opacity-50"
          >
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          </button>

          <Link
            href="/admin/activity"
            className="flex items-center gap-1 whitespace-nowrap text-[9px] font-medium text-[#777] hover:text-[#111]"
          >
            View all <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      <div className="divide-y divide-[#f1f1f1] px-4">
        {loading && items.length === 0 &&
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 py-3">
              <div className="h-7 w-7 animate-pulse rounded-md bg-[#f0f0f0]" />
              <div className="flex-1 space-y-2">
                <div className="h-2.5 w-3/4 animate-pulse rounded bg-[#f0f0f0]" />
                <div className="h-2 w-1/2 animate-pulse rounded bg-[#f5f5f5]" />
              </div>
            </div>
          ))}

        {!loading && error && (
          <div className="py-8 text-center">
            <Activity size={17} className="mx-auto text-[#bbb]" />
            <p className="mt-2 text-[10px] text-[#888]">{error}</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="py-9 text-center">
            <CheckCircle2 size={17} className="mx-auto text-[#bbb]" />
            <p className="mt-2 text-[10px] text-[#888]">
              No recent activity to show.
            </p>
          </div>
        )}

        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex items-start gap-2.5 py-3 transition-colors"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] border border-[#e9e9e9] bg-[#fafafa] text-[#555] transition-colors group-hover:border-[#d8d8d8] group-hover:bg-white">
              {activityIcon(item.kind)}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-[10px] font-medium text-[#333] group-hover:text-black">
                {item.title}
              </span>
              <span className="mt-1 block truncate text-[9px] text-[#999]">
                {item.detail}
              </span>
            </span>

            <span className="shrink-0 pt-0.5 text-[8px] text-[#aaa]">
              {relativeTime(item.createdAt)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
