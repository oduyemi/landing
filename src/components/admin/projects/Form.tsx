
"use client";
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  Clock3,
  FileText,
  FolderPlus,
  ImagePlus,
  LoaderCircle,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import {
  PROJECT_STATUSES,
  PROJECT_TYPES,
  type ProjectStatus,
} from "./types";

interface ClientOption {
  _id: string;
  fname: string;
  lname: string;
  email: string;
}

interface ClientsResponse {
  users?: ClientOption[];
  clients?: ClientOption[];
  data?:
    | ClientOption[]
    | {
        users?: ClientOption[];
        clients?: ClientOption[];
      };
  error?: string;
}

interface CreateProjectResponse {
  project?: { _id: string };
  data?: { _id?: string; project?: { _id: string } };
  message?: string;
  error?: string;
}

interface UploadImageResponse {
  image?: string;
  publicId?: string;
  error?: string;
}

const inputClass =
  "block w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-[13px] text-neutral-900 outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400";

const labelClass = "mb-2 block text-xs font-medium text-neutral-700";

function getClients(response: ClientsResponse): ClientOption[] {
  if (Array.isArray(response.clients)) return response.clients;
  if (Array.isArray(response.users)) return response.users;
  if (Array.isArray(response.data)) return response.data;

  return response.data?.clients ?? response.data?.users ?? [];
}

function FormSection({
  number,
  icon,
  title,
  description,
  children,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.015)]">
      <div className="flex items-start gap-3.5 border-b border-neutral-100 px-5 py-5 sm:px-7">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
              Step {number}
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-300" />
            <span className="text-[10px] text-neutral-400">
              Project setup
            </span>
          </div>

          <h2 className="mt-1.5 text-base font-semibold tracking-tight text-neutral-950">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-neutral-500">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-7">{children}</div>
    </section>
  );
}

function FieldHint({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-[11px] leading-5 text-neutral-400">
      {children}
    </p>
  );
}

