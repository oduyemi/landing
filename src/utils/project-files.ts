import mongoose, { Types } from "mongoose";
import { randomUUID } from "node:crypto";
import Project from "@/models/project.model";
import FileModel from "@/models/file.model";
import User from "@/models/user.model";
import {uploadToCloudinary, deleteCloudinaryResource} from "@/utils/cloudinary";
import { createActivityNotification } from "@/utils/notifications";

export type FileCategory =
  | "image"
  | "brand-asset"
  | "deliverable";

export type BrandAssetType =
  | "logo"
  | "icon"
  | "favicon"
  | "other";

const IMAGE_EXTENSIONS = [
  "jpg", "jpeg", "png", "webp", "gif", "avif",
];

const BRAND_EXTENSIONS = [
  "svg", "ico", "png", "jpg", "jpeg",
];

const DELIVERABLE_EXTENSIONS = [
  "pdf", "zip", "doc", "docx", "xls", "xlsx",
  "ppt", "pptx", "txt", "csv", "json", "psd",
  "ai", "fig", "sketch", "mp4", "mov",
];

export const MAX_FILE_SIZE = 25 * 1024 * 1024;

export const FILE_LIMITS: Record<FileCategory, number> = {
  image: 100,
  "brand-asset": 15,
  deliverable: 10,
};

const ALLOWED_MIME_TYPES: Record<FileCategory, string[]> = {
  image: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ],
  "brand-asset": [
    "image/svg+xml",
    "image/x-icon",
    "image/vnd.microsoft.icon",
    "image/png",
    "image/jpeg",
  ],
  deliverable: [
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "application/json",
    "image/vnd.adobe.photoshop",
    "application/postscript",
    "video/mp4",
    "video/quicktime",
    "application/octet-stream",
  ],
};

type AuthorizedUser = {
  _id: Types.ObjectId;
  role: string;
};

export async function getAuthorizedProject(
  id: string,
  user: AuthorizedUser
) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return {
      project: null,
      status: 400,
      error: "Invalid project ID.",
    };
  }

  const project = await Project.findById(id);

  if (!project) {
    return {
      project: null,
      status: 404,
      error: "Project not found.",
    };
  }

  const isAdmin = user.role === "admin";
  const isClient =
    String(project.client) === String(user._id);

  if (!isAdmin && !isClient) {
    return {
      project: null,
      status: 403,
      error: "You do not have access to this project.",
    };
  }

  return {
    project,
    status: 200,
    error: null,
  };
}

export function validateFileUpload(
  file: globalThis.File,
  category: FileCategory,
  assetType?: BrandAssetType
): {
  error: string | null;
  extension?: string;
} {
  const originalName = file.name.trim();
  const extension =
    originalName.split(".").pop()?.toLowerCase() ?? "";

  if (
    !originalName ||
    !originalName.includes(".") ||
    !extension ||
    file.size <= 0
  ) {
    return {
      error: "Please select a valid, non-empty file.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      error: "Files must be 25 MB or smaller.",
    };
  }

  if (!["image", "brand-asset", "deliverable"].includes(category)) {
    return { error: "Invalid file category." };
  }

  if (
    category === "image" &&
    !IMAGE_EXTENSIONS.includes(extension)
  ) {
    return { error: "Unsupported image format." };
  }

  if (
    category === "brand-asset" &&
    !BRAND_EXTENSIONS.includes(extension)
  ) {
    return {
      error: "Brand assets must be SVG, ICO, PNG, JPG, or JPEG.",
    };
  }

  if (
    category === "deliverable" &&
    !DELIVERABLE_EXTENSIONS.includes(extension)
  ) {
    return {
      error: "This deliverable file format is not supported.",
    };
  }

  const validAssetTypes: BrandAssetType[] = [
    "logo",
    "icon",
    "favicon",
    "other",
  ];

  if (
    category === "brand-asset" &&
    (!assetType || !validAssetTypes.includes(assetType))
  ) {
    return { error: "Choose a valid brand asset type." };
  }

  if (category !== "brand-asset" && assetType) {
    return {
      error: "Asset type is only supported for brand assets.",
    };
  }

  const mimeType = file.type.trim().toLowerCase();
  const mimeIsAllowed =
    ALLOWED_MIME_TYPES[category].includes(mimeType) ||
    (category === "deliverable" &&
      (!mimeType || mimeType === "application/octet-stream"));

  if (!mimeIsAllowed) {
    return {
      error: "The file's content type is not supported for this category.",
    };
  }

  return {
    error: null,
    extension,
  };
}

