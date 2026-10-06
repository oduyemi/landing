import mongoose, {Schema, Document, Types} from "mongoose";
  

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
  
export interface INotification extends Document {
    _id: Types.ObjectId;
    recipient: Types.ObjectId;
    actor?: Types.ObjectId;
    project?: Types.ObjectId;
    task?: Types.ObjectId;
    message?: Types.ObjectId;
    file?: Types.ObjectId;
    type: NotificationType;
    action: NotificationAction;
    title: string;
    description?: string;
    href?: string;
    read: boolean;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
  
const notificationSchema = new Schema<INotification>(
    {
        recipient: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
          index: true,
        },
  
        actor: {
          type: Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
  
        project: {
          type: Schema.Types.ObjectId,
          ref: "Project",
          default: null,
          index: true,
        },
  
        task: {
          type: Schema.Types.ObjectId,
          ref: "ProjectTask",
          default: null,
        },
  
        message: {
          type: Schema.Types.ObjectId,
          ref: "Message",
          default: null,
        },
  
        file: {
          type: Schema.Types.ObjectId,
          ref: "ProjectFile",
          default: null,
        },
  
        type: {
          type: String,
          enum: [
            "task",
            "message",
            "file",
            "project",
            "deliverable",
            "milestone",
            "system",
          ],
          required: true,
          index: true,
        },
  
        action: {
          type: String,
          enum: [
            "created",
            "assigned",
            "updated",
            "completed",
            "uploaded",
            "received",
            "approved",
            "mentioned",
            "status_changed",
            "deadline_approaching",
            "deadline_reached",
          ],
          required: true,
        },
  
        title: {
          type: String,
          required: true,
          trim: true,
        },
  
        description: {
          type: String,
          trim: true,
          default: "",
        },
  
        href: {
          type: String,
          trim: true,
          default: null,
        },
  
        read: {
          type: Boolean,
          default: false,
          index: true,
        },
  
        readAt: {
          type: Date,
          default: null,
        },
      },
      {
        timestamps: true,
    }
);
  
notificationSchema.index({
    recipient: 1,
    createdAt: -1,
});
  
notificationSchema.index({
    recipient: 1,
    read: 1,
    createdAt: -1,
});
  
notificationSchema.index({
    recipient: 1,
    project: 1,
    createdAt: -1,
});
  
const Notification = mongoose.models.Notification || mongoose.model<INotification>("Notification", notificationSchema);
export default Notification;