export const ProjectForm = () => {
  const router = useRouter();

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [clientError, setClientError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [clientId, setClientId] = useState("");

  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("Planning");
  const [progress, setProgress] = useState(0);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadClients() {
      setLoadingClients(true);

      try {
        const response = await fetch("/api/users?role=user", {
          credentials: "include",
          cache: "no-store",
        });

        const result = (await response.json()) as ClientsResponse;

        if (!response.ok) {
          throw new Error(result.error || "Unable to load clients.");
        }

        if (active) {
          setClients(getClients(result));
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? `Client list: ${err.message}`
              : "Unable to load clients."
          );
        }
      } finally {
        if (active) setLoadingClients(false);
      }
    }

    void loadClients();

    return () => {
      active = false;
    };
  }, []);

  // Release temporary preview URLs when replaced or when the component unmounts.
  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [imageFile]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      setError("The project image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);
  };

  const selectedClient = clients.find(
    (client) => client._id === clientId
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setClientError("");

    if (!clientId) {
      setClientError("Please select a client before continuing.");
      document.getElementById("project-client")?.focus();
      return;
    }

    if (!title.trim() || !description.trim() || !type) {
      setError("Complete all required project information.");
      return;
    }

    if (!startDate || !deadline) {
      setError("Please provide both the project start date and deadline.");
      return;
    }

    if (deadline < startDate) {
      setError(
        "The target completion date cannot be before the start date."
      );
      return;
    }

    if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
      setError("Project progress must be a whole number between 0 and 100.");
      return;
    }

    setSubmitting(true);

    try {
      let uploadedImageUrl: string | undefined;

      // Upload the cover image to Cloudinary before creating the project.
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);

        const uploadResponse = await fetch(
          "/api/uploads/project-image",
          {
            method: "POST",
            credentials: "include",
            body: imageFormData,
          }
        );

        const uploadResult =
          (await uploadResponse.json()) as UploadImageResponse;

        if (!uploadResponse.ok || !uploadResult.image) {
          throw new Error(
            uploadResult.error || "Project image upload failed."
          );
        }

        uploadedImageUrl = uploadResult.image;
      }

      const response = await fetch("/api/projects", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          type,
          client: clientId,
          startDate,
          deadline,
          status,
          progress,
          image: uploadedImageUrl,
        }),
      });

      const result =
        (await response.json()) as CreateProjectResponse;

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.message ||
            "Could not create project."
        );
      }

      const projectId =
        result.project?._id ??
        result.data?.project?._id ??
        result.data?._id;

      if (projectId) {
        router.push(`/admin/projects/${projectId}`);
      } else {
        router.push("/admin/projects");
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create project."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const completedFields = [
    Boolean(title.trim()),
    Boolean(description.trim()),
    Boolean(type),
    Boolean(clientId),
    Boolean(startDate),
    Boolean(deadline),
  ].filter(Boolean).length;

  const progressPercent = (completedFields / 6) * 100;

  return (
    <main className="mx-auto min-w-0 max-w-[1100px] space-y-6 pb-10 sm:space-y-8">
      <header>
        <Link
          href="/admin/projects"
          className="group inline-flex items-center gap-2 text-xs font-medium text-neutral-500 transition hover:text-neutral-950"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white transition group-hover:border-neutral-300">
            <ArrowLeft size={14} />
          </span>
          Back to projects
        </Link>

        <div className="relative mt-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(to right, #f1f1f1 1px, transparent 1px), linear-gradient(to bottom, #f1f1f1 1px, transparent 1px)",
              backgroundSize: "30px 30px",
              maskImage: "linear-gradient(to left, black, transparent)",
            }}
          />

          <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_240px] lg:items-center lg:p-9">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-medium text-neutral-600">
                <FolderPlus size={12} />
                Project management
              </div>

              <h1 className="mt-4 text-2xl font-semibold tracking-[-0.055em] text-neutral-950 sm:text-3xl">
                Create a new project
              </h1>

              <p className="mt-2 max-w-xl text-xs leading-6 text-neutral-500 sm:text-sm">
                Set up project details, assign an existing client, record
                its current progress, and define the schedule.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-neutral-700">
                  Setup progress
                </span>
                <span className="text-xs font-semibold tabular-nums text-neutral-950">
                  {completedFields}/6
                </span>
              </div>

              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100"
                role="progressbar"
                aria-label="Required project fields completed"
                aria-valuemin={0}
                aria-valuemax={6}
                aria-valuenow={completedFields}
              >
                <div
                  className="h-full rounded-full bg-neutral-950 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <p className="mt-3 text-[11px] leading-5 text-neutral-500">
                {completedFields === 6
                  ? "Required information is ready."
                  : "Complete the required fields to get started."}
              </p>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-red-600">
            <CircleHelp size={16} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-red-900">
              There is a problem with your project
            </p>
            <p className="mt-1 text-xs leading-5 text-red-700">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection
          number="01"
          icon={<BriefcaseBusiness size={18} />}
          title="Project information"
          description="Give the project a clear name, describe its goals, and add a cover image if available."
        >
          <div>
            <label htmlFor="project-title" className={labelClass}>
              Project name <span className="text-red-500">*</span>
            </label>

            <input
              id="project-title"
              required
              maxLength={160}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Company website redesign"
              className={`${inputClass} h-11`}
            />

            <div className="mt-2 flex items-center justify-between gap-3">
              <FieldHint>
                Choose a name your team will recognize.
              </FieldHint>
              <span className="shrink-0 text-[10px] tabular-nums text-neutral-400">
                {title.length}/160
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="project-description" className={labelClass}>
              Project description <span className="text-red-500">*</span>
            </label>

            <textarea
              id="project-description"
              required
              maxLength={3000}
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the project's goals, scope, and expected deliverables..."
              className={`${inputClass} min-h-[120px] resize-y py-3 leading-6`}
            />

            <div className="mt-2 flex items-center justify-between gap-3">
              <FieldHint>
                Include the main objective and expected outcome.
              </FieldHint>
              <span className="shrink-0 text-[10px] tabular-nums text-neutral-400">
                {description.length}/3000
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="project-image" className={labelClass}>
              Project cover image{" "}
              <span className="font-normal text-neutral-400">
                (optional)
              </span>
            </label>

            <label
              htmlFor="project-image"
              className="flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-neutral-300 bg-neutral-50 transition hover:border-neutral-500 hover:bg-neutral-100"
            >
              {imagePreview ? (
                <div className="relative w-full">
                  <img
                    src={imagePreview}
                    alt="Project cover preview"
                    className="h-48 w-full object-cover sm:h-56"
                  />
                  <span className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-3 py-2 text-xs font-medium text-neutral-800 shadow-sm">
                    Change image
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center px-6 py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700">
                    <ImagePlus size={22} />
                  </div>
                  <span className="mt-3 text-sm font-medium text-neutral-800">
                    Upload project cover
                  </span>
                  <span className="mt-1 text-xs text-neutral-500">
                    JPG, PNG or WebP · Maximum 5 MB
                  </span>
                </div>
              )}
            </label>

            <input
              id="project-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="sr-only"
            />

            {imageFile && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-3">
                <div className="flex min-w-0 items-center gap-2">
                  <CheckCircle2
                    size={16}
                    className="shrink-0 text-emerald-600"
                  />
                  <span className="truncate text-xs text-neutral-700">
                    {imageFile.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    const input = document.getElementById(
                      "project-image"
                    ) as HTMLInputElement | null;
                    if (input) input.value = "";
                  }}
                  className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}

            <FieldHint>
              The cover will be uploaded to Cloudinary under
              portal/projects.
            </FieldHint>
          </div>

          <div>
            <label htmlFor="project-type" className={labelClass}>
              Project type <span className="text-red-500">*</span>
            </label>

            <select
              id="project-type"
              required
              value={type}
              onChange={(event) => setType(event.target.value)}
              className={`${inputClass} h-11`}
            >
              <option value="">Choose a project type</option>
              {PROJECT_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </FormSection>

        <FormSection
          number="02"
          icon={<UserRound size={18} />}
          title="Client and schedule"
          description="Assign the project to an existing client and establish its timeline."
        >
          <div>
            <label htmlFor="project-client" className={labelClass}>
              Assign existing client{" "}
              <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <UserRound
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <select
                id="project-client"
                required
                value={clientId}
                onChange={(event) => {
                  setClientId(event.target.value);
                  setClientError("");
                }}
                disabled={loadingClients}
                className={`${inputClass} h-12 pl-10 ${
                  clientError
                    ? "border-red-300 focus:ring-red-50"
                    : ""
                }`}
                aria-invalid={Boolean(clientError)}
                aria-describedby={
                  clientError ? "project-client-error" : undefined
                }
              >
                <option value="">
                  {loadingClients
                    ? "Loading available clients..."
                    : clients.length === 0
                      ? "No clients available"
                      : "Select an existing client"}
                </option>

                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {[client.fname, client.lname]
                      .filter(Boolean)
                      .join(" ")}{" "}
                    — {client.email}
                  </option>
                ))}
              </select>
            </div>

            {clientError ? (
              <p
                id="project-client-error"
                className="mt-2 text-xs text-red-600"
              >
                {clientError}
              </p>
            ) : (
              <FieldHint>
                Choose a client account that already exists in the portal.
                This form does not create a new client account.
              </FieldHint>
            )}

            {!loadingClients && clients.length === 0 && (
              <p className="mt-2 text-xs leading-5 text-amber-700">
                No clients were returned by the users endpoint. Check that
                existing client accounts are available through
                /api/users?role=user.
              </p>
            )}

            {selectedClient && (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700">
                  {`${selectedClient.fname?.[0] ?? ""}${
                    selectedClient.lname?.[0] ?? ""
                  }`.toUpperCase() || "CL"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-neutral-900">
                    {[selectedClient.fname, selectedClient.lname]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-neutral-500">
                    {selectedClient.email}
                  </p>
                </div>

                <CheckCircle2
                  size={17}
                  className="shrink-0 text-emerald-600"
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="project-start" className={labelClass}>
                Start date <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <CalendarDays
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                  id="project-start"
                  type="date"
                  required
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  max={deadline || undefined}
                  className={`${inputClass} h-11 pl-10`}
                />
              </div>

              <FieldHint>When work began or is expected to begin.</FieldHint>
            </div>

            <div>
              <label htmlFor="project-deadline" className={labelClass}>
                Target completion date{" "}
                <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Clock3
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                  id="project-deadline"
                  type="date"
                  required
                  min={startDate || undefined}
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                  className={`${inputClass} h-11 pl-10`}
                />
              </div>

              <FieldHint>The intended delivery date.</FieldHint>
            </div>
          </div>
        </FormSection>

        <FormSection
          number="03"
          icon={<Sparkles size={18} />}
          title="Project status and progress"
          description="Record the current state of the project. This is useful when onboarding existing client work."
        >
          <div>
            <label htmlFor="project-status" className={labelClass}>
              Project status <span className="text-red-500">*</span>
            </label>

            <select
              id="project-status"
              required
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as ProjectStatus)
              }
              className={`${inputClass} h-11`}
            >
              {PROJECT_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <FieldHint>
              Choose the status that reflects the project's current stage.
            </FieldHint>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <label
                  htmlFor="project-progress"
                  className="block text-sm font-semibold text-neutral-900"
                >
                  Completion progress
                </label>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Enter the percentage of work already completed.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <input
                  id="project-progress"
                  type="number"
                  required
                  min={0}
                  max={100}
                  step={1}
                  inputMode="numeric"
                  value={progress}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === "") {
                      setProgress(0);
                      return;
                    }

                    const numericValue = Number(value);
                    if (Number.isFinite(numericValue)) {
                      setProgress(numericValue);
                    }
                  }}
                  className="h-11 w-24 rounded-xl border border-neutral-200 bg-white px-3 text-right text-sm font-semibold tabular-nums text-neutral-950 outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
                  aria-describedby="project-progress-hint"
                />
                <span className="text-sm font-medium text-neutral-500">
                  %
                </span>
              </div>
            </div>

            <div
              className="mt-5 h-2 overflow-hidden rounded-full bg-neutral-200"
              role="progressbar"
              aria-label="Project completion progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.max(0, Math.min(100, progress))}
            >
              <div
                className="h-full rounded-full bg-neutral-900 transition-all duration-300"
                style={{
                  width: `${Math.max(0, Math.min(100, progress))}%`,
                }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
              <span>0% · Not started</span>
              <span>100% · Complete</span>
            </div>

            <p id="project-progress-hint" className="mt-3 text-xs text-neutral-500">
              Use 0 for a new project, or enter its current completion
              percentage when bringing existing work into the portal.
            </p>
          </div>
        </FormSection>

        <div className="sticky bottom-3 z-20 rounded-2xl border border-neutral-200 bg-white/95 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5 px-1">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                <FileText size={15} />
              </div>

              <div>
                <p className="text-xs font-semibold text-neutral-900">
                  Ready to create your project?
                </p>
                <p className="mt-1 text-[11px] leading-5 text-neutral-500">
                  Your selected client, status, progress, and schedule will
                  be saved with the project.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/admin/projects")}
                disabled={submitting}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-50 sm:flex-none"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || loadingClients}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-xs font-medium text-white shadow-sm transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={14} className="animate-spin" />
                    Creating project…
                  </>
                ) : (
                  <>
                    Create project
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
};
