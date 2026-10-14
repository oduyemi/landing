"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  Check,
  ChevronDown,
  ChevronRight,
  CloudUpload,
  File,
  FileImage,
  FileText,
  FolderOpen,
  HardDrive,
  Layers3,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
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

const CATEGORY_META: Record<
  ApiFileCategory,
  {
    title: string;
    description: string;
    icon: typeof File;
    color: string;
    softColor: string;
  }
> = {
  image: {
    title: "Client uploads",
    description: "Images and visual references",
    icon: FileImage,
    color: "text-blue-700",
    softColor: "bg-blue-50",
  },
  "brand-asset": {
    title: "Brand assets",
    description: "Logos, icons and brand files",
    icon: Layers3,
    color: "text-violet-700",
    softColor: "bg-violet-50",
  },
  deliverable: {
    title: "Deliverables",
    description: "Documents and final project files",
    icon: FileText,
    color: "text-emerald-700",
    softColor: "bg-emerald-50",
  },
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
  const [projectSearch, setProjectSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<ApiFileCategory>("image");
  const [assetType, setAssetType] = useState<BrandAssetType>("logo");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [totalFiles, setTotalFiles] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectMenuRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const filteredProjects = useMemo(() => {
    const query = projectSearch.trim().toLowerCase();

    if (!query) return projects;

    return projects.filter((project) =>
      project.title.toLowerCase().includes(query)
    );
  }, [projects, projectSearch]);

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
        .filter(
          (project): project is ProjectOption => project !== null
        );

      setProjects(projectList);

      setSelectedProjectId((current) => {
        if (
          current &&
          projectList.some((project) => project._id === current)
        ) {
          return current;
        }

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
        setProjectSearch("");
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!uploadOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !uploading) {
        closeUploadDialog();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [uploadOpen, uploading]);

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
      "Client Uploads": files.filter(
        (file) => file.category === "image"
      ).length,
      "Brand Assets": files.filter(
        (file) => file.category === "brand-asset"
      ).length,
      Deliverables: files.filter(
        (file) => file.category === "deliverable"
      ).length,
    }),
    [files]
  );

  const storageUsed = useMemo(
    () => files.reduce((sum, file) => sum + (file.size || 0), 0),
    [files]
  );

  function resetUploadForm() {
    setUploadCategory("image");
    setAssetType("logo");
    setDescription("");
    setSelectedFile(null);
    setIsDragging(false);

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

  function validateAndSelectFile(file: File | null) {
    if (!file) return;

    setError("");

    if (file.size === 0) {
      setSelectedFile(null);
      setError("The selected file is empty.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setError("Files must be 25 MB or smaller.");
      return;
    }

    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const allowedExtensions = ACCEPTED_FILES[uploadCategory]
      .split(",")
      .map((item) => item.trim().toLowerCase());

    if (!allowedExtensions.includes(extension)) {
      setSelectedFile(null);
      setError(
        `This file type is not supported for ${getCategoryLabel(uploadCategory).toLowerCase()}.`
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setSelectedFile(file);
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

      setNotice("Your file has been uploaded successfully.");
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
    <div className="min-h-full bg-[#f7f8fa] text-[#172033]">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-10">
        {/* Page heading */}
        <header className="flex flex-col gap-5 border-b border-[#e6e9ef] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#69758a]">
              <FolderOpen className="h-4 w-4" />
              <span>Workspace</span>
              <ChevronRight className="h-3 w-3 text-[#a3acba]" />
              <span className="text-[#273449]">Files</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-[-0.045em] text-[#172033] sm:text-[36px]">
                Project files
              </h1>

              <span className="inline-flex h-7 items-center rounded-full border border-[#e0e6ef] bg-white px-3 text-xs font-semibold tabular-nums text-[#536176] shadow-sm">
                {totalFiles ?? files.length} files
              </span>
            </div>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#778297]">
              Keep your project documents, creative assets and shared
              deliverables organized in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setError("");
                setNotice("");
                void loadProjects();
                void loadFiles();
              }}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#e1e5ec] bg-white px-4 text-sm font-medium text-[#536176] shadow-sm transition hover:border-[#cbd3df] hover:bg-[#fbfcfe] hover:text-[#172033] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={openUploadDialog}
              disabled={!selectedProjectId || projectsLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111] px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(23,43,77,0.14)] transition hover:bg-[#223c65] hover:shadow-[0_6px_16px_rgba(23,43,77,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Upload files
            </button>
          </div>
        </header>

        {/* Feedback */}
        {error && (
          <FeedbackBanner
            type="error"
            message={error}
            onDismiss={() => setError("")}
          />
        )}

        {notice && !error && (
          <FeedbackBanner
            type="success"
            message={notice}
            onDismiss={() => setNotice("")}
          />
        )}

        {/* Workspace summary */}
        <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={FolderOpen}
            label="Total files"
            value={totalFiles ?? files.length}
            detail="In this project workspace"
            iconClass="bg-blue-50 text-blue-700"
          />

          <SummaryCard
            icon={HardDrive}
            label="File categories"
            value={Object.values(categoryCounts).slice(1).filter(Boolean).length}
            detail="Images, brand assets and deliverables"
            iconClass="bg-violet-50 text-violet-700"
          />

          <SummaryCard
            icon={ShieldCheck}
            label="Storage overview"
            value={formatFileSize(storageUsed)}
            detail="Combined size of loaded files"
            iconClass="bg-emerald-50 text-emerald-700"
          />
        </section>

        {/* Project selection */}
        <section className="mt-7 overflow-visible rounded-2xl border border-[#e3e8f0] bg-white shadow-[0_2px_8px_rgba(20,35,60,0.025)]">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf2fa] text-[#28456f]">
                <FolderOpen className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.09em] text-[#8792a5]">
                  Current project
                </p>

                <p className="mt-1 truncate text-lg font-semibold tracking-[-0.025em] text-[#172033]">
                  {projectsLoading
                    ? "Loading your projects..."
                    : selectedProject?.title ?? "No project selected"}
                </p>

                <p className="mt-1 text-xs text-[#8792a5]">
                  {selectedProject?.status
                    ? `Project status · ${selectedProject.status}`
                    : projects.length
                      ? "Choose a project to view its files"
                      : "Your available projects will appear here"}
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-auto" ref={projectMenuRef}>
              <button
                type="button"
                disabled={projectsLoading || projects.length === 0}
                aria-expanded={projectOpen}
                aria-haspopup="listbox"
                onClick={() => {
                  setProjectOpen((value) => !value);
                  setProjectSearch("");
                }}
                className="flex h-11 w-full items-center justify-between gap-4 rounded-xl border border-[#e0e5ed] bg-white px-4 text-sm font-medium text-[#35435a] transition hover:border-[#b9c5d6] hover:bg-[#fbfcfe] disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[210px]"
              >
                <span className="truncate">
                  {projects.length > 1 ? "Switch project" : "Project options"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#8995a7] transition-transform ${
                    projectOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {projectOpen && (
                <div
                  role="listbox"
                  aria-label="Choose a project"
                  className="absolute right-0 top-[calc(100%+8px)] z-40 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#e1e6ef] bg-white p-2 shadow-[0_16px_48px_rgba(24,39,65,0.14)]"
                >
                  {projects.length > 4 && (
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa5b5]" />
                      <input
                        value={projectSearch}
                        onChange={(event) =>
                          setProjectSearch(event.target.value)
                        }
                        placeholder="Search projects..."
                        className="h-10 w-full rounded-lg border border-[#e7ebf1] bg-[#fafbfd] pl-9 pr-3 text-sm text-[#35435a] outline-none transition placeholder:text-[#9aa5b5] focus:border-[#aabbd3] focus:bg-white"
                      />
                    </div>
                  )}

                  <div className="max-h-[280px] overflow-y-auto">
                    {filteredProjects.map((project) => {
                      const isSelected =
                        selectedProjectId === project._id;

                      return (
                        <button
                          key={project._id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setSelectedProjectId(project._id);
                            setProjectOpen(false);
                            setProjectSearch("");
                            setError("");
                            setNotice("");
                            setFilter("All Files");
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                            isSelected
                              ? "bg-[#edf2fa]"
                              : "hover:bg-[#f6f8fb]"
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              isSelected
                                ? "bg-[#dce6f5] text-[#28456f]"
                                : "bg-[#f0f3f7] text-[#78869b]"
                            }`}
                          >
                            <FolderOpen className="h-4 w-4" />
                          </div>

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-[#29364c]">
                              {project.title}
                            </span>
                            {project.status && (
                              <span className="mt-1 block text-xs text-[#8792a5]">
                                {project.status}
                              </span>
                            )}
                          </span>

                          {isSelected && (
                            <Check className="h-4 w-4 shrink-0 text-[#28456f]" />
                          )}
                        </button>
                      );
                    })}

                    {filteredProjects.length === 0 && (
                      <p className="px-3 py-6 text-center text-sm text-[#8792a5]">
                        No projects match your search.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* File filters */}
        <section className="mt-7">
          <div className="flex flex-col gap-4 border-b border-[#e3e8f0] sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-[-0.025em] text-[#202d42]">
                Your files
              </h2>
              <p className="mt-1 pb-4 text-sm text-[#8792a5]">
                Browse everything shared in your workspace.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Filter project files"
              className="-mb-px flex max-w-full gap-1 overflow-x-auto"
            >
              {filters.map((item) => {
                const active = filter === item;

                return (
                  <button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(item)}
                    className={`relative flex shrink-0 items-center gap-2 rounded-t-lg px-3 py-3 text-sm font-medium transition sm:px-4 ${
                      active
                        ? "text-[#243c62]"
                        : "text-[#8994a6] hover:text-[#3e4d63]"
                    }`}
                  >
                    {item}

                    <span
                      className={`inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                        active
                          ? "bg-[#e9eff8] text-[#28456f]"
                          : "bg-[#edf0f4] text-[#7d899a]"
                      }`}
                    >
                      {categoryCounts[item]}
                    </span>

                    {active && (
                      <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-[#28456f]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* File content */}
        <div className="mt-6 space-y-8">
          {filesLoading && files.length === 0 ? (
            <LoadingState />
          ) : !projectsLoading && projects.length === 0 ? (
            <NoProjectsState />
          ) : (
            <>
              {imageFiles.length > 0 && (
                <FileSection
                  title="Client uploads"
                  description={CATEGORY_META.image.description}
                  icon={FileImage}
                  files={imageFiles}
                  onChanged={handleFileChanged}
                  onError={handleFileError}
                />
              )}

              {brandFiles.length > 0 && (
                <FileSection
                  title="Brand assets"
                  description={CATEGORY_META["brand-asset"].description}
                  icon={Layers3}
                  files={brandFiles}
                  onChanged={handleFileChanged}
                  onError={handleFileError}
                />
              )}

              {deliverableFiles.length > 0 && (
                <FileSection
                  title="Deliverables"
                  description={CATEGORY_META.deliverable.description}
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
                <div className="flex items-center justify-center gap-2 rounded-xl border border-[#e3e8f0] bg-white py-4 text-sm text-[#8792a5]">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Refreshing your files...
                </div>
              )}
            </>
          )}
        </div>

        {/* Upload dialog */}
        {uploadOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#101827]/55 p-3 backdrop-blur-[3px] sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeUploadDialog();
              }
            }}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="upload-dialog-title"
              className="my-auto w-full max-w-[560px] overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_28px_100px_rgba(12,25,46,0.28)]"
            >
              <div className="relative overflow-hidden bg-[#111] px-5 py-6 text-white sm:px-7">
                <div className="absolute -right-8 -top-14 h-40 w-40 rounded-full border border-white/10" />
                <div className="absolute -right-1 -top-5 h-28 w-28 rounded-full border border-white/10" />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                      <CloudUpload className="h-5 w-5" />
                    </div>

                    <div>
                      <h2
                        id="upload-dialog-title"
                        className="text-xl font-semibold tracking-[-0.035em]"
                      >
                        Upload a file
                      </h2>

                      <p className="mt-1.5 max-w-[330px] text-sm leading-5 text-white/70">
                        Add something new to{" "}
                        <span className="font-medium text-white">
                          {selectedProject?.title ?? "your project"}
                        </span>
                        .
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={uploading}
                    onClick={closeUploadDialog}
                    aria-label="Close upload dialog"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpload} className="space-y-5 p-5 sm:p-7">
                <div>
                  <label
                    htmlFor="upload-category"
                    className="mb-2 block text-sm font-semibold text-[#344258]"
                  >
                    Where should this file go?
                  </label>

                  <select
                    id="upload-category"
                    value={uploadCategory}
                    disabled={uploading}
                    onChange={(event) => {
                      const category = event.target.value as ApiFileCategory;

                      setUploadCategory(category);
                      setSelectedFile(null);
                      setError("");

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="h-12 w-full rounded-xl border border-[#dfe5ee] bg-white px-3.5 text-sm text-[#344258] outline-none transition focus:border-[#8298b9] focus:ring-4 focus:ring-[#edf2fa] disabled:opacity-60"
                  >
                    <option value="image">Client uploads — images</option>
                    <option value="brand-asset">
                      Brand assets — logos and icons
                    </option>
                    <option value="deliverable">
                      Deliverables — documents and files
                    </option>
                  </select>

                  <p className="mt-2 flex items-center gap-1.5 text-xs text-[#8792a5]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Up to {UPLOAD_LIMITS[uploadCategory]} files in this
                    category per project.
                  </p>
                </div>

                {uploadCategory === "brand-asset" && (
                  <div>
                    <label
                      htmlFor="upload-asset-type"
                      className="mb-2 block text-sm font-semibold text-[#344258]"
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
                      className="h-12 w-full rounded-xl border border-[#dfe5ee] bg-white px-3.5 text-sm text-[#344258] outline-none transition focus:border-[#8298b9] focus:ring-4 focus:ring-[#edf2fa] disabled:opacity-60"
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
                    className="mb-2 block text-sm font-semibold text-[#344258]"
                  >
                    Description{" "}
                    <span className="font-normal text-[#98a2b3]">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    id="upload-description"
                    value={description}
                    disabled={uploading}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={2000}
                    rows={3}
                    placeholder="Add context to help your project team understand this file..."
                    className="w-full resize-y rounded-xl border border-[#dfe5ee] bg-white px-3.5 py-3 text-sm leading-6 text-[#344258] outline-none transition placeholder:text-[#a0aaba] focus:border-[#8298b9] focus:ring-4 focus:ring-[#edf2fa] disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="upload-file"
                    className="mb-2 block text-sm font-semibold text-[#344258]"
                  >
                    Select your file
                  </label>

                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (!uploading) setIsDragging(true);
                    }}
                    onDragLeave={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                        setIsDragging(false);
                      }
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      setIsDragging(false);

                      if (!uploading) {
                        validateAndSelectFile(
                          event.dataTransfer.files?.[0] ?? null
                        );
                      }
                    }}
                    className={`rounded-2xl border-2 border-dashed p-4 transition sm:p-5 ${
                      isDragging
                        ? "border-[#607fa9] bg-[#edf3fc]"
                        : selectedFile
                          ? "border-[#b8d7c5] bg-[#f5faf7]"
                          : "border-[#dce3ed] bg-[#fafbfd] hover:border-[#b7c6da] hover:bg-[#f7f9fc]"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      id="upload-file"
                      type="file"
                      required
                      disabled={uploading}
                      accept={ACCEPTED_FILES[uploadCategory]}
                      onChange={(event) => {
                        validateAndSelectFile(
                          event.target.files?.[0] ?? null
                        );
                      }}
                      className="sr-only"
                    />

                    {selectedFile ? (
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#426b55] shadow-sm">
                          <FileText className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#344258]">
                            {selectedFile.name}
                          </p>
                          <p className="mt-1 text-xs text-[#718176]">
                            {formatFileSize(selectedFile.size)} · Ready to
                            upload
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={uploading}
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          aria-label="Remove selected file"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#78869b] transition hover:bg-white hover:text-[#344258]"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#536f98] shadow-sm">
                          <Upload className="h-5 w-5" />
                        </div>

                        <p className="mt-3 text-sm font-semibold text-[#344258]">
                          Drop your file here
                        </p>

                        <p className="mt-1 text-xs text-[#8792a5]">
                          or choose a file from your device
                        </p>

                        <label
                          htmlFor="upload-file"
                          className={`mt-4 inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#dfe5ee] bg-white px-4 text-xs font-semibold text-[#344258] shadow-sm transition hover:border-[#bac7d8] hover:bg-[#f7f9fc] ${
                            uploading
                              ? "pointer-events-none opacity-50"
                              : ""
                          }`}
                        >
                          Browse files
                        </label>
                      </div>
                    )}
                  </div>

                  <p className="mt-2.5 text-xs leading-5 text-[#8792a5]">
                    Maximum size: 25 MB.{" "}
                    {uploadCategory === "image"
                      ? "Supported: JPG, PNG, WebP, GIF and AVIF."
                      : uploadCategory === "brand-asset"
                        ? "Supported: SVG, ICO, PNG, JPG and JPEG."
                        : "Supported: PDF, Office documents, ZIP, CSV, JSON and other permitted formats."}
                  </p>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-xl border border-[#f0d0cc] bg-[#fff7f6] p-3.5 text-sm text-[#a52b20]"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="min-w-0 flex-1 leading-5">{error}</p>
                    <button
                      type="button"
                      onClick={() => setError("")}
                      aria-label="Dismiss error"
                      className="shrink-0 text-[#b65b52] hover:text-[#8c241b]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-2 border-t border-[#edf0f4] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-1.5 text-xs text-[#8792a5]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Shared with your project workspace
                  </p>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={closeUploadDialog}
                      className="h-11 rounded-xl border border-[#dfe5ee] bg-white px-4 text-sm font-medium text-[#536176] transition hover:bg-[#f7f9fc] disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={uploading || !selectedFile}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#223c65] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload file
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
  iconClass,
}: {
  icon: typeof File;
  label: string;
  value: string | number;
  detail: string;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e3e8f0] bg-white p-5 shadow-[0_2px_8px_rgba(20,35,60,0.025)] transition hover:border-[#d5ddea] hover:shadow-[0_5px_18px_rgba(20,35,60,0.045)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#778297]">{label}</p>
          <p className="mt-3 break-words text-2xl font-semibold tracking-[-0.045em] text-[#202d42] sm:text-[28px]">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-[#8994a6]">{detail}</p>
    </div>
  );
}

function FeedbackBanner({
  type,
  message,
  onDismiss,
}: {
  type: "error" | "success";
  message: string;
  onDismiss: () => void;
}) {
  const isError = type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`mt-5 flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm ${
        isError
          ? "border-[#f0d0cc] bg-[#fff7f6] text-[#a52b20]"
          : "border-[#d5e9dc] bg-[#f3faf5] text-[#276749]"
      }`}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <Check className="mt-0.5 h-4 w-4 shrink-0" />
      )}

      <p className="min-w-0 flex-1 leading-5">{message}</p>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss message"
        className="shrink-0 opacity-70 transition hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function FileSection({
  title,
  description,
  icon: Icon,
  files,
  onChanged,
  onError,
}: {
  title: string;
  description: string;
  icon: typeof File;
  files: ClientFile[];
  onChanged: () => void;
  onError: (message: string) => void;
}) {
  const meta = Object.values(CATEGORY_META).find(
    (item) => item.title.toLowerCase() === title.toLowerCase()
  );

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              meta?.softColor ?? "bg-[#eef2f7]"
            } ${meta?.color ?? "text-[#536176]"}`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-[#253249]">
                {title}
              </h2>

              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#eaf0f7] px-1.5 text-[11px] font-semibold tabular-nums text-[#536984]">
                {files.length}
              </span>
            </div>

            <p className="mt-0.5 text-xs text-[#8792a5]">{description}</p>
          </div>
        </div>

        <span className="text-xs text-[#8792a5]">
          {files.length} {files.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e3e8f0] bg-white shadow-[0_2px_8px_rgba(20,35,60,0.025)]">
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
    <div className="rounded-2xl border border-[#e3e8f0] bg-white px-5 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf2fa] text-[#28456f]">
        <LoaderCircle className="h-6 w-6 animate-spin" />
      </div>

      <p className="mt-5 text-base font-semibold text-[#29364c]">
        Loading your project files
      </p>

      <p className="mt-2 text-sm text-[#8792a5]">
        Getting the latest files from your workspace.
      </p>

      <div className="mx-auto mt-7 max-w-md space-y-3">
        <div className="h-12 animate-pulse rounded-xl bg-[#f0f3f7]" />
        <div className="h-12 animate-pulse rounded-xl bg-[#f0f3f7]" />
        <div className="h-12 animate-pulse rounded-xl bg-[#f0f3f7]" />
      </div>
    </div>
  );
}

function NoProjectsState() {
  return (
    <div className="rounded-2xl border border-dashed border-[#d7dfeb] bg-white px-5 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf2fa] text-[#536f98]">
        <FolderOpen className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-lg font-semibold tracking-[-0.025em] text-[#29364c]">
        No projects available yet
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8792a5]">
        Files are organized by project. Once a project is available to
        your account, its shared files will appear here.
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
    <div className="rounded-2xl border border-dashed border-[#d7dfeb] bg-white px-5 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf2fa] text-[#536f98]">
        {hasFiles ? (
          <Search className="h-6 w-6" />
        ) : (
          <ArrowDownToLine className="h-6 w-6" />
        )}
      </div>

      <h3 className="mt-5 text-lg font-semibold tracking-[-0.025em] text-[#29364c]">
        {hasFiles ? "No files in this category" : "Your workspace is ready"}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8792a5]">
        {hasFiles
          ? "Try another category above to find the files you need."
          : "Upload your first file to start organizing project assets and sharing resources with your team."}
      </p>

      {!hasFiles && (
        <button
          type="button"
          onClick={onUpload}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#223c65]"
        >
          <Plus className="h-4 w-4" />
          Upload your first file
        </button>
      )}
    </div>
  );
}