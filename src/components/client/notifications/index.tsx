"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {Bell, CheckCheck, Inbox, LoaderCircle, RefreshCw} from "lucide-react";
import { NotificationHeader } from "./Header";
import { NotificationList } from "./List";

export type NotificationType =
  | "task"
  | "message"
  | "file"
  | "project"
  | "deliverable"
  | "milestone"
  | "system";

export type NotificationAction =
  | "created"
  | "assigned"
  | "updated"
  | "completed"
  | "uploaded"
  | "received"
  | "approved"
  | "mentioned"
  | "status_changed"
  | "deadline_approaching"
  | "deadline_reached";

export interface ClientNotification {
  id: string;
  type: NotificationType;
  action: NotificationAction;
  title: string;
  description?: string;
  projectId?: string;
  taskId?: string;
  messageId?: string;
  fileId?: string;
  actor?: {
    id: string;
    name: string;
    image?: string;
  };
  href?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationApiDocument {
  _id?: string;
  id?: string;
  type: NotificationType;
  action: NotificationAction;
  title: string;
  description?: string | null;
  href?: string | null;
  read: boolean;
  createdAt: string;
  actor?:
    | string
    | {
        _id?: string;
        id?: string;
        fname?: string;
        lname?: string;
        name?: string;
        image?: string | null;
      }
    | null;
  project?: string | { _id?: string; id?: string } | null;
  task?: string | { _id?: string; id?: string } | null;
  message?: string | { _id?: string; id?: string } | null;
  file?: string | { _id?: string; id?: string } | null;
}

interface NotificationsApiResponse {
  success: boolean;
  notifications?: NotificationApiDocument[];
  unreadCount?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
}

const getId = (
  value:
    | string
    | { _id?: string; id?: string }
    | null
    | undefined
): string | undefined => {
  if (typeof value === "string") return value;
  return value?._id ?? value?.id;
};

const normalizeNotification = (
  item: NotificationApiDocument
): ClientNotification => {
  const actor =
    typeof item.actor === "object" && item.actor !== null
      ? item.actor
      : null;

  const actorName = actor
    ? actor.name ||
      [actor.fname, actor.lname].filter(Boolean).join(" ") ||
      "Team member"
    : undefined;

  return {
    id: item._id ?? item.id ?? "",
    type: item.type,
    action: item.action,
    title: item.title,
    description: item.description || undefined,
    projectId: getId(item.project),
    taskId: getId(item.task),
    messageId: getId(item.message),
    fileId: getId(item.file),
    actor: actor
      ? {
          id: actor._id ?? actor.id ?? "",
          name: actorName ?? "Team member",
          image: actor.image ?? undefined,
        }
      : undefined,
    href: item.href || undefined,
    read: Boolean(item.read),
    createdAt: item.createdAt,
  };
};

function NotificationSkeleton() {
  return (
    <div
      aria-label="Loading notifications"
      aria-busy="true"
      className="divide-y divide-slate-100"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-4 px-4 py-5 sm:px-6"
        >
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-2xl bg-slate-100" />

          <div className="min-w-0 flex-1 space-y-3 pt-1">
            <div className="h-3 w-2/5 animate-pulse rounded-full bg-slate-100" />
            <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-100" />
            <div className="h-2.5 w-1/4 animate-pulse rounded-full bg-slate-50" />
          </div>

          <div className="h-2 w-2 shrink-0 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function NotificationError({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div className="mx-4 my-5 rounded-2xl border border-rose-100 bg-rose-50/70 p-5 sm:mx-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm">
            <Bell size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              We couldn&apos;t load your notifications
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {message}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={14}
            className={retrying ? "animate-spin" : ""}
          />
          Try again
        </button>
      </div>
    </div>
  );
}

function OverviewCard({
  icon: Icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: typeof Bell;
  label: string;
  value: number;
  detail: string;
  accent: "blue" | "amber";
}) {
  const styles =
    accent === "blue"
      ? {
          icon: "bg-blue-50 text-blue-700",
          border: "border-slate-200",
        }
      : {
          icon: "bg-amber-50 text-amber-700",
          border: "border-amber-100",
        };

  return (
    <div
      className={`rounded-2xl border ${styles.border} bg-white p-4 sm:p-5`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {value.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {detail}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          <Icon size={19} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}

export const NotificationsDashboard = () => {
  const router = useRouter();

  const [notifications, setNotifications] = useState<
    ClientNotification[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(
    async (pageToLoad = 1, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else if (pageToLoad === 1 && notifications.length > 0) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await fetch(
          `/api/notifications?page=${pageToLoad}&limit=20`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as NotificationsApiResponse;

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to load notifications."
          );
        }

        const incoming = (data.notifications ?? [])
          .map(normalizeNotification)
          .filter((item) => item.id);

        setNotifications((current) => {
          if (!append) return incoming;

          const existingIds = new Set(
            current.map((item) => item.id)
          );

          return [
            ...current,
            ...incoming.filter(
              (item) => !existingIds.has(item.id)
            ),
          ];
        });

        setUnreadCount(
          typeof data.unreadCount === "number"
            ? data.unreadCount
            : incoming.filter((item) => !item.read).length
        );

        if (typeof data.pagination?.total === "number") {
          setTotalCount(data.pagination.total);
        }

        setPage(data.pagination?.page ?? pageToLoad);
        setTotalPages(data.pagination?.pages ?? 1);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading notifications."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [notifications.length]
  );

  useEffect(() => {
    void fetchNotifications(1);
  }, [fetchNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      const notification = notifications.find(
        (item) => item.id === id
      );

      if (!notification || notification.read) return;

      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, read: true } : item
        )
      );
      setUnreadCount((current) => Math.max(0, current - 1));

      try {
        const response = await fetch(
          `/api/notifications/${encodeURIComponent(id)}`,
          {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read: true }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to mark notification as read."
          );
        }
      } catch {
        setNotifications((current) =>
          current.map((item) =>
            item.id === id ? { ...item, read: false } : item
          )
        );
        setUnreadCount((current) => current + 1);
        throw new Error("Unable to mark this notification as read.");
      }
    },
    [notifications]
  );

  const markAllAsRead = useCallback(async () => {
    if (unreadCount === 0 || markingAll) return;

    setMarkingAll(true);
    setError("");

    try {
      const response = await fetch(
        "/api/notifications/read-all",
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to mark all notifications as read."
        );
      }

      // Keep the server as the source of truth.
      setNotifications((current) =>
        current.map((item) => ({ ...item, read: true }))
      );
      setUnreadCount(0);

      // Refresh the list, but don't undo a successful read-all
      // operation if this secondary request fails.
      await fetchNotifications(1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark all notifications as read."
      );
    } finally {
      setMarkingAll(false);
    }
  }, [fetchNotifications, markingAll, unreadCount]);

