"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { LoaderCircle, RefreshCw } from "lucide-react";
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
  actor?: string | {
    _id?: string;
    id?: string;
    fname?: string;
    lname?: string;
    name?: string;
    image?: string | null;
  } | null;
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

export const NotificationsDashboard = () => {
  const router = useRouter();

  const [notifications, setNotifications] = useState<
    ClientNotification[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(
    async (pageToLoad = 1, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

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
        setLoadingMore(false);
      }
    },
    []
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

    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true }))
    );
    setUnreadCount(0);

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

      // Reconcile against the server in case new notifications arrived.
      await fetchNotifications(1);
    } catch (err) {
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark all notifications as read."
      );
    } finally {
      setMarkingAll(false);
    }
  }, [
    fetchNotifications,
    markingAll,
    notifications,
    unreadCount,
  ]);

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
    <section className="w-full bg-[#fafafa]">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-full"
      >
        <NotificationHeader
          unreadCount={unreadCount}
          onMarkAllAsRead={markAllAsRead}
          markingAll={markingAll}
        />

        {error && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-neutral-200 bg-white px-3 py-2.5">
            <p className="text-[9px] text-neutral-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void fetchNotifications(1)}
              className="flex shrink-0 items-center gap-1.5 text-[9px] font-medium text-black hover:text-neutral-500"
            >
              <RefreshCw size={10} />
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="flex items-center gap-2 text-neutral-400">
              <LoaderCircle
                size={13}
                className="animate-spin"
                strokeWidth={1.6}
              />
              <span className="text-[9px]">
                Loading notifications
              </span>
            </div>
          </div>
        ) : (
          <>
            <NotificationList
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
            />

            {hasMore && notifications.length > 0 && (
              <div className="flex justify-center border-t border-neutral-100 py-5">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() =>
                    void fetchNotifications(page + 1, true)
                  }
                  className="flex items-center gap-2 text-[9px] font-medium text-neutral-500 transition-colors hover:text-black disabled:opacity-50"
                >
                  {loadingMore && (
                    <LoaderCircle
                      size={11}
                      className="animate-spin"
                    />
                  )}
                  {loadingMore
                    ? "Loading..."
                    : "Load older notifications"}
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </section>
  );
};
