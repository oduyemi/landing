"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Download,
  ExternalLink,
  Eye,
  File,
  FileArchive,
  FileImage,
  FileText,
  FileVideo,
  Filter,
  Folder,
  HardDrive,
  LoaderCircle,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react";

type FileCategory = "image" | "brand-asset" | "deliverable";

type Person = {
  _id?: string;
  fname?: string;
  lname?: string;
  email?: string;
  image?: string;
  role?: string;
} | string | null;

type Project = {
  _id: string;
  title: string;
  type?: string;
  status?: string;
  client?: Person;
};

type ProjectFile = {
  _id: string;
  project: Project | string;
  name: string;
  originalName: string;
  url: string;
  publicId?: string | null;
  category: FileCategory;
  assetType?: "logo" | "icon" | "favicon" | "other" | null;
  mimeType: string;
  extension: string;
  size: number;
  description?: string;
  order: number;
  uploadedBy: Person;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success?: boolean;
  error?: string;
  files?: T[];
  file?: T;
  projects?: Project[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

const PAGE_SIZE = 10;

const CATEGORIES: {
  value: "all" | FileCategory;
  label: string;
}[] = [
  { value: "all", label: "All file types" },
  { value: "image", label: "Images" },
  { value: "brand-asset", label: "Brand assets" },
  { value: "deliverable", label: "Deliverables" },
];

function getId(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;

  if (typeof value === "object" && "_id" in value) {
    return String((value as { _id: unknown })._id ?? "");
  }

  return "";
}

function getPersonName(person: Person): string {
  if (!person) return "Unknown";
  if (typeof person === "string") return "Unknown";

  const name = [person.fname, person.lname]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || person.email || "Unknown";
}

function getProjectTitle(project: ProjectFile["project"]): string {
  if (!project) return "Unknown project";
  if (typeof project === "string") return "Project";

  return project.title || "Untitled project";
}

function getProjectId(project: ProjectFile["project"]): string {
  return getId(project);
}

function getFileType(file: ProjectFile): string {
  if (file.category === "brand-asset") {
    const assetType = file.assetType || "other";
    return `${assetType.charAt(0).toUpperCase()}${assetType.slice(1)}`;
  }

  if (file.category === "image") return "Image";
  return "Deliverable";
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  const size = bytes / Math.pow(1024, index);

  return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(date: string): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatDateTime(date: string): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function isImage(file: ProjectFile): boolean {
  return file.mimeType?.startsWith("image/") ?? false;
}

function isPdf(file: ProjectFile): boolean {
  return (
    file.mimeType === "application/pdf" ||
    file.extension?.toLowerCase() === "pdf"
  );
}

function isVideo(file: ProjectFile): boolean {
  return file.mimeType?.startsWith("video/") ?? false;
}

function getFileIcon(file: ProjectFile) {
  if (isImage(file)) return FileImage;
  if (isPdf(file)) return FileText;
  if (isVideo(file)) return FileVideo;

  if (
    file.mimeType?.includes("zip") ||
    file.mimeType?.includes("compressed") ||
    ["zip", "rar", "7z", "tar", "gz"].includes(
      file.extension?.toLowerCase()
    )
  ) {
    return FileArchive;
  }

  return File;
}

function getCategoryLabel(category: FileCategory): string {
  switch (category) {
    case "image":
      return "Image";
    case "brand-asset":
      return "Brand asset";
    case "deliverable":
      return "Deliverable";
  }
}

function personInitials(person: Person): string {
  const name = getPersonName(person);

  if (name === "Unknown") return "?";

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function Avatar({
  person,
  small = false,
}: {
  person: Person;
  small?: boolean;
}) {
  const name = getPersonName(person);
  const image =
    person && typeof person !== "string" ? person.image : undefined;

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/[0.06] bg-neutral-100 font-medium text-neutral-600 ${
        small ? "size-7 text-[9px]" : "size-9 text-[11px]"
      }`}
      title={name}
    >
      {image ? (
        // The image URL comes from the existing populated user response.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={name}
          className="size-full object-cover"
        />
      ) : (
        personInitials(person)
      )}
    </span>
  );
}

function FileThumbnail({ file }: { file: ProjectFile }) {
  const Icon = getFileIcon(file);

  if (isImage(file)) {
    return (
      <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/[0.06] bg-neutral-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={file.url}
          alt={file.name}
          loading="lazy"
          className="size-full object-cover"
        />
      </div>
    );
  }

  const color =
    isPdf(file)
      ? "text-red-600"
      : isVideo(file)
        ? "text-violet-600"
        : "text-neutral-700";

  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-black/[0.06] bg-neutral-50">
      <Icon className={`size-5 ${color}`} strokeWidth={1.6} />
    </div>
  );
}

function CategoryBadge({ file }: { file: ProjectFile }) {
  return (
    <span className="inline-flex items-center rounded-md border border-black/[0.07] bg-neutral-50 px-2 py-1 text-[10px] font-medium text-neutral-600">
      {getFileType(file)}
    </span>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-[11px] font-medium text-neutral-600">
        {label}
      </span>
      {children}
    </label>
  );
}

const selectClass =
  "h-10 w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 pr-9 text-xs text-neutral-800 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-black/[0.04]";

const inputClass =
  "h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-xs text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-black/[0.04]";

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={selectClass}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-neutral-500" />
    </div>
  );
}

function FileDetailsDrawer({
  file,
  onClose,
  onDownload,
  downloading,
}: {
  file: ProjectFile;
  onClose: () => void;
  onDownload: (file: ProjectFile) => void;
  downloading: boolean;
}) {
  const project =
    typeof file.project === "object" ? file.project : undefined;

  const canPreview = isImage(file) || isPdf(file) || isVideo(file);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-neutral-950/35 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="File details"
        className="flex h-full w-full max-w-[560px] flex-col overflow-y-auto border-l border-neutral-200 bg-white shadow-[-24px_0_80px_rgba(0,0,0,0.12)]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white px-5 py-4 sm:px-7">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 transition hover:bg-neutral-100"
              aria-label="Close file details"
            >
              <ArrowLeft className="size-4" />
            </button>
            <span>Admin</span>
            <span>/</span>
            <span>Files</span>
            <span>/</span>
            <span className="max-w-36 truncate text-neutral-900">
              {file.name}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 px-5 pt-5 sm:px-7">
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            <ExternalLink className="size-3.5" />
            Open file
          </a>
          <button
            type="button"
            disabled={downloading}
            onClick={() => onDownload(file)}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-black px-3 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-60"
          >
            {downloading ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            Download
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-7">
          <div className="flex min-h-52 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-[linear-gradient(135deg,#fafafa,#f1f1f1)]">
            {isImage(file) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={file.url}
                alt={file.name}
                className="max-h-[360px] w-full object-contain"
              />
            ) : isPdf(file) ? (
              <iframe
                src={file.url}
                title={file.name}
                className="h-[360px] w-full bg-white"
              />
            ) : isVideo(file) ? (
              <video
                src={file.url}
                controls
                className="max-h-[360px] w-full"
              >
                Your browser does not support this video.
              </video>
            ) : (
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                {(() => {
                  const Icon = getFileIcon(file);
                  return (
                    <div className="flex size-16 items-center justify-center rounded-2xl border border-neutral-200 bg-white">
                      <Icon className="size-7 text-neutral-500" />
                    </div>
                  );
                })()}
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Preview unavailable
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Download the file to view it on your device.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="break-words text-lg font-semibold tracking-tight text-neutral-950">
              {file.name}
            </h2>
            <p className="mt-2 break-all text-[11px] leading-5 text-neutral-500">
              {file.originalName}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CategoryBadge file={file} />
              <span className="text-[11px] text-neutral-500">
                {formatBytes(file.size)}
              </span>
              <span className="text-neutral-300">·</span>
              <span className="text-[11px] uppercase text-neutral-500">
                {file.extension || "File"}
              </span>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-5">
            <h3 className="mb-4 text-xs font-semibold text-neutral-900">
              File information
            </h3>

            <dl className="space-y-4">
              <div className="flex items-start justify-between gap-5 text-xs">
                <dt className="text-neutral-500">Project</dt>
                <dd className="max-w-[65%] text-right font-medium text-neutral-900">
                  {getProjectTitle(file.project)}
                </dd>
              </div>

              {project?.type && (
                <div className="flex items-start justify-between gap-5 text-xs">
                  <dt className="text-neutral-500">Project type</dt>
                  <dd className="text-right text-neutral-800">
                    {project.type}
                  </dd>
                </div>
              )}

              <div className="flex items-start justify-between gap-5 text-xs">
                <dt className="text-neutral-500">Category</dt>
                <dd className="text-right text-neutral-800">
                  {getCategoryLabel(file.category)}
                  {file.assetType ? ` · ${file.assetType}` : ""}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-5 text-xs">
                <dt className="text-neutral-500">File size</dt>
                <dd className="text-right text-neutral-800">
                  {formatBytes(file.size)}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-5 text-xs">
                <dt className="text-neutral-500">File format</dt>
                <dd className="max-w-[65%] break-all text-right text-neutral-800">
                  {file.mimeType || file.extension || "Unknown"}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-5 text-xs">
                <dt className="text-neutral-500">Uploaded by</dt>
                <dd className="flex items-center gap-2 text-right text-neutral-800">
                  <Avatar person={file.uploadedBy} small />
                  {getPersonName(file.uploadedBy)}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-5 text-xs">
                <dt className="text-neutral-500">Uploaded on</dt>
                <dd className="text-right text-neutral-800">
                  {formatDateTime(file.createdAt)}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-5 text-xs">
                <dt className="text-neutral-500">Last updated</dt>
                <dd className="text-right text-neutral-800">
                  {formatDateTime(file.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>

          {file.description?.trim() && (
            <div className="border-t border-neutral-100 pt-5">
              <h3 className="mb-2 text-xs font-semibold text-neutral-900">
                Description
              </h3>
              <p className="whitespace-pre-wrap text-xs leading-6 text-neutral-600">
                {file.description}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-start gap-3">
              <HardDrive className="mt-0.5 size-4 text-neutral-500" />
              <div>
                <p className="text-xs font-medium text-neutral-900">
                  Original project file
                </p>
                <p className="mt-1 text-[11px] leading-5 text-neutral-500">
                  Download the stored file to your device. File access is
                  controlled by the project's existing permissions.
                </p>
                <button
                  type="button"
                  onClick={() => onDownload(file)}
                  disabled={downloading}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-neutral-900 hover:underline disabled:opacity-50"
                >
                  <ArrowDownToLine className="size-3.5" />
                  Download original file
                </button>
              </div>
            </div>
          </div>

          {canPreview && (
            <p className="text-[10px] leading-5 text-neutral-400">
              If a preview cannot be displayed, use Open file or Download.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

export default function AdminFilesPage() {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | FileCategory
  >("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(
    null
  );
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "100",
      });

      if (projectFilter !== "all") {
        params.set("projectId", projectFilter);
      }

      if (categoryFilter !== "all") {
        params.set("category", categoryFilter);
      }

      const response = await fetch(`/api/files?${params.toString()}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = (await response.json()) as ApiResponse<ProjectFile>;

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to load project files.");
      }

      setFiles(result.files ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load project files."
      );
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [projectFilter, categoryFilter]);

  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true);

    try {
      const response = await fetch("/api/projects", {
        credentials: "include",
        cache: "no-store",
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        projects?: Project[];
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to load projects.");
      }

      setProjects(result.projects ?? []);
    } catch (err) {
      console.error("Unable to load project filter options:", err);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const clients = useMemo(() => {
    const unique = new Map<string, Person>();
  
    for (const project of projects) {
      const client = project.client;
      const clientId = getId(client);
  
      if (clientId && client && !unique.has(clientId)) {
        unique.set(clientId, client);
      }
    }
  
    return Array.from(unique.entries())
      .map(([id, person]) => ({
        id,
        name: getPersonName(person),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);

  const filteredFiles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return files.filter((file) => {
      const projectId = getProjectId(file.project);
      const project = projects.find((item) => item._id === projectId);

      const matchesSearch =
        !normalizedSearch ||
        [
          file.name,
          file.originalName,
          file.extension,
          file.mimeType,
          file.description,
          getProjectTitle(file.project),
          getPersonName(file.uploadedBy),
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch));

      const matchesProject =
        projectFilter === "all" || projectId === projectFilter;

      const matchesClient =
        clientFilter === "all" ||
        getId(project?.client) === clientFilter;

      const matchesCategory =
        categoryFilter === "all" || file.category === categoryFilter;

      const created = new Date(file.createdAt);
      const start = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
      const end = dateTo ? new Date(`${dateTo}T23:59:59.999`) : null;

      const matchesDate =
        (!start || created >= start) &&
        (!end || created <= end);

      return (
        matchesSearch &&
        matchesProject &&
        matchesClient &&
        matchesCategory &&
        matchesDate
      );
    });
  }, [
    files,
    projects,
    search,
    projectFilter,
    clientFilter,
    categoryFilter,
    dateFrom,
    dateTo,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedFiles = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredFiles.slice(start, start + PAGE_SIZE);
  }, [filteredFiles, currentPage]);

  const hasActiveFilters =
    projectFilter !== "all" ||
    clientFilter !== "all" ||
    categoryFilter !== "all" ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    Boolean(search.trim());

  useEffect(() => {
    setPage(1);
  }, [
    search,
    projectFilter,
    clientFilter,
    categoryFilter,
    dateFrom,
    dateTo,
  ]);

  useEffect(() => {
    if (!selectedFile) return;

    const updated = files.find((file) => file._id === selectedFile._id);

    if (updated) setSelectedFile(updated);
  }, [files, selectedFile]);

  function clearFilters() {
    setSearch("");
    setProjectFilter("all");
    setClientFilter("all");
    setCategoryFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  async function downloadFile(file: ProjectFile) {
    setDownloadingId(file._id);
    setDownloadError("");

    try {
      /*
       * Cloudinary or another external storage host must permit CORS for
       * blob downloads. If it doesn't, fall back to opening its file URL.
       */
      const response = await fetch(file.url);

      if (!response.ok) {
        throw new Error("Direct download is unavailable.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = objectUrl;
      anchor.download = file.originalName || file.name || "download";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      // A cross-origin CORS restriction can prevent fetching a blob.
      // The existing URL remains available to open in the browser.
      window.open(file.url, "_blank", "noopener,noreferrer");
      setDownloadError(
        "The browser could not force a direct download. The file was opened in a new tab; use its download control to save it."
      );
    } finally {
      setDownloadingId(null);
    }
  }

  const imageCount = files.filter(isImage).length;
  const deliverableCount = files.filter(
    (file) => file.category === "deliverable"
  ).length;
  const brandAssetCount = files.filter(
    (file) => file.category === "brand-asset"
  ).length;

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(226,232,240,0.48),_transparent_42%),linear-gradient(180deg,#fafafa_0%,#f5f5f5_100%)] text-neutral-950">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-medium text-neutral-400">
              <span>Admin</span>
              <span>/</span>
              <span className="text-neutral-700">Files</span>
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[34px]">
              Project files
            </h1>

            <p className="mt-2 max-w-2xl text-xs leading-6 text-neutral-500 sm:text-sm">
              Browse, preview and download files from all your projects.
              Everything is organized by project and client.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchData()}
            disabled={loading}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-neutral-200/90 bg-white px-4 text-xs font-semibold text-neutral-700 shadow-sm shadow-neutral-900/[0.03] transition hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-md disabled:translate-y-0 disabled:opacity-50"
          >
            <LoaderCircle
              className={`size-3.5 ${loading ? "animate-spin" : "hidden"}`}
            />
            <span>{loading ? "Refreshing…" : "Refresh files"}</span>
          </button>
        </div>

        <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total files",
              value: files.length,
              icon: Folder,
              detail: "Across loaded projects",
            },
            {
              label: "Images",
              value: imageCount,
              icon: FileImage,
              detail: "Image files",
            },
            {
              label: "Brand assets",
              value: brandAssetCount,
              icon: File,
              detail: "Logos, icons and favicons",
            },
            {
              label: "Storage represented",
              value: formatBytes(totalSize),
              icon: HardDrive,
              detail: `${deliverableCount} deliverables`,
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="group rounded-2xl border border-neutral-200/80 bg-white/90 p-5 shadow-sm shadow-neutral-900/[0.025] transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-900/[0.045] sm:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium text-neutral-500 sm:text-xs">
                    {stat.label}
                  </span>
                  <span className="flex size-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition group-hover:bg-neutral-900 group-hover:text-white"><Icon className="size-4" strokeWidth={1.7} /></span>
                </div>
                <p className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[28px]">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[10px] text-neutral-400 sm:text-[11px]">
                  {stat.detail}
                </p>
              </div>
            );
          })}
        </div>

        <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm shadow-neutral-900/[0.025]">
          <div className="flex flex-col gap-4 border-b border-neutral-100 bg-white p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700"><Folder className="size-4" /></span><div><h2 className="text-sm font-semibold tracking-tight text-neutral-950">All files</h2><p className="mt-1 text-[11px] text-neutral-400">Your project asset library</p></div></div>
              <p className="mt-1 text-[11px] text-neutral-500">
                {loading
                  ? "Loading your project files…"
                  : `${filteredFiles.length} ${
                      filteredFiles.length === 1 ? "file" : "files"
                    } found`}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 sm:w-64">
                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search files, projects…"
                  className={`${inputClass} pl-9`}
                  aria-label="Search files"
                />
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen((value) => !value)}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition ${
                  filtersOpen || hasActiveFilters
                    ? "border-neutral-900 bg-neutral-900 text-white shadow-sm shadow-neutral-900/10"
                    : "border-neutral-200 bg-white text-neutral-700 shadow-sm shadow-neutral-900/[0.02] hover:border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                <Filter className="size-3.5" />
                Filters
                {hasActiveFilters && (
                  <span className="flex size-4 items-center justify-center rounded-full bg-white text-[9px] font-semibold text-black">
                    !
                  </span>
                )}
                <ChevronDown
                  className={`size-3.5 transition ${
                    filtersOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {filtersOpen && (
            <div className="border-b border-neutral-100 bg-neutral-50/70 p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Field label="Project">
                  <Select
                    value={projectFilter}
                    onChange={(value) => {
                      setProjectFilter(value);
                      if (
                        clientFilter !== "all" &&
                        value !== "all"
                      ) {
                        const chosenProject = projects.find(
                          (project) => project._id === value
                        );
                        if (
                          getId(chosenProject?.client) !== clientFilter
                        ) {
                          setClientFilter("all");
                        }
                      }
                    }}
                  >
                    <option value="all">All projects</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.title}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Client">
                  <Select
                    value={clientFilter}
                    onChange={(value) => {
                      setClientFilter(value);

                      if (value !== "all" && projectFilter !== "all") {
                        const project = projects.find(
                          (item) => item._id === projectFilter
                        );

                        if (getId(project?.client) !== value) {
                          setProjectFilter("all");
                        }
                      }
                    }}
                  >
                    <option value="all">All clients</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="File type">
                  <Select
                    value={categoryFilter}
                    onChange={(value) =>
                      setCategoryFilter(value as "all" | FileCategory)
                    }
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Uploaded from">
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="date"
                      value={dateFrom}
                      max={dateTo || undefined}
                      onChange={(event) => setDateFrom(event.target.value)}
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </Field>

                <Field label="Uploaded to">
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="date"
                      value={dateTo}
                      min={dateFrom || undefined}
                      onChange={(event) => setDateTo(event.target.value)}
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </Field>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] text-neutral-400">
                  Filters apply to the files currently loaded from the API.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-white hover:shadow-sm"
                >
                  <X className="size-3.5" />
                  Clear filters
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="m-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-red-900">
                  Could not load files
                </p>
                <p className="mt-1 text-xs leading-5 text-red-700">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => void fetchData()}
                  className="mt-2 text-xs font-semibold text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {downloadError && (
            <div className="mx-4 mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 sm:mx-5">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-700" />
              <p className="text-xs leading-5 text-amber-800">
                {downloadError}
              </p>
              <button
                type="button"
                onClick={() => setDownloadError("")}
                className="ml-auto rounded p-1 text-amber-700 hover:bg-amber-100"
                aria-label="Dismiss download message"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[960px] border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/80">
                  {[
                    "Name",
                    "Project",
                    "Client",
                    "Type",
                    "Size",
                    "Uploaded by",
                    "Uploaded on",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-4 py-3 text-[10px] font-medium text-neutral-500 first:pl-5 last:pr-5"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 8 }).map((__, cell) => (
                        <td key={cell} className="px-4 py-4">
                          <div className="h-4 animate-pulse rounded bg-neutral-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginatedFiles.length ? (
                  paginatedFiles.map((file) => {
                    const projectId = getProjectId(file.project);
                    const project = projects.find(
                      (item) => item._id === projectId
                    );

                    return (
                      <tr
                        key={file._id}
                        className="group transition-colors hover:bg-neutral-50/90"
                      >
                        <td className="max-w-[270px] px-4 py-3.5 pl-5">
                          <button
                            type="button"
                            onClick={() => setSelectedFile(file)}
                            className="flex w-full min-w-0 items-center gap-3 text-left"
                          >
                            <FileThumbnail file={file} />
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-medium text-neutral-900 group-hover:underline">
                                {file.name}
                              </span>
                              <span className="mt-1 block truncate text-[10px] text-neutral-400">
                                {file.extension.toUpperCase()} ·{" "}
                                {getCategoryLabel(file.category)}
                              </span>
                            </span>
                          </button>
                        </td>

                        <td className="max-w-40 px-4 py-3.5">
                          <span className="block truncate text-[11px] text-neutral-700">
                            {getProjectTitle(file.project)}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="block truncate text-[11px] text-neutral-600">
                            {getPersonName(project?.client ?? null)}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <CategoryBadge file={file} />
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 text-[11px] tabular-nums text-neutral-600">
                          {formatBytes(file.size)}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <Avatar person={file.uploadedBy} small />
                            <span className="max-w-28 truncate text-[11px] text-neutral-700">
                              {getPersonName(file.uploadedBy)}
                            </span>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 text-[11px] text-neutral-500">
                          <span className="flex items-center gap-1.5">
                            <Clock3 className="size-3 text-neutral-400" />
                            {formatDateTime(file.createdAt)}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 pr-5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedFile(file)}
                              title="View details"
                              aria-label={`View ${file.name}`}
                              className="rounded-md p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
                            >
                              <Eye className="size-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => void downloadFile(file)}
                              disabled={downloadingId === file._id}
                              title="Download file"
                              aria-label={`Download ${file.name}`}
                              className="rounded-md p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-black disabled:opacity-50"
                            >
                              {downloadingId === file._id ? (
                                <LoaderCircle className="size-3.5 animate-spin" />
                              ) : (
                                <Download className="size-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => window.open(file.url, "_blank", "noopener,noreferrer")}
                              title="Open file"
                              aria-label={`Open ${file.name}`}
                              className="rounded-md p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
                            >
                              <MoreHorizontal className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-5 py-20">
                      <EmptyState
                        filtered={hasActiveFilters}
                        onClear={clearFilters}
                        loadingProjects={projectsLoading}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-neutral-100 md:hidden">
            {loading ? (
              <div className="space-y-4 p-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="size-11 animate-pulse rounded-lg bg-neutral-100" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-100" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : paginatedFiles.length ? (
              paginatedFiles.map((file) => {
                const project = projects.find(
                  (item) => item._id === getProjectId(file.project)
                );

                return (
                  <div key={file._id} className="p-4">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedFile(file)}
                        className="shrink-0"
                        aria-label={`Preview ${file.name}`}
                      >
                        <FileThumbnail file={file} />
                      </button>

                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => setSelectedFile(file)}
                          className="block max-w-full truncate text-left text-xs font-semibold text-neutral-900"
                        >
                          {file.name}
                        </button>
                        <p className="mt-1 truncate text-[10px] text-neutral-500">
                          {getProjectTitle(file.project)}
                        </p>
                        <p className="mt-1 text-[10px] text-neutral-400">
                          {getPersonName(project?.client ?? null)} ·{" "}
                          {formatBytes(file.size)}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <CategoryBadge file={file} />
                          <span className="text-[10px] text-neutral-400">
                            {formatDate(file.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedFile(file)}
                          className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
                          aria-label="View file details"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void downloadFile(file)}
                          disabled={downloadingId === file._id}
                          className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
                          aria-label="Download file"
                        >
                          {downloadingId === file._id ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <Download className="size-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-16">
                <EmptyState
                  filtered={hasActiveFilters}
                  onClear={clearFilters}
                  loadingProjects={projectsLoading}
                />
              </div>
            )}
          </div>

          {!loading && !error && filteredFiles.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-neutral-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-[10px] text-neutral-500">
                Showing{" "}
                <span className="font-medium text-neutral-800">
                  {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filteredFiles.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-neutral-800">
                  {filteredFiles.length}
                </span>{" "}
                files
              </p>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="flex size-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Previous page"
                >
                  <ArrowLeft className="size-3.5" />
                </button>

                <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-neutral-900 px-3 text-xs font-semibold text-white shadow-sm shadow-neutral-900/15">
                  {currentPage}
                </span>

                <span className="px-1 text-[11px] text-neutral-400">
                  of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                  className="flex size-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Next page"
                >
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>

        <p className="mt-4 text-[10px] leading-5 text-neutral-400">
          Files are retrieved from your existing project storage. This page
          does not upload, rename, edit or delete project files.
        </p>
      </div>

      {selectedFile && (
        <FileDetailsDrawer
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onDownload={(file) => void downloadFile(file)}
          downloading={downloadingId === selectedFile._id}
        />
      )}
    </main>
  );
}

function EmptyState({
  filtered,
  onClear,
  loadingProjects,
}: {
  filtered: boolean;
  onClear: () => void;
  loadingProjects: boolean;
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50">
        <File className="size-6 text-neutral-400" strokeWidth={1.4} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-neutral-900">
        {filtered ? "No files found" : "No project files yet"}
      </h3>

      <p className="mt-2 text-xs leading-5 text-neutral-500">
        {filtered
          ? "Try adjusting your search or filters to find what you are looking for."
          : loadingProjects
            ? "Loading your project information…"
            : "Files uploaded to your projects will appear here when available."}
      </p>

      {filtered && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-black px-3 text-xs font-medium text-white transition hover:bg-neutral-800"
        >
          <Check className="size-3.5" />
          Clear filters
        </button>
      )}
    </div>
  );
}