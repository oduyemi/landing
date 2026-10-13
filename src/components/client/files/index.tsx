"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  FileText,
  FolderOpen,
  LoaderCircle,
  Plus,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import { FileRow } from "./FileRow";
import {
  filters,
  formatFileSize,
  getApiError,
  getCategoryLabel,
  matchesFilter,
  normalizeFile,
  normalizeProject,
  type ApiFileCategory,
  type BrandAssetType,
  type ClientFile,
  type FileFilter,
  type ProjectOption,
} from "./data";

const UPLOAD_LIMITS: Record<ApiFileCategory, number> = {
  image: 100,
  "brand-asset": 15,
  deliverable: 10,
};

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const ACCEPTED_FILES: Record<ApiFileCategory, string> = {
  image: ".jpg,.jpeg,.png,.webp,.gif,.avif",
  "brand-asset": ".svg,.ico,.png,.jpg,.jpeg",
  deliverable:
    ".pdf,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.json,.psd,.ai,.fig,.sketch,.mp4,.mov",
};

const EMPTY_UPLOAD_FORM = {
  category: "image" as ApiFileCategory,
  assetType: "logo" as BrandAssetType,
  description: "",
};

function extractArray(payload: unknown, key: string): unknown[] {
  if (Array.isArray(payload)) return payload;

  if (!payload || typeof payload !== "object") return [];

  const object = payload as Record<string, unknown>;

  if (Array.isArray(object[key])) return object[key] as unknown[];
  if (Array.isArray(object.data)) return object.data as unknown[];

  return [];
}