export async function uploadProjectFile({
  projectId,
  userId,
  file,
  category,
  assetType,
  description = "",
}: {
  projectId: string;
  userId: Types.ObjectId;
  file: globalThis.File;
  category: FileCategory;
  assetType?: BrandAssetType;
  description?: string;
}) {
  const validation = validateFileUpload(
    file,
    category,
    assetType
  );

  if (validation.error || !validation.extension) {
    throw new Error(validation.error ?? "Invalid file.");
  }

  // Load the uploader's current role from the database rather than
  // relying on a role supplied by the request.
  const uploader = await User.findById(userId)
    .select("_id role")
    .lean();

  if (!uploader) {
    throw new Error("User not found.");
  }

  const authorization = await getAuthorizedProject(
    projectId,
    {
      _id: uploader._id as Types.ObjectId,
      role: uploader.role,
    }
  );

  if (!authorization.project) {
    throw new Error(authorization.error ?? "Project access denied.");
  }

  const project = authorization.project;

  if (uploader.role !== "admin" && uploader.role !== "user") {
    throw new Error("You are not permitted to upload files.");
  }

  if (!project.cloudinaryFolder) {
    throw new Error("The project does not have a Cloudinary folder.");
  }

  const existingCount = await FileModel.countDocuments({
    project: project._id,
    category,
  });

  const limit = FILE_LIMITS[category];

  if (existingCount >= limit) {
    throw new Error(
      `A project can contain a maximum of ${limit} ${
        category === "image"
          ? "images"
          : category === "brand-asset"
            ? "brand assets"
            : "deliverables"
      }.`
    );
  }

  const subfolder =
    category === "image"
      ? "media"
      : category === "brand-asset"
        ? "brand"
        : "others";

  const folder = `${project.cloudinaryFolder}/${subfolder}`;
  const resourceType =
    category === "deliverable" ? "raw" : "image";

  const originalName = file.name.trim();
  const buffer = Buffer.from(await file.arrayBuffer());

  // Unique IDs avoid collisions when two uploads have the same name.
  const baseName = originalName
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

  const publicId = `${baseName || "file"}-${randomUUID()}`;

  const uploaded = await uploadToCloudinary(buffer, {
    folder,
    publicId,
    resourceType,
    originalFilename: originalName,
  });

  let savedFile;

  try {
    savedFile = await FileModel.create({
      project: project._id,
      name: originalName,
      originalName,
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      category,
      ...(category === "brand-asset" ? { assetType } : {}),
      mimeType: file.type || "application/octet-stream",
      extension: validation.extension,
      size: file.size,
      description: description.trim().slice(0, 2000),
      order: existingCount,
      uploadedBy: userId,
    });
  } catch (error) {
    try {
      await deleteCloudinaryResource(
        uploaded.public_id,
        resourceType
      );
    } catch (cleanupError) {
      console.error(
        "Cloudinary cleanup failed:",
        cleanupError
      );
    }

    throw error;
  }

  // Notifications are best-effort: a notification failure must not
  // turn a successful file upload into a failed request.
  try {
    if (uploader.role === "admin") {
      await createActivityNotification({
        recipient: project.client,
        actor: userId,
        project: project._id,
        file: savedFile._id,
        type: category === "deliverable" ? "deliverable" : "file",
        action: "uploaded",
        title:
          category === "deliverable"
            ? "A deliverable is ready"
            : "A project file was uploaded",
        description: savedFile.name,
        href: `/client/files?project=${project._id}`,
      });
    } else {
      const admins = await User.find({ role: "admin" })
        .select("_id")
        .lean();

      await Promise.all(
        admins.map((admin) =>
          createActivityNotification({
            recipient: admin._id,
            actor: userId,
            project: project._id,
            file: savedFile._id,
            type: category === "deliverable" ? "deliverable" : "file",
            action: "uploaded",
            title: "A client uploaded a project file",
            description: `${project.title}: ${savedFile.name}`,
            href: `/admin/files?project=${project._id}`,
          }).catch((error) => {
            console.error("File notification failed:", error);
            return null;
          })
        )
      );
    }
  } catch (error) {
    console.error("File notification failed:", error);
  }

  return savedFile;
}

export async function deleteStoredFile(file: {
  publicId?: string | null;
  category: FileCategory;
}) {
  if (!file.publicId) return;

  const resourceType =
    file.category === "deliverable" ? "raw" : "image";

  await deleteCloudinaryResource(
    file.publicId,
    resourceType
  );
}