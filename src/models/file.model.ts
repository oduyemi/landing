import mongoose, {Schema, Document, Types} from "mongoose";
  
export type FileCategory =
    | "image"
    | "brand-asset"
    | "deliverable";
  
export type BrandAssetType =
    | "logo"
    | "icon"
    | "favicon"
    | "other";
  
export interface IFile extends Document {
    _id: Types.ObjectId;
    project: Types.ObjectId;
    name: string;
    originalName: string;
    url: string;
    publicId?: string;
    category: FileCategory;
    assetType?: BrandAssetType;
    mimeType: string;
    extension: string;
    size: number;
    description?: string;
    order: number;
    uploadedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
  
const FileSchema = new Schema<IFile>({
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true,
    },
  
    name: {
    type: String,
    required: true,
    trim: true,
    },

    originalName: {
    type: String,
    required: true,
    trim: true,
    },

    url: {
    type: String,
    required: true,
    trim: true,
    },

    publicId: {
    type: String,
    trim: true,
    default: null,
    },

    category: {
    type: String,
    enum: [
        "image",
        "brand-asset",
        "deliverable",
    ],
    required: true,
    index: true,
    },

    assetType: {
    type: String,
    enum: [
        "logo",
        "icon",
        "favicon",
        "other",
    ],
    default: null,
    },

    mimeType: {
    type: String,
    required: true,
    trim: true,
    },

    extension: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    },

    size: {
    type: Number,
    required: true,
    min: 0,
    },

    description: {
    type: String,
    trim: true,
    default: "",
    },

    order: {
    type: Number,
    default: 0,
    min: 0,
    },

    uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    },
    },
    {
      timestamps: true,
    }
);
  
FileSchema.index({
    project: 1,
    category: 1,
    order: 1,
});
  
FileSchema.index({
    project: 1,
    createdAt: -1,
});
  
const File = mongoose.models.File || mongoose.model<IFile>("File", FileSchema);
export default File;