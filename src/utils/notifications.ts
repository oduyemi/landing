
import mongoose, { Types } from "mongoose";
import Notification from "@/models/notification.model";

interface CreateMessageNotificationParams {
  recipient: Types.ObjectId;
  actor: Types.ObjectId;
  project: Types.ObjectId;
  message: Types.ObjectId;
  projectTitle: string;
  actorName: string;
  threadId: string;
}

export async function createMessageNotification({
  recipient,
  actor,
  project,
  message,
  projectTitle,
  actorName,
  threadId,
}: CreateMessageNotificationParams) {
  if (
    recipient.toString() === actor.toString()
  ) {
    return null;
  }

  return Notification.create({
    recipient,
    actor,
    project,
    message,
    type: "message",
    action: "received",
    title: `New message from ${actorName}`,
    description: `You received a new message in ${projectTitle}.`,
    href:
      `/client/messages?project=${project.toString()}` +
      `&thread=${encodeURIComponent(threadId)}`,
    read: false,
    readAt: null,
  });
}

/**
 * Creates a notification for general project activity.
 * Use this helper from task, file, and project API routes.
 */
interface CreateActivityNotificationParams {
  recipient: Types.ObjectId;
  actor?: Types.ObjectId | null;
  project?: Types.ObjectId | null;
  task?: Types.ObjectId | null;
  file?: Types.ObjectId | null;
  type:
    | "task"
    | "message"
    | "file"
    | "project"
    | "deliverable"
    | "milestone"
    | "system";
  action:
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
  title: string;
  description?: string;
  href?: string;
}

export async function createActivityNotification({
  recipient,
  actor,
  project,
  task,
  file,
  type,
  action,
  title,
  description = "",
  href,
}: CreateActivityNotificationParams) {
  if (
    actor &&
    recipient.toString() === actor.toString()
  ) {
    return null;
  }

  return Notification.create({
    recipient,
    actor: actor ?? null,
    project: project ?? null,
    task: task ?? null,
    file: file ?? null,
    type,
    action,
    title: title.trim(),
    description: description.trim(),
    href: href ?? null,
    read: false,
    readAt: null,
  });
}
