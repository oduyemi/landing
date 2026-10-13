"use client";
import { AnimatePresence } from "framer-motion";
import { NotificationRow } from "./Row";
import type { ClientNotification } from "./index";



interface NotificationListProps {
  notifications: ClientNotification[];
  onNotificationClick: (
    notification: ClientNotification
  ) => void | Promise<void>;
}



export const NotificationList = ({
  notifications,
  onNotificationClick,
}: NotificationListProps) => {
  if (!notifications.length) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white">
            <span className="text-neutral-400">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
            </span>
          </div>

          <p className="text-[10px] font-medium text-black">
            No notifications
          </p>

          <p className="mt-1 text-[7px] text-neutral-400">
            You're all caught up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-100">
      <AnimatePresence initial={false}>
        {notifications.map((notification) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            onClick={onNotificationClick}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
