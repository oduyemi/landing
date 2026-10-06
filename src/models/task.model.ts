import mongoose, {Schema, Document, Types} from "mongoose";
  

export type TaskStatus =
    | "Pending"
    | "In Progress"
    | "Completed"
    | "On Hold"
    | "Cancelled";
  
export type TaskPriority =
    | "Low"
    | "Medium"
    | "High"
    | "Urgent";
  
export type TaskAssignee =
    | "client"
    | "admin";
  
export interface ITask extends Document {
    _id: Types.ObjectId;
    project: Types.ObjectId;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedTo: TaskAssignee;
    assignedUser?: Types.ObjectId;
    dueDate?: Date;
    completedAt?: Date;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  }
  
  const TaskSchema = new Schema<ITask>(
    {
      project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true,
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
  
      status: {
        type: String,
        enum: [
          "Pending",
          "In Progress",
          "Completed",
          "On Hold",
          "Cancelled",
        ],
        default: "Pending",
        required: true,
        index: true,
      },
  
      priority: {
        type: String,
        enum: [
          "Low",
          "Medium",
          "High",
          "Urgent",
        ],
        default: "Medium",
        required: true,
      },
  
      assignedTo: {
        type: String,
        enum: ["client", "admin"],
        required: true,
        default: "client",
        index: true,
      },
  
      assignedUser: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
  
      dueDate: {
        type: Date,
        default: null,
      },
  
      completedAt: {
        type: Date,
        default: null,
      },
  
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );
  
  /**
   * Common project task queries.
   */
  TaskSchema.index({
    project: 1,
    status: 1,
  });
  
  TaskSchema.index({
    project: 1,
    assignedTo: 1,
  });
  
  TaskSchema.index({
    project: 1,
    dueDate: 1,
  });
  
  const Task =
    mongoose.models.Task ||
    mongoose.model<ITask>(
      "Task",
      TaskSchema
    );
  
  export default Task;