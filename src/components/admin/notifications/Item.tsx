
"use client";
import {
  Bell,
  Check,
  CheckCheck,
  CircleCheck,
  FileText,
  FolderKanban,
  MessageSquare,
  Milestone,
  MoreHorizontal,
  Settings2,
  Trash2,
  type LucideIcon,
} from "lucide-react";


export interface AdminNotification {
  _id: string;
  type:
    | "task"
    | "message"
    | "file"
    | "project"
    | "deliverable"
    | "milestone"
    | "system";
  action: string;
  title: string;
  description?: string;
  href?: string | null;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
  project?: {
    _id: string;
    title: string;
  } | string | null;
  task?: {
    _id: string;
    title: string;
    status?: string;
  } | string | null;
  actor?: {
    _id: string;
    fname?: string;
    lname?: string;
    image?: string | null;
    role?: string;
  } | string | null;
}

interface NotificationItemProps {
  notification: AdminNotification;
  onOpen: (notification: AdminNotification) => void;
  onToggleRead: (notification: AdminNotification) => void;
  onDelete: (notification: AdminNotification) => void;
}

const typeIcons: Record<string, LucideIcon> = {
  task: CircleCheck,
  message: MessageSquare,
  file: FileText,
  project: FolderKanban,
  deliverable: CheckCheck,
  milestone: Milestone,
  system: Settings2,
};

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== new Date().getFullYear()
      ? "numeric"
      : undefined,
  });
}

function getActorName(
  actor: AdminNotification["actor"]
): string | null {
  if (!actor || typeof actor === "string") return null;

  return `${actor.fname ?? ""} ${actor.lname ?? ""}`.trim() || null;
}

export const NotificationItem = ({
  notification,
  onOpen,
  onToggleRead,
  onDelete,
}: NotificationItemProps) => {
  const Icon = typeIcons[notification.type] ?? Bell;
  const actorName = getActorName(notification.actor);

  return (
    <article
      className={`group flex items-start gap-3 border-b border-neutral-100 px-4 py-4 transition-colors sm:px-5 ${
        notification.read
          ? "bg-white hover:bg-neutral-50/70"
          : "bg-neutral-50/70 hover:bg-neutral-50"
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(notification)}
        aria-label={`Open notification: ${notification.title}`}
        className="flex min-w-0 flex-1 items-start gap-3 text-left"
      >
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
            notification.read
              ? "border-neutral-200 bg-white text-neutral-500"
              : "border-neutral-200 bg-neutral-100 text-neutral-800"
          }`}
        >
          <Icon size={14} strokeWidth={1.8} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs leading-5 ${
                notification.read
                  ? "font-medium text-neutral-700"
                  : "font-semibold text-neutral-950"
              }`}
            >
              {notification.title}
            </span>

            {!notification.read && (
              <span
                aria-label="Unread"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-900"
              />
            )}
          </span>

          {notification.description && (
            <span className="mt-0.5 block text-xs leading-5 text-neutral-500">
              {notification.description}
            </span>
          )}

          {actorName && (
            <span className="mt-1 block text-[10px] text-neutral-400">
              From {actorName}
            </span>
          )}
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-2 pt-1">
        <time
          dateTime={notification.createdAt}
          title={new Date(notification.createdAt).toLocaleString()}
          className="whitespace-nowrap text-[10px] text-neutral-400"
        >
          {formatRelativeTime(notification.createdAt)}
        </time>

        <div className="flex items-center opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onToggleRead(notification)}
            title={notification.read ? "Mark as unread" : "Mark as read"}
            aria-label={notification.read ? "Mark as unread" : "Mark as read"}
            className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-900"
          >
            {notification.read ? (
              <MoreHorizontal size={15} />
            ) : (
              <Check size={15} />
            )}
          </button>

          <button
            type="button"
            onClick={() => onDelete(notification)}
            title="Delete notification"
            aria-label="Delete notification"
            className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
