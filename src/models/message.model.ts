import mongoose, {Schema, Document, Types} from "mongoose";
  

export interface IMessage extends Document {
    _id: Types.ObjectId;
    project: Types.ObjectId;
    task?: Types.ObjectId;
    threadId: string;
    sender: Types.ObjectId;
    recipient: Types.ObjectId;
    content: string;
    read: boolean;
    readAt?: Date;
    replyTo?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
  
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
        ref: "ProjectTask",
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
        required: true,
        trim: true,
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
  
const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);
export default Message;