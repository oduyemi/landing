import mongoose, { Schema, Document, Types } from "mongoose";


export interface IMessageAttachment {
  url: string;
  publicId: string;
  name: string;
  type: string;
  size: number;
  resourceType: "image" | "raw";
}


export interface IMessage extends Document {
  _id: Types.ObjectId;
  project: Types.ObjectId;
  task?: Types.ObjectId;
  threadId: string;
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  content: string;
  attachments?: IMessageAttachment[];
  read: boolean;
  readAt?: Date;
  replyTo?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageAttachmentSchema = new Schema<IMessageAttachment>(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    size: {
      type: Number,
      required: true,
      min: 0,
    },

    resourceType: {
      type: String,
      enum: ["image", "raw"],
      required: true,
    },
  },
  {
    _id: false,
  }
);

const messageSchema = new Schema<IMessage>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
      index: true,
    },

    threadId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    content: {
      type: String,
      default: "",
      trim: true,
    },

    attachments: {
      type: [messageAttachmentSchema],
      default: undefined,
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

    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({
  threadId: 1,
  createdAt: 1,
});

messageSchema.index({
  project: 1,
  createdAt: -1,
});

messageSchema.index({
  project: 1,
  task: 1,
  createdAt: 1,
});

messageSchema.index({
  recipient: 1,
  read: 1,
  createdAt: -1,
});

messageSchema.index({
  sender: 1,
  recipient: 1,
  createdAt: -1,
});

const Message =
  mongoose.models.Message ||
  mongoose.model<IMessage>(
    "Message",
    messageSchema
  );

export default Message;
