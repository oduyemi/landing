"use client";
import { CheckCheck } from "lucide-react";

interface NotificationHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export const NotificationHeader = ({
  unreadCount,
  onMarkAllAsRead,
}: NotificationHeaderProps) => {
  return (
    <header className="flex items-center justify-between border-b border-neutral-200 px-1 pb-4">
      <div className="pt-10">
        <h1 className="text-[13px] font-semibold tracking-[-0.025em] text-black sm:text-[14px]">
          Notifications
        </h1>

        {unreadCount > 0 && (
          <p className="mt-1 text-[7px] text-neutral-400">
            {unreadCount} unread{" "}
            {unreadCount === 1
              ? "notification"
              : "notifications"}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onMarkAllAsRead}
        disabled={!unreadCount}
        className={[
          "flex items-center gap-1.5 text-[7px] font-medium transition-colors",
          unreadCount
            ? "text-neutral-500 hover:text-black"
            : "cursor-default text-neutral-300",
        ].join(" ")}
      >
        <CheckCheck
          size={10}
          strokeWidth={1.6}
        />

        Mark all as read
      </button>
    </header>
  );
};