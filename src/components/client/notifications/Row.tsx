"use client";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  FileUp,
  MessageCircle,
  Milestone,
  Settings,
  SquareCheck,
} from "lucide-react";
import type { ClientNotification } from "./index";

interface NotificationRowProps {
  notification: ClientNotification;
  onMarkAsRead: (id: string) => void;
}

const getNotificationIcon = (
  notification: ClientNotification
) => {
  const iconProps = {
    size: 10,
    strokeWidth: 1.7,
  };

  switch (notification.type) {
    case "file":
      return <FileUp {...iconProps} />;

    case "message":
      return <MessageCircle {...iconProps} />;

    case "task":
      return <SquareCheck {...iconProps} />;

    case "deliverable":
      return <CheckCircle2 {...iconProps} />;

    case "milestone":
      return <Milestone {...iconProps} />;

    case "system":
      return <Settings {...iconProps} />;

    case "project":
    default:
      return <Bell {...iconProps} />;
  }
};

export const NotificationRow = ({
  notification,
  onMarkAsRead,
}: NotificationRowProps) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    if (notification.href) {
      window.location.href =
        notification.href;
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      initial={{
        opacity: 0,
        y: 4,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -4,
      }}
      transition={{
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        backgroundColor: "rgba(250,250,250,0.8)",
      }}
      className="group flex w-full items-center gap-3 px-1 py-4 text-left transition-colors"
    >
      {/* Notification icon */}
      <div
        className={[
          "relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
          notification.read
            ? "border-neutral-200 bg-white text-neutral-500"
            : "border-neutral-300 bg-neutral-100 text-black",
        ].join(" ")}
      >
        {getNotificationIcon(notification)}

        {!notification.read && (
          <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-black ring-2 ring-white" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={[
            "truncate text-[10px]",
            notification.read
              ? "font-medium text-neutral-600"
              : "font-semibold text-black",
          ].join(" ")}
        >
          {notification.title}
        </p>

        {notification.description && (
          <p className="mt-1 truncate text-[6.5px] text-neutral-400">
            {notification.description}
          </p>
        )}
      </div>

      {/* Time */}
      <span className="shrink-0 text-[6.5px] text-neutral-400">
        {notification.createdAt}
      </span>

      {/* Arrow */}
      <ChevronRight
        size={10}
        strokeWidth={1.5}
        className="shrink-0 text-neutral-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-neutral-500"
      />
    </motion.button>
  );
};