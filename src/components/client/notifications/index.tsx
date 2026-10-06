"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
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

const initialNotifications: ClientNotification[] = [
  {
    id: "notification-1",
    type: "file",
    action: "uploaded",
    title: "Yemi uploaded homepage-v3.png",
    description: "00",
    actor: {
      id: "admin-1",
      name: "Yemi",
    },
    projectId: "global-crossfire",
    fileId: "homepage-v3",
    read: false,
    createdAt: "2 hours ago",
  },

  {
    id: "notification-2",
    type: "message",
    action: "received",
    title: "You have a new message",
    description: "00",
    actor: {
      id: "admin-1",
      name: "Yemi",
    },
    projectId: "global-crossfire",
    messageId: "message-1",
    read: false,
    createdAt: "5 hours ago",
  },

  {
    id: "notification-3",
    type: "task",
    action: "assigned",
    title: "Task assigned: Provide final staff photos",
    description: "00",
    actor: {
      id: "admin-1",
      name: "Yemi",
    },
    projectId: "global-crossfire",
    taskId: "staff-photographs",
    read: false,
    createdAt: "1 day ago",
  },

  {
    id: "notification-4",
    type: "project",
    action: "status_changed",
    title: "Project moved to Client Review",
    description: "00",
    actor: {
      id: "admin-1",
      name: "Yemi",
    },
    projectId: "global-crossfire",
    read: true,
    createdAt: "1 day ago",
  },

  {
    id: "notification-5",
    type: "deliverable",
    action: "approved",
    title: "Yemi requested your approval",
    description: "00",
    actor: {
      id: "admin-1",
      name: "Yemi",
    },
    projectId: "global-crossfire",
    read: true,
    createdAt: "2 days ago",
  },

  {
    id: "notification-6",
    type: "message",
    action: "received",
    title: "New message from Yemi",
    description: "00",
    actor: {
      id: "admin-1",
      name: "Yemi",
    },
    projectId: "global-crossfire",
    messageId: "message-2",
    read: true,
    createdAt: "3 days ago",
  },
];

export const NotificationsDashboard = () => {
  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.read
      ).length,
    [notifications]
  );

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const markAsRead = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  };

  return (
    <section className="w-full bg-[#fafafa]">
      <motion.div
        initial={{
          opacity: 0,
          y: 6,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-full"
      >
        <NotificationHeader
          unreadCount={unreadCount}
          onMarkAllAsRead={markAllAsRead}
        />

        <NotificationList
          notifications={notifications}
          onMarkAsRead={markAsRead}
        />
      </motion.div>
    </section>
  );
};