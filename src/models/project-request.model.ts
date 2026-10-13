import mongoose, { Document, Schema, Types } from "mongoose";

export type ProjectRequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected";

export interface IProjectRequest extends Document {
  _id: Types.ObjectId;
  title: string;
  type: string;
  description: string;
  preferredStartDate?: Date;
  preferredDeadline?: Date;
  requester: Types.ObjectId;
  assignedAdmin: Types.ObjectId;
  status: ProjectRequestStatus;
  adminNote: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectRequestSchema = new Schema<IProjectRequest>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    preferredStartDate: Date,
    preferredDeadline: Date,
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedAdmin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      required: true,
      index: true,
    },
    adminNote: {
      type: String,
      trim: true,
      default: "",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

projectRequestSchema.index({ assignedAdmin: 1, status: 1, createdAt: -1 });
projectRequestSchema.index({ requester: 1, createdAt: -1 });

const ProjectRequest =
  mongoose.models.ProjectRequest ||
  mongoose.model<IProjectRequest>(
    "ProjectRequest",
    projectRequestSchema
  );

export default ProjectRequest;