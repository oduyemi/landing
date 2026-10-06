import mongoose, { Schema, Document, Types } from "mongoose";

export type ProjectStatus =
  | "Planning"
  | "In Progress"
  | "Completed"
  | "On Hold"
  | "Cancelled";

export interface IProject extends Document {
  _id: Types.ObjectId;
  title: string;
  type: string;
  image?: string;
  progress: number;
  status: ProjectStatus;
  startDate: Date;
  deadline: Date;
  description?: string;
  client: Types.ObjectId;

  /**
   * Root Cloudinary folder for this project.
   *
   * Example:
   * laguan
   *
   * Child folders:
   * laguan/media
   * laguan/brand
   * laguan/others
   */
  cloudinaryFolder: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: null,
      trim: true,
    },

    progress: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: [
        "Planning",
        "In Progress",
        "Completed",
        "On Hold",
        "Cancelled",
      ],
      default: "Planning",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    cloudinaryFolder: {
      type: String,
      required: true,
      trim: true,
      index: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({
  client: 1,
  createdAt: -1,
});

projectSchema.index({
  client: 1,
  status: 1,
});

const Project =  mongoose.models.Project || mongoose.model<IProject>("Project", projectSchema);
export default Project;