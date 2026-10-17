
"use client";

import {
  type FormEvent,
  useId,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";

const PASSWORD_MIN_LENGTH = 8;

export const SecuritySettings = () => {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const passwordChecks = [
    {
      label: "At least 8 characters",
      valid: newPassword.length >= PASSWORD_MIN_LENGTH,
    },
    {
      label: "Different from your current password",
      valid:
        Boolean(currentPassword) &&
        newPassword !== currentPassword,
    },
    {
      label: "Confirmation matches",
      valid:
        Boolean(confirmPassword) &&
        newPassword === confirmPassword,
    },
  ];

  const lastLogin = user?.lastLogin
    ? new Date(user.lastLogin).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "No login activity available";

  const passwordReady =
    currentPassword.length > 0 &&
    newPassword.length >= PASSWORD_MIN_LENGTH &&
    newPassword !== currentPassword &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const currentPasswordError =
    attemptedSubmit && !currentPassword
      ? "Enter your current password."
      : "";

  const newPasswordError =
    attemptedSubmit && newPassword.length < PASSWORD_MIN_LENGTH
      ? "Use at least 8 characters."
      : attemptedSubmit && newPassword === currentPassword
        ? "Choose a password different from your current one."
        : "";

  const confirmPasswordError =
    attemptedSubmit &&
    confirmPassword !== newPassword
      ? "Your passwords do not match."
      : "";

  function clearFeedback() {
    setError("");
    setSuccess("");
  }

  function handlePasswordInput(
    setter: (value: string) => void,
    value: string,
  ) {
    setter(value);
    clearFeedback();
  }

  async function handlePasswordChange(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (saving) return;

    setAttemptedSubmit(true);
    clearFeedback();

    if (!currentPassword) {
      setError("Enter your current password to continue.");
      return;
    }

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      setError(
        "Your new password must contain at least 8 characters.",
      );
      return;
    }

    if (newPassword === currentPassword) {
      setError(
        "Your new password must differ from your current password.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Your new passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/auth/password", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to update your password.",
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setAttemptedSubmit(false);

      setSuccess(
        data?.message || "Your password has been updated successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-6">
      {/* Page heading */}
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-400">
          <span>Settings</span>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-700">Security</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
              Account security
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              Protect your administrator account and manage your
              sign-in credentials.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
            <ShieldCheck size={14} />
            Security settings
          </span>
        </div>
      </header>

      {/* Security overview */}
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm shadow-neutral-950/[0.025]">
        <div className="h-1 bg-gradient-to-r from-neutral-950 via-neutral-600 to-neutral-200" />

        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-neutral-800">
            <LockKeyhole size={25} strokeWidth={1.7} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-neutral-950">
                Administrator account
              </h2>

              <span className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[10px] font-semibold text-neutral-600">
                <BadgeCheck size={12} />
                ADMIN
              </span>
            </div>

            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-neutral-500">
              Your account has administrative permissions. Use a
              strong, unique password and keep your credentials private.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 sm:self-center">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-neutral-700">
              Password controls
            </span>
          </div>
        </div>
      </section>

      {/* Password form */}
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm shadow-neutral-950/[0.025]">
        <div className="flex items-start gap-3 border-b border-neutral-100 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700">
            <KeyRound size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-neutral-950">
              Change password
            </h2>
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Verify your current password before setting a new one.
            </p>
          </div>

          <span className="hidden rounded-lg border border-neutral-200 px-2.5 py-1 text-[10px] font-medium text-neutral-500 sm:inline-flex">
            Credentials
          </span>
        </div>

        <form
          onSubmit={handlePasswordChange}
          noValidate
          className="space-y-5 p-5 sm:p-6"
        >
          <PasswordField
            label="Current password"
            value={currentPassword}
            onChange={(value) =>
              handlePasswordInput(setCurrentPassword, value)
            }
            visible={showCurrent}
            onToggleVisibility={() =>
              setShowCurrent((value) => !value)
            }
            autoComplete="current-password"
            placeholder="Enter your current password"
            error={currentPasswordError}
            disabled={saving}
            required
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <PasswordField
              label="New password"
              value={newPassword}
              onChange={(value) =>
                handlePasswordInput(setNewPassword, value)
              }
              visible={showNew}
              onToggleVisibility={() =>
                setShowNew((value) => !value)
              }
              autoComplete="new-password"
              placeholder="Create a new password"
              minLength={PASSWORD_MIN_LENGTH}
              error={newPasswordError}
              disabled={saving}
              required
            />

            <PasswordField
              label="Confirm new password"
              value={confirmPassword}
              onChange={(value) =>
                handlePasswordInput(setConfirmPassword, value)
              }
              visible={showConfirm}
              onToggleVisibility={() =>
                setShowConfirm((value) => !value)
              }
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              minLength={PASSWORD_MIN_LENGTH}
              error={confirmPasswordError}
              disabled={saving}
              required
            />
          </div>

          {/* Password checklist */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4">
            <p className="text-xs font-semibold text-neutral-800">
              Password requirements
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {passwordChecks.map((check) => (
                <div
                  key={check.label}
                  className="flex items-center gap-2"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition ${
                      check.valid
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-neutral-200 text-neutral-500"
                    }`}
                  >
                    {check.valid ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </span>

                  <span
                    className={`text-[11px] ${
                      check.valid
                        ? "font-medium text-neutral-800"
                        : "text-neutral-500"
                    }`}
                  >
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

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

          <div className="flex flex-col gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] leading-5 text-neutral-400">
              You will need your current password to make this change.
            </p>

            <button
              type="submit"
              disabled={saving || !passwordReady}
              className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none sm:w-auto"
            >
              {saving ? (
                <LoaderCircle
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <KeyRound size={15} />
              )}

              {saving ? "Updating password..." : "Update password"}
            </button>
          </div>
        </form>
      </section>

      {/* Last login */}
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm shadow-neutral-950/[0.025]">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700">
            <Clock3 size={19} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-neutral-900">
              Last login
            </h2>
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              The most recent sign-in time available for your account.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 sm:min-w-[220px]">
            <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
              Recorded activity
            </p>
            <p className="mt-1.5 text-xs font-semibold text-neutral-800">
              {lastLogin}
            </p>
          </div>
        </div>
      </section>

      {/* Security reminder */}
      <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50/70 p-4">
        <ShieldCheck
          size={17}
          className="mt-0.5 shrink-0 text-neutral-500"
        />

        <div>
          <p className="text-xs font-semibold text-neutral-800">
            Keep your account secure
          </p>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Never share your password. If you suspect someone else
            has access to your account, change your password and
            review your authentication and session handling.
          </p>
        </div>
      </div>
    </div>
  );
};

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggleVisibility,
  autoComplete,
  placeholder,
  minLength,
  error,
  disabled = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisibility: () => void;
  autoComplete: string;
  placeholder?: string;
  minLength?: number;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const generatedId = useId();
  const inputId = `password-${generatedId}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="min-w-0">
      <label
        htmlFor={inputId}
        className="mb-2 block text-xs font-semibold text-neutral-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-11 w-full rounded-xl border bg-white px-3.5 pr-11 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500 ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50"
              : "border-neutral-200 hover:border-neutral-300 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
          }`}
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-neutral-400 transition hover:text-neutral-800 disabled:cursor-not-allowed"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
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
          {isError ? "Unable to update password" : "Password updated"}
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
