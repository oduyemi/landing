
"use client";

import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  BadgeCheck,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  ImagePlus,
  LoaderCircle,
  Mail,
  Save,
  ShieldCheck,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type ProfileValues = {
  fname: string;
  lname: string;
  email: string;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const ProfileSettings = () => {
  const { user, refreshUser } = useAuth();

  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");

  const [savedProfile, setSavedProfile] =
    useState<ProfileValues | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ProfileValues, string>>
  >({});

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(
    null,
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isBusy = saving || uploadingPhoto;

  const currentProfile = useMemo<ProfileValues>(
    () => ({
      fname: fname.trim(),
      lname: lname.trim(),
      email: email.trim(),
    }),
    [fname, lname, email],
  );

  useEffect(() => {
    if (!user) return;

    const initialProfile = {
      fname: user.fname ?? "",
      lname: user.lname ?? "",
      email: user.email ?? "",
    };

    setFname(initialProfile.fname);
    setLname(initialProfile.lname);
    setEmail(initialProfile.email);
    setSavedProfile(initialProfile);
    setFieldErrors({});
  }, [user]);

  // Release temporary preview URLs when the selected image changes.
  useEffect(() => {
    if (!photoPreview) return;

    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const isDirty = Boolean(
    savedProfile &&
      (currentProfile.fname !== savedProfile.fname.trim() ||
        currentProfile.lname !== savedProfile.lname.trim() ||
        currentProfile.email.toLowerCase() !==
          savedProfile.email.trim().toLowerCase()),
  );

  const fullName = [fname.trim(), lname.trim()]
    .filter(Boolean)
    .join(" ");

  const initials =
    `${fname.trim().charAt(0)}${lname.trim().charAt(0)}`
      .toUpperCase() || "AD";

  const image = photoPreview || user?.image || null;

  const completionItems = [
    { label: "First name", complete: Boolean(fname.trim()) },
    { label: "Last name", complete: Boolean(lname.trim()) },
    {
      label: "Email address",
      complete: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    },
    {
      label: "Profile photo",
      complete: Boolean(photoPreview || user?.image),
    },
  ];

  const completedCount = completionItems.filter(
    (item) => item.complete,
  ).length;

  const completionPercentage = Math.round(
    (completedCount / completionItems.length) * 100,
  );

  function clearFeedback() {
    setError("");
    setSuccess("");
  }

  function updateField(
    field: keyof ProfileValues,
    value: string,
  ) {
    clearFeedback();

    setFieldErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));

    if (field === "fname") setFname(value);
    if (field === "lname") setLname(value);
    if (field === "email") setEmail(value);
  }

  function validateProfile(): boolean {
    const errors: Partial<Record<keyof ProfileValues, string>> =
      {};

    if (!fname.trim()) {
      errors.fname = "Enter your first name.";
    } else if (fname.trim().length < 2) {
      errors.fname = "Your first name must contain at least 2 characters.";
    }

    if (!lname.trim()) {
      errors.lname = "Enter your last name.";
    } else if (lname.trim().length < 2) {
      errors.lname = "Your last name must contain at least 2 characters.";
    }

    if (!email.trim()) {
      errors.email = "Enter your email address.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      errors.email = "Enter a valid email address.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isBusy || !validateProfile()) return;

    if (!isDirty) {
      setSuccess("Your profile is already up to date.");
      return;
    }

    setSaving(true);
    clearFeedback();

    const submittedProfile = {
      fname: fname.trim(),
      lname: lname.trim(),
      email: email.trim(),
    };

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submittedProfile),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to save your profile.",
        );
      }

      setSavedProfile(submittedProfile);
      await refreshUser();

      setSuccess("Your profile has been updated successfully.");
      setFieldErrors({});
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handlePhotoSelection(file?: File) {
    if (!file || isBusy) return;

    clearFeedback();

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Choose a JPG, PNG or WebP image.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Your image must be 5 MB or smaller.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedPhoto(file);
    setPhotoPreview(previewUrl);
  }

  function cancelPhotoSelection() {
    setSelectedPhoto(null);
    setPhotoPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    clearFeedback();
  }

  async function uploadPhoto() {
    if (!selectedPhoto || isBusy) return;

    setUploadingPhoto(true);
    clearFeedback();

    try {
      const formData = new FormData();
      formData.append("file", selectedPhoto);

      const response = await fetch("/api/admin/settings/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to upload your profile photo.",
        );
      }

      await refreshUser();

      setSelectedPhoto(null);
      setPhotoPreview(null);

      setSuccess("Your profile photo has been updated.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while uploading your photo.",
      );
    } finally {
      setUploadingPhoto(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-6">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-400">
          <span>Settings</span>
          <ChevronRight size={13} />
          <span className="text-neutral-700">Personal profile</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
              Your profile
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              Manage your identity and contact information for
              your administrator account.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-emerald-800">
              Account active
            </span>
          </div>
        </div>
      </header>

      {/* Profile overview */}
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm shadow-neutral-950/[0.025]">
        <div className="h-1 bg-gradient-to-r from-neutral-950 via-neutral-600 to-neutral-200" />

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative shrink-0">
              <Avatar
                image={image}
                initials={initials}
                alt={fullName || "Administrator"}
                size="large"
              />

              <span className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-xl border-2 border-white bg-neutral-950 text-white shadow-sm">
                {uploadingPhoto ? (
                  <LoaderCircle
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <BadgeCheck size={15} />
                )}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold tracking-tight text-neutral-950">
                {fullName || "Administrator"}
              </p>

              <p className="mt-1 truncate text-sm text-neutral-500">
                {email || "No email address"}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-[10px] font-semibold text-neutral-700">
                  <ShieldCheck size={12} />
                  Administrator
                </span>

                {isDirty && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Unsaved changes
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile completion */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-neutral-800">
                  Profile completion
                </p>
                <p className="mt-1 text-[11px] text-neutral-500">
                  {completedCount} of {completionItems.length} completed
                </p>
              </div>

              <span className="text-xl font-semibold tracking-tight text-neutral-950">
                {completionPercentage}%
              </span>
            </div>

            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-200"
              role="progressbar"
              aria-label="Profile completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completionPercentage}
            >
              <div
                className="h-full rounded-full bg-neutral-900 transition-[width] duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <p className="mt-3 text-[10px] leading-4 text-neutral-500">
              {completionPercentage === 100
                ? "Your profile has all the essential details."
                : "Complete the remaining details to round out your profile."}
            </p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Personal information */}
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm shadow-neutral-950/[0.025]">
          <SectionHeading
            icon={<UserRound size={18} />}
            title="Personal information"
            description="Your name and primary contact details."
          />

          <div className="space-y-5 p-5 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="First name"
                value={fname}
                onChange={(value) => updateField("fname", value)}
                placeholder="Enter your first name"
                autoComplete="given-name"
                error={fieldErrors.fname}
                disabled={isBusy}
                required
              />

              <Field
                label="Last name"
                value={lname}
                onChange={(value) => updateField("lname", value)}
                placeholder="Enter your last name"
                autoComplete="family-name"
                error={fieldErrors.lname}
                disabled={isBusy}
                required
              />
            </div>

            <Field
              label="Email address"
              type="email"
              value={email}
              onChange={(value) => updateField("email", value)}
              placeholder="you@example.com"
              autoComplete="email"
              icon={<Mail size={15} />}
              error={fieldErrors.email}
              disabled={isBusy}
              required
            />

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700">
                  <ShieldCheck size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold text-neutral-800">
                      Administrator permissions
                    </p>
                    <span className="rounded-md bg-neutral-200 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-neutral-600">
                      ADMIN
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs leading-5 text-neutral-500">
                    Your role controls access to workspace
                    management features. It cannot be changed
                    from this page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Profile image */}
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm shadow-neutral-950/[0.025]">
          <SectionHeading
            icon={<ImagePlus size={18} />}
            title="Profile photo"
            description="Choose an image that represents you across your workspace."
          />

          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar
                image={image}
                initials={initials}
                alt="Profile photo preview"
                size="large"
              />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-900">
                  {selectedPhoto
                    ? "Preview your new photo"
                    : user?.image
                      ? "Your current photo"
                      : "Add a profile photo"}
                </p>

                <p className="mt-1.5 text-xs leading-5 text-neutral-500">
                  Choose a clear image. Your photo will be
                  uploaded only when you confirm the selection.
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-neutral-400">
                  <span className="rounded-md border border-neutral-200 px-2 py-1">
                    JPG
                  </span>
                  <span className="rounded-md border border-neutral-200 px-2 py-1">
                    PNG
                  </span>
                  <span className="rounded-md border border-neutral-200 px-2 py-1">
                    WebP
                  </span>
                  <span>Maximum 5 MB</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                {selectedPhoto ? (
                  <>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={cancelPhotoSelection}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                    >
                      <X size={14} />
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void uploadPhoto()}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uploadingPhoto ? (
                        <LoaderCircle
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <Upload size={14} />
                      )}
                      {uploadingPhoto
                        ? "Uploading..."
                        : "Upload photo"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-xs font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Camera size={15} />
                    Choose image
                  </button>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={isBusy}
              onChange={(event) => {
                handlePhotoSelection(event.target.files?.[0]);
              }}
            />

            {selectedPhoto && (
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-700">
                  <ImagePlus size={16} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-blue-900">
                    {selectedPhoto.name}
                  </p>
                  <p className="mt-1 text-[10px] text-blue-700">
                    {(selectedPhoto.size / (1024 * 1024)).toFixed(2)} MB
                    {" · "}Ready to upload
                  </p>
                </div>

                <Check size={16} className="shrink-0 text-blue-700" />
              </div>
            )}
          </div>
        </section>

        {/* Feedback */}
        {error && (
          <Feedback
            type="error"
            message={error}
            onDismiss={() => setError("")}
          />
        )}

        {success && (
          <Feedback
            type="success"
            message={success}
            onDismiss={() => setSuccess("")}
          />
        )}

        {/* Save bar */}
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-neutral-200/80 bg-white/95 px-4 py-4 backdrop-blur-xl sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-2 sm:backdrop-blur-none">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              {isDirty ? (
                <>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  <p className="text-xs text-neutral-500">
                    You have unsaved changes.
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle2
                    size={14}
                    className="shrink-0 text-emerald-600"
                  />
                  <p className="text-xs text-neutral-500">
                    Your saved profile is up to date.
                  </p>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={isBusy || !isDirty}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none sm:w-auto"
            >
              {saving ? (
                <LoaderCircle
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Save size={15} />
              )}
              {saving ? "Saving changes..." : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

function Avatar({
  image,
  initials,
  alt,
  size = "normal",
}: {
  image: string | null;
  initials: string;
  alt: string;
  size?: "normal" | "large";
}) {
  const sizeClass =
    size === "large" ? "h-[76px] w-[76px] sm:h-[84px] sm:w-[84px]" : "h-16 w-16";

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 font-semibold tracking-tight text-neutral-700 ring-4 ring-neutral-50 ${sizeClass} ${size === "large" ? "text-xl" : "text-lg"}`}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={alt}
          className="h-full w-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-neutral-100 px-5 py-4 sm:px-6 sm:py-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700">
        {icon}
      </div>

      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-neutral-900">
          {title}
        </h2>
        <p className="mt-1 text-xs leading-5 text-neutral-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete = "off",
  icon,
  error,
  disabled = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  icon?: ReactNode;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const inputId = `profile-${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}`;

  const errorId = `${inputId}-error`;

  return (
    <div className="min-w-0">
      <label
        htmlFor={inputId}
        className="mb-2 block text-xs font-semibold text-neutral-700"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
            {icon}
          </span>
        )}

        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-11 w-full rounded-xl border bg-white text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500 ${
            icon ? "pl-10 pr-3" : "px-3.5"
          } ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50"
              : "border-neutral-200 hover:border-neutral-300 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
          }`}
        />
      </div>

      {error && (
        <p
          id={errorId}
          className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-4 text-red-600"
        >
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function Feedback({
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
      className={`flex items-start gap-3 rounded-xl border p-4 ${
        isError
          ? "border-red-200 bg-red-50/80"
          : "border-emerald-200 bg-emerald-50/80"
      }`}
    >
      {isError ? (
        <AlertCircle
          size={17}
          className="mt-0.5 shrink-0 text-red-600"
        />
      ) : (
        <CheckCircle2
          size={17}
          className="mt-0.5 shrink-0 text-emerald-600"
        />
      )}

      <div className="min-w-0 flex-1">
        <p
          className={`text-xs font-semibold ${
            isError ? "text-red-800" : "text-emerald-800"
          }`}
        >
          {isError ? "Unable to complete your request" : "All set"}
        </p>

        <p
          className={`mt-1 break-words text-xs leading-5 ${
            isError ? "text-red-700" : "text-emerald-700"
          }`}
        >
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss message"
        className={`shrink-0 rounded-md p-1 transition ${
          isError
            ? "text-red-500 hover:bg-red-100"
            : "text-emerald-600 hover:bg-emerald-100"
        }`}
      >
        <X size={14} />
      </button>
    </div>
  );
}
