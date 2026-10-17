
"use client";
import { Bell, ChevronLeft, ChevronRight, LoaderCircle, RefreshCw } from "lucide-react";
import { NotificationItem, type AdminNotification } from "./Item";

interface NotificationListProps {
  notifications: AdminNotification[];
  loading: boolean;
  error: string;
  page: number;
  totalPages: number;
  total: number;
  onOpen: (notification: AdminNotification) => void;
  onToggleRead: (notification: AdminNotification) => void;
  onDelete: (notification: AdminNotification) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

export const NotificationList = ({
  notifications,
  loading,
  error,
  page,
  totalPages,
  total,
  onOpen,
  onToggleRead,
  onDelete,
  onPageChange,
  onRetry,
}: NotificationListProps) => {
  const start =
    total === 0 ? 0 : (page - 1) * 20 + 1;

  const end = Math.min(page * 20, total);

  return (
    <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 sm:px-5">
        <div>
          <h2 className="text-xs font-semibold text-neutral-900">
            Recent activity
          </h2>
          <p className="mt-0.5 text-[11px] text-neutral-500">
            Notifications and updates from your workspace
          </p>
        </div>

        <span className="text-[11px] tabular-nums text-neutral-400">
          {loading ? "Loading..." : `${total} total`}
        </span>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Bell size={17} />
          </div>

          <h3 className="mt-3 text-sm font-medium text-neutral-900">
            Could not load notifications
          </h3>

          <p className="mt-1 max-w-sm text-xs leading-5 text-neutral-500">
            {error}
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-neutral-200 px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            <RefreshCw size={13} />
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="divide-y divide-neutral-100">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex animate-pulse items-start gap-3 px-4 py-4 sm:px-5"
            >
              <div className="h-8 w-8 shrink-0 rounded-full bg-neutral-100" />

              <div className="min-w-0 flex-1 space-y-2 pt-1">
                <div className="h-3 w-2/5 rounded bg-neutral-100" />
                <div className="h-2.5 w-4/5 rounded bg-neutral-100" />
              </div>

              <div className="h-2.5 w-10 rounded bg-neutral-100" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-400">
            <Bell size={19} strokeWidth={1.6} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-neutral-900">
            You're all caught up
          </h3>

          <p className="mt-1 max-w-xs text-xs leading-5 text-neutral-500">
            There are no notifications matching your current filters.
            New project updates will appear here.
          </p>
        </div>
      ) : (
        <>
          <div>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onOpen={onOpen}
                onToggleRead={onToggleRead}
                onDelete={onDelete}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-neutral-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-[11px] text-neutral-500">
              Showing{" "}
              <span className="font-medium text-neutral-700">
                {start}–{end}
              </span>{" "}
              of{" "}
              <span className="font-medium text-neutral-700">
                {total}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                aria-label="Previous page"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>

              <span className="min-w-20 text-center text-[11px] tabular-nums text-neutral-500">
                Page {page} of {Math.max(1, totalPages)}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                aria-label="Next page"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 border-t border-neutral-100 py-2 text-[10px] text-neutral-400">
          <LoaderCircle size={12} className="animate-spin" />
          Updating notifications
        </div>
      )}
    </section>
  );
}
