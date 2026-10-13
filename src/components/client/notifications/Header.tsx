"use client";
import { CheckCheck, LoaderCircle } from "lucide-react";


interface NotificationHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void | Promise<void>;
  markingAll?: boolean;
}

export const NotificationHeader = ({
  unreadCount,
  onMarkAllAsRead,
  markingAll = false,
}: NotificationHeaderProps) => {
  const canMarkAll = unreadCount > 0 && !markingAll;
  return (
    <header className="flex items-center justify-between border-b border-neutral-200 px-1 pb-4">
      <div className="pt-10">
        <h1 className="text-[13px] font-semibold tracking-[-0.025em] text-black sm:text-[14px]">
          Notifications
        </h1>

        <p className="mt-1 text-[7px] text-neutral-400">
          {unreadCount} unread{" "}
          {unreadCount === 1 ? "notification" : "notifications"}
        </p>
      </div>

      <button
        type="button"
        onClick={() => void onMarkAllAsRead()}
        disabled={!canMarkAll}
        className={[
          "flex items-center gap-1.5 text-[7px] font-medium transition-colors",
          canMarkAll
            ? "text-neutral-500 hover:text-black"
            : "cursor-default text-neutral-300",
        ].join(" ")}
      >
        {markingAll ? (
          <LoaderCircle
            size={10}
            strokeWidth={1.6}
            className="animate-spin"
          />
        ) : (
          <CheckCheck size={10} strokeWidth={1.6} />
        )}

        {markingAll ? "Updating..." : "Mark all as read"}
      </button>
    </header>
  );
};
