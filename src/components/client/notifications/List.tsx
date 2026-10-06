"use client";
import { AnimatePresence } from "framer-motion";
import { NotificationRow } from "./Row";
import type { ClientNotification } from "./index";

interface NotificationListProps {
  notifications: ClientNotification[];
  onMarkAsRead: (id: string) => void;
}

export const NotificationList = ({
  notifications,
  onMarkAsRead,
}: NotificationListProps) => {
  if (!notifications.length) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
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
            onMarkAsRead={onMarkAsRead}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};