import type { LucideIcon } from "lucide-react";
import {File, FileImage, FileText, FolderArchive} from "lucide-react";


export type ApiFileCategory = "image" | "brand-asset" | "deliverable";
export type BrandAssetType = "logo" | "icon" | "favicon" | "other";

export type FileFilter =
  | "All Files"
  | "Client Uploads"
  | "Brand Assets"
  | "Deliverables";

export interface ProjectOption {
  _id: string;
  title: string;
  type?: string;
  status?: string;
  image?: string | null;
}

export interface ClientFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  category: ApiFileCategory;
  assetType?: BrandAssetType;
  mimeType: string;
  extension: string;
  size: number;
  description: string;
  order: number;
  createdAt: string;
  projectId: string;
  projectTitle: string;
  uploadedByName?: string;
}

export const filters: FileFilter[] = [
  "All Files",
  "Client Uploads",
  "Brand Assets",
  "Deliverables",
];

export function getFileIcon(file: ClientFile): LucideIcon {
  if (file.category === "image" || file.mimeType.startsWith("image/")) {
    return FileImage;
  }

  if (
    ["zip", "rar", "7z", "tar", "gz"].includes(
      file.extension.toLowerCase()
    )
  ) {
    return FolderArchive;
  }

  if (
    [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "txt",
      "csv",
    ].includes(file.extension.toLowerCase())
  ) {
    return FileText;
  }

  return File;
}

export function getCategoryLabel(category: ApiFileCategory): string {
  switch (category) {
    case "image":
      return "Client Uploads";
    case "brand-asset":
      return "Brand Assets";
    case "deliverable":
      return "Deliverables";
  }
}

export function matchesFilter(
  file: ClientFile,
  filter: FileFilter
): boolean {
  if (filter === "All Files") return true;

  if (filter === "Client Uploads") {
    return file.category === "image";
  }

  if (filter === "Brand Assets") {
    return file.category === "brand-asset";
  }

  return file.category === "deliverable";
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

export function formatFileDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function normalizeProject(value: unknown): ProjectOption | null {
  if (!value || typeof value !== "object") return null;

  const project = value as Record<string, unknown>;
  const id = String(project._id ?? project.id ?? "");

  if (!id) return null;

  return {
    _id: id,
    title: String(project.title ?? "Untitled project"),
    type: typeof project.type === "string" ? project.type : undefined,
    status:
      typeof project.status === "string" ? project.status : undefined,
    image:
      typeof project.image === "string" ? project.image : null,
  };
}

export function normalizeFile(value: unknown): ClientFile | null {
  if (!value || typeof value !== "object") return null;

  const file = value as Record<string, unknown>;
  const projectValue = file.project;
  const project =
    projectValue && typeof projectValue === "object"
      ? (projectValue as Record<string, unknown>)
      : null;

  const uploaderValue = file.uploadedBy;
  const uploader =
    uploaderValue && typeof uploaderValue === "object"
      ? (uploaderValue as Record<string, unknown>)
      : null;

  const id = String(file._id ?? file.id ?? "");
  const category = file.category as ApiFileCategory;

  if (
    !id ||
    !["image", "brand-asset", "deliverable"].includes(category)
  ) {
    return null;
  }

  const name = String(file.name ?? file.originalName ?? "Untitled file");
  const originalName = String(file.originalName ?? name);
  const mimeType = String(file.mimeType ?? "");
  const extension = String(
    file.extension ?? name.split(".").pop() ?? ""
  ).toLowerCase();

  const uploaderName = uploader
    ? [uploader.fname, uploader.lname]
        .filter((part) => typeof part === "string" && part.trim())
        .join(" ")
    : "";

  return {
    id,
    name,
    originalName,
    url: String(file.url ?? ""),
    category,
    assetType: [
      "logo",
      "icon",
      "favicon",
      "other",
    ].includes(String(file.assetType))
      ? (file.assetType as BrandAssetType)
      : undefined,
    mimeType,
    extension,
    size: Number(file.size ?? 0),
    description: String(file.description ?? ""),
    order: Number(file.order ?? 0),
    createdAt: String(file.createdAt ?? ""),
    projectId: String(
      project?._id ?? projectValue ?? file.projectId ?? ""
    ),
    projectTitle: String(project?.title ?? ""),
    uploadedByName: uploaderName || undefined,
  };
}

export function getApiError(
  payload: unknown,
  fallback: string
): string {
  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;

    if (typeof data.error === "string") return data.error;
    if (typeof data.message === "string") return data.message;
  }

  return fallback;
}