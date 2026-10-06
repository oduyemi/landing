import type { LucideIcon } from "lucide-react";
import {
  FileImage,
  FileText,
  File,
  FolderArchive,
} from "lucide-react";

export type FileCategory = "Client Uploads" | "Deliverables";

export interface ClientFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  category: FileCategory;
  icon: LucideIcon;
}

export const files: ClientFile[] = [
  {
    id: "logo",
    name: "logo.png",
    type: "Image",
    size: "2.4 MB",
    uploadedAt: "Sep 20, 2026",
    category: "Client Uploads",
    icon: FileImage,
  },
  {
    id: "staff-photos",
    name: "staff-photos.zip",
    type: "ZIP",
    size: "12.4 MB",
    uploadedAt: "Sep 20, 2026",
    category: "Client Uploads",
    icon: FolderArchive,
  },
  {
    id: "product-catalogue",
    name: "product-catalogue.pdf",
    type: "PDF",
    size: "8.6 MB",
    uploadedAt: "Sep 24, 2026",
    category: "Client Uploads",
    icon: FileText,
  },
  {
    id: "homepage",
    name: "homepage-v2.png",
    type: "Image",
    size: "3.2 MB",
    uploadedAt: "Sep 26, 2026",
    category: "Deliverables",
    icon: FileImage,
  },
  {
    id: "website-content",
    name: "website-content.pdf",
    type: "PDF",
    size: "1.1 MB",
    uploadedAt: "Sep 25, 2026",
    category: "Deliverables",
    icon: FileText,
  },
];