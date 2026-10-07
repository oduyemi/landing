import Notification from "@/models/notification.model";
import { Types } from "mongoose";

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
  });
}