  const handleNotificationClick = useCallback(
    async (notification: ClientNotification) => {
      try {
        if (!notification.read) {
          await markAsRead(notification.id);
        }
      } catch {
        return;
      }

      if (notification.href) {
        router.push(notification.href);
      }
    },
    [markAsRead, router]
  );

  const hasMore = useMemo(
    () => page < totalPages,
    [page, totalPages]
  );

  return (
    <section className="min-h-full w-full bg-[#f7f8fa] text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      >
        {/* Page heading */}
        <div className="mb-7 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Notifications
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Keep track of project updates, tasks, messages, and
              important activity from your team.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchNotifications(1)}
            disabled={loading || refreshing || markingAll}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={14}
              className={
                refreshing || loading ? "animate-spin" : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* Overview cards */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <OverviewCard
            icon={Bell}
            label="Total notifications"
            value={totalCount}
            detail="Across your activity feed"
            accent="blue"
          />

          <OverviewCard
            icon={Inbox}
            label="Unread notifications"
            value={unreadCount}
            detail={
              unreadCount > 0
                ? "Updates waiting for your attention"
                : "You're all caught up"
            }
            accent="amber"
          />
        </div>

        {/* Main notification panel */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.035)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Bell size={18} strokeWidth={1.8} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Your notifications
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {loading
                    ? "Getting your latest updates..."
                    : `${notifications.length.toLocaleString()} shown${
                        totalCount > notifications.length
                          ? ` of ${totalCount.toLocaleString()}`
                          : ""
                      }`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium ${
                  unreadCount > 0
                    ? "bg-blue-50 text-blue-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    unreadCount > 0
                      ? "bg-blue-600"
                      : "bg-emerald-600"
                  }`}
                />
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </span>
            </div>
          </div>

          {error && (
            <NotificationError
              message={error}
              onRetry={() => void fetchNotifications(1)}
              retrying={loading || refreshing}
            />
          )}

          {loading ? (
            <NotificationSkeleton />
          ) : notifications.length === 0 && !error ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-400">
                <CheckCheck size={28} strokeWidth={1.5} />
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-900">
                You&apos;re all caught up
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                There&apos;s nothing new here right now. When your
                team shares updates or activity happens in your
                projects, you&apos;ll find it here.
              </p>

              <button
                type="button"
                onClick={() => void fetchNotifications(1)}
                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw size={13} />
                Check again
              </button>
            </div>
          ) : (
            <>
              <NotificationHeader
                unreadCount={unreadCount}
                onMarkAllAsRead={markAllAsRead}
                markingAll={markingAll}
              />

              <NotificationList
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
              />

              {hasMore && notifications.length > 0 && (
                <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-5 sm:px-6">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={loadingMore}
                      onClick={() =>
                        void fetchNotifications(page + 1, true)
                      }
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingMore ? (
                        <LoaderCircle
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <RefreshCw size={13} />
                      )}

                      {loadingMore
                        ? "Loading older notifications..."
                        : "Load older notifications"}
                    </button>

                    <p className="text-[11px] text-slate-400">
                      Page {page} of {totalPages}
                    </p>
                  </div>
                </div>
              )}

              {!hasMore && notifications.length > 0 && (
                <div className="border-t border-slate-100 px-4 py-4 text-center sm:px-6">
                  <p className="text-xs text-slate-400">
                    You&apos;ve reached the end of your notifications.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">
          Stay up to date with the latest activity across your workspace.
        </p>
      </motion.div>
    </section>
  );
};