export const ClientFiles = () => {
  const [filter, setFilter] = useState<FileFilter>("All Files");
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [files, setFiles] = useState<ClientFile[]>([]);

  const [projectsLoading, setProjectsLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadCategory, setUploadCategory] =
    useState<ApiFileCategory>("image");
  const [assetType, setAssetType] =
    useState<BrandAssetType>("logo");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [totalFiles, setTotalFiles] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectMenuRef = useRef<HTMLDivElement>(null);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const loadProjects = useCallback(async () => {
    setProjectsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/projects", {
        method: "GET",
        cache: "no-store",
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getApiError(payload, "Unable to load your projects.")
        );
      }

      const projectList = extractArray(payload, "projects")
        .map(normalizeProject)
        .filter((project): project is ProjectOption => project !== null);

      setProjects(projectList);

      setSelectedProjectId((current) => {
        // Preserve a valid selection when the list is refreshed.
        if (current && projectList.some((project) => project._id === current)) {
          return current;
        }

        // Support project links such as /client/files?project=<projectId>.
        if (typeof window !== "undefined") {
          const requestedId = new URLSearchParams(
            window.location.search
          ).get("project");

          if (
            requestedId &&
            projectList.some((project) => project._id === requestedId)
          ) {
            return requestedId;
          }
        }

        return projectList[0]?._id ?? "";
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your projects."
      );
      setProjects([]);
      setSelectedProjectId("");
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  const loadFiles = useCallback(async () => {
    if (!selectedProjectId) {
      setFiles([]);
      setTotalFiles(0);
      setFilesLoading(false);
      return;
    }

    setFilesLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        projectId: selectedProjectId,
        page: "1",
        limit: "100",
      });

      const response = await fetch(`/api/files?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getApiError(payload, "Unable to load project files.")
        );
      }

      const fileList = extractArray(payload, "files")
        .map(normalizeFile)
        .filter((file): file is ClientFile => file !== null);

      setFiles(fileList);

      const responseObject =
        payload && typeof payload === "object"
          ? (payload as Record<string, unknown>)
          : null;

      const pagination =
        responseObject?.pagination &&
        typeof responseObject.pagination === "object"
          ? (responseObject.pagination as Record<string, unknown>)
          : null;

      setTotalFiles(
        typeof pagination?.total === "number"
          ? pagination.total
          : fileList.length
      );
    } catch (err) {
      setFiles([]);
      setTotalFiles(0);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load project files."
      );
    } finally {
      setFilesLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        projectMenuRef.current &&
        !projectMenuRef.current.contains(event.target as Node)
      ) {
        setProjectOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const filteredFiles = useMemo(
    () => files.filter((file) => matchesFilter(file, filter)),
    [files, filter]
  );

  const imageFiles = useMemo(
    () => filteredFiles.filter((file) => file.category === "image"),
    [filteredFiles]
  );

  const brandFiles = useMemo(
    () =>
      filteredFiles.filter((file) => file.category === "brand-asset"),
    [filteredFiles]
  );

  const deliverableFiles = useMemo(
    () =>
      filteredFiles.filter((file) => file.category === "deliverable"),
    [filteredFiles]
  );

  const categoryCounts = useMemo(
    () => ({
      "All Files": files.length,
      "Client Uploads": files.filter((file) => file.category === "image")
        .length,
      "Brand Assets": files.filter(
        (file) => file.category === "brand-asset"
      ).length,
      Deliverables: files.filter(
        (file) => file.category === "deliverable"
      ).length,
    }),
    [files]
  );

  function resetUploadForm() {
    setUploadCategory("image");
    setAssetType("logo");
    setDescription("");
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function openUploadDialog() {
    if (!selectedProjectId) {
      setError("Select a project before uploading a file.");
      return;
    }

    setError("");
    setNotice("");
    resetUploadForm();
    setUploadOpen(true);
  }

  function closeUploadDialog() {
    if (uploading) return;

    setUploadOpen(false);
    resetUploadForm();
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProjectId) {
      setError("Select a project before uploading a file.");
      return;
    }

    if (!selectedFile) {
      setError("Choose a file to upload.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Files must be 25 MB or smaller.");
      return;
    }

    if (selectedFile.size === 0) {
      setError("The selected file is empty.");
      return;
    }

    const currentCategoryCount = files.filter(
      (file) => file.category === uploadCategory
    ).length;

    if (currentCategoryCount >= UPLOAD_LIMITS[uploadCategory]) {
      setError(
        `This project has reached the limit of ${UPLOAD_LIMITS[uploadCategory]} ${getCategoryLabel(uploadCategory).toLowerCase()}.`
      );
      return;
    }

    setUploading(true);
    setError("");
    setNotice("");

    try {
      const formData = new FormData();

      formData.append("projectId", selectedProjectId);
      formData.append("file", selectedFile);
      formData.append("category", uploadCategory);

      if (uploadCategory === "brand-asset") {
        formData.append("assetType", assetType);
      }

      if (description.trim()) {
        formData.append("description", description.trim());
      }

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getApiError(payload, "The file could not be uploaded.")
        );
      }

      setUploadOpen(false);
      resetUploadForm();
      setFilter(
        uploadCategory === "image"
          ? "Client Uploads"
          : uploadCategory === "brand-asset"
            ? "Brand Assets"
            : "Deliverables"
      );

      setNotice("File uploaded successfully.");
      await loadFiles();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The file could not be uploaded."
      );
    } finally {
      setUploading(false);
    }
  }

  function handleFileChanged() {
    setError("");
    setNotice("");
    void loadFiles();
  }

  function handleFileError(message: string) {
    setNotice("");
    setError(message);
  }

  const loading = projectsLoading || filesLoading;

  return (
    <div className="min-h-full bg-[#fafafa]">
      <div className="mx-auto max-w-[1180px] px-5 py-8 sm:px-7 lg:px-9">
        <header className="flex flex-col gap-5 border-b border-[#e8e8e8] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#999]">
              Client workspace
            </p>

            <div className="mt-1.5 flex items-center gap-2">
              <h1 className="text-[22px] font-semibold tracking-[-0.04em] text-[#171717]">
                Files
              </h1>

              <span className="rounded-full bg-[#ededed] px-1.5 py-0.5 text-[10px] font-medium text-[#777]">
                {totalFiles ?? files.length}
              </span>
            </div>

            <p className="mt-1 text-[10px] text-[#888]">
              Files shared between you and your project team.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Project selector */}
            <div className="relative" ref={projectMenuRef}>
              <button
                type="button"
                disabled={projectsLoading || projects.length === 0}
                onClick={() => setProjectOpen((value) => !value)}
                className="flex h-9 items-center gap-2 rounded-[6px] border border-[#e3e3e3] bg-white px-3 text-[9px] font-medium text-[#444] transition-colors hover:border-[#ccc] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="max-w-[180px] truncate">
                  {projectsLoading
                    ? "Loading projects..."
                    : selectedProject?.title ?? "No projects available"}
                </span>

                <ChevronDown
                  className={[
                    "h-3 w-3 shrink-0 text-[#999] transition-transform",
                    projectOpen ? "rotate-180" : "",
                  ].join(" ")}
                  strokeWidth={1.7}
                />
              </button>

              {projectOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-30 max-h-[280px] w-[240px] overflow-y-auto rounded-[7px] border border-[#e5e5e5] bg-white p-1 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                  {projects.map((project) => (
                    <button
                      key={project._id}
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(project._id);
                        setProjectOpen(false);
                        setError("");
                        setNotice("");
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-[5px] px-3 py-2.5 text-left text-[10px] text-[#333] hover:bg-[#f7f7f7]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {project.title}
                        </span>
                        {project.status && (
                          <span className="mt-0.5 block text-[9px] text-[#999]">
                            {project.status}
                          </span>
                        )}
                      </span>

                      {selectedProjectId === project._id && (
                        <Check className="h-3.5 w-3.5 shrink-0 text-[#222]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setError("");
                setNotice("");
                void loadFiles();
              }}
              disabled={!selectedProjectId || loading}
              aria-label="Refresh files"
              title="Refresh files"
              className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#e3e3e3] bg-white text-[#666] transition-colors hover:border-[#ccc] hover:text-[#222] disabled:opacity-50"
            >
              <RefreshCw
                className={[
                  "h-3.5 w-3.5",
                  loading ? "animate-spin" : "",
                ].join(" ")}
                strokeWidth={1.7}
              />
            </button>

            <button
              type="button"
              onClick={openUploadDialog}
              disabled={!selectedProjectId || projectsLoading}
              className="flex h-9 items-center gap-1.5 rounded-[6px] bg-[#111] px-3 text-[9px] font-medium text-white transition-colors hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload className="h-3 w-3" strokeWidth={1.8} />
              Upload Files
            </button>
          </div>
        </header>

        {/* Feedback messages */}
        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-[7px] border border-[#f1ceca] bg-[#fff7f6] px-3 py-3 text-[10px] text-[#a52b20]"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p className="min-w-0 flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {notice && !error && (
          <div
            role="status"
            className="mt-5 flex items-center gap-2 rounded-[7px] border border-[#d7e8dc] bg-[#f5fbf6] px-3 py-3 text-[10px] text-[#276749]"
          >
            <Check className="h-3.5 w-3.5 shrink-0" />
            <p className="flex-1">{notice}</p>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mt-6 flex items-center gap-1 overflow-x-auto border-b border-[#e8e8e8]">
          {filters.map((item) => {
            const active = filter === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={[
                  "relative shrink-0 px-3 pb-3 pt-1 text-[10px] font-medium transition-colors",
                  active
                    ? "text-[#111]"
                    : "text-[#999] hover:text-[#444]",
                ].join(" ")}
              >
                <span className="flex items-center gap-1.5">
                  {item}
                  <span
                    className={[
                      "rounded-full px-1.5 py-0.5 text-[9px]",
                      active
                        ? "bg-[#ededed] text-[#555]"
                        : "bg-[#f0f0f0] text-[#999]",
                    ].join(" ")}
                  >
                    {categoryCounts[item]}
                  </span>
                </span>

                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-[1.5px] rounded-full bg-[#111]" />
                )}
              </button>
            );
          })}
        </div>

        {/* File content */}
        <div className="mt-7 space-y-8">
          {filesLoading && files.length === 0 ? (
            <LoadingState />
          ) : !projectsLoading && projects.length === 0 ? (
            <NoProjectsState />
          ) : (
            <>
              {imageFiles.length > 0 && (
                <FileSection
                  title="Client Uploads"
                  icon={FolderOpen}
                  files={imageFiles}
                  onChanged={handleFileChanged}
                  onError={handleFileError}
                />
              )}

              {brandFiles.length > 0 && (
                <FileSection
                  title="Brand Assets"
                  icon={FileText}
                  files={brandFiles}
                  onChanged={handleFileChanged}
                  onError={handleFileError}
                />
              )}

              {deliverableFiles.length > 0 && (
                <FileSection
                  title="Deliverables"
                  icon={FileText}
                  files={deliverableFiles}
                  onChanged={handleFileChanged}
                  onError={handleFileError}
                />
              )}

              {!filesLoading && filteredFiles.length === 0 && (
                <EmptyState
                  hasFiles={files.length > 0}
                  onUpload={openUploadDialog}
                />
              )}

              {filesLoading && files.length > 0 && (
                <p className="flex items-center justify-center gap-2 py-3 text-[10px] text-[#999]">
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  Refreshing files...
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Upload dialog */}
      {uploadOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeUploadDialog();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-dialog-title"
            className="my-auto w-full max-w-[480px] overflow-hidden rounded-[10px] border border-[#e8e8e8] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
          >
            <div className="flex items-start justify-between border-b border-[#eee] px-5 py-4 sm:px-6">
              <div>
                <h2
                  id="upload-dialog-title"
                  className="text-[15px] font-semibold tracking-[-0.03em] text-[#171717]"
                >
                  Upload a file
                </h2>
                <p className="mt-1 text-[10px] text-[#888]">
                  Add a file to {selectedProject?.title ?? "your project"}.
                </p>
              </div>

              <button
                type="button"
                disabled={uploading}
                onClick={closeUploadDialog}
                aria-label="Close upload dialog"
                className="flex h-7 w-7 items-center justify-center rounded-full text-[#888] hover:bg-[#f2f2f2] hover:text-[#222] disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-5 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="upload-category"
                  className="mb-2 block text-[10px] font-medium text-[#444]"
                >
                  File category
                </label>

                <select
                  id="upload-category"
                  value={uploadCategory}
                  disabled={uploading}
                  onChange={(event) => {
                    const category = event.target.value as ApiFileCategory;

                    setUploadCategory(category);
                    setSelectedFile(null);

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }

                    setError("");
                  }}
                  className="h-10 w-full rounded-[6px] border border-[#e3e3e3] bg-white px-3 text-[11px] text-[#333] outline-none transition-colors focus:border-[#999] disabled:opacity-60"
                >
                  <option value="image">Client Uploads — images</option>
                  <option value="brand-asset">Brand Assets — logos and icons</option>
                  <option value="deliverable">Deliverables — documents and files</option>
                </select>

                <p className="mt-1.5 text-[9px] text-[#999]">
                  {UPLOAD_LIMITS[uploadCategory]} files maximum in this
                  category per project.
                </p>
              </div>

              {uploadCategory === "brand-asset" && (
                <div>
                  <label
                    htmlFor="upload-asset-type"
                    className="mb-2 block text-[10px] font-medium text-[#444]"
                  >
                    Brand asset type
                  </label>

                  <select
                    id="upload-asset-type"
                    value={assetType}
                    disabled={uploading}
                    onChange={(event) =>
                      setAssetType(event.target.value as BrandAssetType)
                    }
                    className="h-10 w-full rounded-[6px] border border-[#e3e3e3] bg-white px-3 text-[11px] text-[#333] outline-none focus:border-[#999] disabled:opacity-60"
                  >
                    <option value="logo">Logo</option>
                    <option value="icon">Icon</option>
                    <option value="favicon">Favicon</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              <div>
                <label
                  htmlFor="upload-description"
                  className="mb-2 block text-[10px] font-medium text-[#444]"
                >
                  Description <span className="font-normal text-[#999]">(optional)</span>
                </label>

                <textarea
                  id="upload-description"
                  value={description}
                  disabled={uploading}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="What is this file for?"
                  className="w-full resize-y rounded-[6px] border border-[#e3e3e3] bg-white px-3 py-2.5 text-[11px] text-[#333] outline-none placeholder:text-[#aaa] focus:border-[#999] disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="upload-file"
                  className="mb-2 block text-[10px] font-medium text-[#444]"
                >
                  Choose file
                </label>

                <input
                  ref={fileInputRef}
                  id="upload-file"
                  type="file"
                  required
                  disabled={uploading}
                  accept={ACCEPTED_FILES[uploadCategory]}
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] ?? null;
                    setSelectedFile(nextFile);
                    setError("");
                  }}
                  className="block w-full rounded-[6px] border border-[#e3e3e3] bg-white p-2 text-[10px] text-[#555] file:mr-3 file:rounded-[4px] file:border-0 file:bg-[#f1f1f1] file:px-3 file:py-2 file:text-[10px] file:font-medium file:text-[#333] hover:file:bg-[#e7e7e7] disabled:opacity-60"
                />

                <p className="mt-2 text-[9px] leading-4 text-[#999]">
                  Maximum size: 25 MB.{" "}
                  {uploadCategory === "image"
                    ? "Supported: JPG, PNG, WebP, GIF and AVIF."
                    : uploadCategory === "brand-asset"
                      ? "Supported: SVG, ICO, PNG, JPG and JPEG."
                      : "Supported: PDF, Office documents, ZIP, CSV, JSON, and other permitted formats."}
                </p>

                {selectedFile && (
                  <div className="mt-3 flex items-center gap-2 rounded-[6px] bg-[#f7f7f7] p-3">
                    <FileText className="h-4 w-4 shrink-0 text-[#777]" />
                    <span className="min-w-0 flex-1 truncate text-[10px] text-[#444]">
                      {selectedFile.name}
                    </span>
                    <span className="shrink-0 text-[9px] text-[#999]">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <p role="alert" className="text-[10px] leading-4 text-[#b42318]">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-[#eee] pt-4">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={closeUploadDialog}
                  className="h-9 rounded-[6px] border border-[#e3e3e3] px-4 text-[10px] font-medium text-[#555] transition-colors hover:bg-[#f7f7f7] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="flex h-9 items-center justify-center gap-2 rounded-[6px] bg-[#111] px-4 text-[10px] font-medium text-white transition-colors hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      Upload file
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function FileSection({
  title,
  icon: Icon,
  files,
  onChanged,
  onError,
}: {
  title: string;
  icon: typeof FolderOpen;
  files: ClientFile[];
  onChanged: () => void;
  onError: (message: string) => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-[#777]" strokeWidth={1.6} />

        <h2 className="text-[11px] font-semibold text-[#222]">
          {title}
        </h2>

        <span className="rounded-full bg-[#ededed] px-1.5 py-0.5 text-[10px] font-medium text-[#888]">
          {files.length}
        </span>
      </div>

      <div className="overflow-visible rounded-[8px] border border-[#e6e6e6] bg-white">
        {files.map((file) => (
          <FileRow
            key={file.id}
            file={file}
            onChanged={onChanged}
            onError={onError}
          />
        ))}
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[8px] border border-[#e6e6e6] bg-white text-center">
      <LoaderCircle className="h-5 w-5 animate-spin text-[#777]" />
      <p className="mt-3 text-[11px] font-medium text-[#444]">
        Loading project files
      </p>
      <p className="mt-1 text-[9px] text-[#999]">
        Getting the latest files from your workspace.
      </p>
    </div>
  );
}

function NoProjectsState() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[8px] border border-dashed border-[#ddd] bg-white px-5 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f4f4]">
        <FolderOpen className="h-4 w-4 text-[#999]" strokeWidth={1.6} />
      </div>

      <p className="mt-3 text-[11px] font-medium text-[#444]">
        No projects available
      </p>

      <p className="mt-1 max-w-[260px] text-[9px] leading-4 text-[#999]">
        Files are organized by project. Once a project is available to your
        account, its shared files will appear here.
      </p>
    </div>
  );
}

function EmptyState({
  hasFiles,
  onUpload,
}: {
  hasFiles: boolean;
  onUpload: () => void;
}) {
  return (
    <div className="mt-8 flex min-h-[260px] flex-col items-center justify-center rounded-[8px] border border-dashed border-[#ddd] bg-white px-5 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f4f4]">
        <FileText className="h-4 w-4 text-[#999]" strokeWidth={1.6} />
      </div>

      <p className="mt-3 text-[11px] font-medium text-[#444]">
        {hasFiles ? "No files in this category" : "No files yet"}
      </p>

      <p className="mt-1 max-w-[260px] text-[9px] leading-4 text-[#999]">
        {hasFiles
          ? "Try another filter to see the other files in this project."
          : "Files uploaded by you or your project team will appear here."}
      </p>

      {!hasFiles && (
        <button
          type="button"
          onClick={onUpload}
          className="mt-4 flex h-8 items-center gap-1.5 rounded-[6px] bg-[#111] px-3 text-[10px] font-medium text-white hover:bg-[#2a2a2a]"
        >
          <Plus className="h-3 w-3" />
          Upload your first file
        </button>
      )}
    </div>
  );
}