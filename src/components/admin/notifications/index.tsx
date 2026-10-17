
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, LoaderCircle, Trash2 } from "lucide-react";
import { NotificationFilters, type NotificationReadFilter, type NotificationTypeFilter} from "./Filters";
import {NotificationList} from "./List";
import type { AdminNotification } from "./Item";


interface NotificationsResponse {
  success: boolean;
  notifications: AdminNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
  error?: string;
}

interface UnreadCountResponse {
  success: boolean;
  unreadCount: number;
  error?: string;
}

export const AdminNotifications = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [type, setType] = useState<NotificationTypeFilter>("all");
  const [readStatus, setReadStatus] = useState<NotificationReadFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState<"read-all" | "clear-all" | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const requestSequence = useRef(0);
  const refresh = useCallback(() => {setRefreshKey((current) => current + 1)}, []);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/notifications/unread-count",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data: UnreadCountResponse =
        await response.json();

      if (response.ok && data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (countError) {
      console.error(
        "Unable to load unread notification count:",
        countError
      );
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const sequence = ++requestSequence.current;

    async function loadNotifications() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "20",
        });

        if (type !== "all") {
          params.set("type", type);
        }

        if (readStatus === "unread") {
          params.set("unread", "true");
        } else if (readStatus === "read") {
          params.set("unread", "false");
        }

        const response = await fetch(
          `/api/notifications?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data: NotificationsResponse =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to load notifications."
          );
        }

        if (sequence !== requestSequence.current) return;

        setNotifications(data.notifications);
        setTotal(data.pagination.total);
        setTotalPages(
          Math.max(1, data.pagination.pages)
        );
        setUnreadCount(data.unreadCount);
      } catch (loadError) {
        if (
          loadError instanceof Error &&
          loadError.name === "AbortError"
        ) {
          return;
        }

        if (sequence !== requestSequence.current) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load notifications."
        );
      } finally {
        if (sequence === requestSequence.current) {
          setLoading(false);
        }
      }
    }

    void loadNotifications();

    return () => controller.abort();
  }, [page, type, readStatus, refreshKey]);

  const handleTypeChange = useCallback(
    (value: NotificationTypeFilter) => {
      setType(value);
      setPage(1);
    },
    []
  );

  const handleReadStatusChange = useCallback(
    (value: NotificationReadFilter) => {
      setReadStatus(value);
      setPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setType("all");
    setReadStatus("all");
    setPage(1);
  }, []);

  const handleToggleRead = useCallback(
    async (notification: AdminNotification) => {
      const nextRead = !notification.read;
      const previousNotifications = notifications;
      const previousUnreadCount = unreadCount;

      setActionError("");

      // Optimistic update.
      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? { ...item, read: nextRead }
            : item
        )
      );

      setUnreadCount((current) =>
        Math.max(
          0,
          current + (nextRead ? -1 : 1)
        )
      );

      try {
        const response = await fetch(
          `/api/notifications/${encodeURIComponent(
            notification._id
          )}`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              read: nextRead,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to update notification."
          );
        }

        // Refetch so read-only/unread-only filters stay accurate.
        refresh();
      } catch (toggleError) {
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);

        setActionError(
          toggleError instanceof Error
            ? toggleError.message
            : "Unable to update notification."
        );
      }
    },
    [notifications, unreadCount, refresh]
  );

  const handleDelete = useCallback(
    async (notification: AdminNotification) => {
      setActionError("");

      const previousNotifications = notifications;
      const previousTotal = total;
      const previousUnreadCount = unreadCount;

      setNotifications((current) =>
        current.filter(
          (item) => item._id !== notification._id
        )
      );

      setTotal((current) => Math.max(0, current - 1));

      if (!notification.read) {
        setUnreadCount((current) =>
          Math.max(0, current - 1)
        );
      }

      try {
        const response = await fetch(
          `/api/notifications/${encodeURIComponent(
            notification._id
          )}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to delete notification."
          );
        }

        refresh();
      } catch (deleteError) {
        setNotifications(previousNotifications);
        setTotal(previousTotal);
        setUnreadCount(previousUnreadCount);

        setActionError(
          deleteError instanceof Error
            ? deleteError.message
            : "Unable to delete notification."
        );
      }
    },
    [notifications, total, unreadCount, refresh]
  );

  const handleMarkAllRead = useCallback(async () => {
    if (unreadCount === 0 || actionLoading) return;

    setActionLoading("read-all");
    setActionError("");

    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        read: true,
        readAt: item.readAt ?? new Date().toISOString(),
      }))
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
          data.error || "Unable to mark all as read."
        );
      }

      refresh();
    } catch (readError) {
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);

      setActionError(
        readError instanceof Error
          ? readError.message
          : "Unable to mark all as read."
      );
    } finally {
      setActionLoading(null);
    }
  }, [
    unreadCount,
    actionLoading,
    notifications,
    refresh,
  ]);

  const handleClearAll = useCallback(async () => {
    if (actionLoading || notifications.length === 0) return;

    const confirmed = window.confirm(
      "Delete all your notifications? This action cannot be undone."
    );

    if (!confirmed) return;

    setActionLoading("clear-all");
    setActionError("");

    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to clear notifications."
        );
      }

      setNotifications([]);
      setTotal(0);
      setTotalPages(1);
      setPage(1);
      setUnreadCount(0);

      refresh();
    } catch (clearError) {
      setActionError(
        clearError instanceof Error
          ? clearError.message
          : "Unable to clear notifications."
      );
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading, notifications.length, refresh]);

  const handleOpen = useCallback(
    async (notification: AdminNotification) => {
      // Mark the item read before navigating.
      if (!notification.read) {
        await handleToggleRead(notification);
      }

      const href = notification.href?.trim();

      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("//")
      ) {
        router.push(href);
      }
    },
    [handleToggleRead, router]
  );

  return (
    <main className="mx-auto w-full max-w-[1200px] space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700">
            <Bell size={17} strokeWidth={1.7} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-neutral-950">
                Notifications
              </h1>

              {unreadCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1.5 text-[10px] font-semibold tabular-nums text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-neutral-500">
              Stay updated on important changes and activities.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || actionLoading !== null}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {actionLoading === "read-all" ? (
              <LoaderCircle size={13} className="animate-spin" />
            ) : (
              <CheckCheck size={14} />
            )}

            Mark all as read
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            disabled={total === 0 || actionLoading !== null}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {actionLoading === "clear-all" ? (
              <LoaderCircle size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}

            Clear all
          </button>
        </div>
      </header>

      {actionError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3"
        >
          <p className="text-xs leading-5 text-red-700">
            {actionError}
          </p>

          <button
            type="button"
            onClick={() => setActionError("")}
            aria-label="Dismiss error"
            className="shrink-0 text-xs text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      <section className="rounded-lg border border-neutral-200 bg-white p-4 sm:p-5">
        <NotificationFilters
          type={type}
          readStatus={readStatus}
          onTypeChange={handleTypeChange}
          onReadStatusChange={handleReadStatusChange}
          onReset={resetFilters}
        />
      </section>

      <NotificationList
        notifications={notifications}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        total={total}
        onOpen={handleOpen}
        onToggleRead={handleToggleRead}
        onDelete={handleDelete}
        onPageChange={setPage}
        onRetry={() => {
          void loadUnreadCount();
          refresh();
        }}
      />
    </main>
  );
}
