"use client";
import { FormEvent, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";

interface SecuritySettingsProps {
  onChangePassword?: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
}

export const SecuritySettings = ({
  onChangePassword,
}: SecuritySettingsProps) => {
  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
  
    setError("");
    setSaved(false);
  
    if (!currentPassword || !newPassword) {
      setError(
        "Please complete all required password fields."
      );
      return;
    }
  
    if (newPassword.length < 8) {
      setError(
        "Your new password must contain at least 8 characters."
      );
      return;
    }
  
    if (newPassword !== confirmPassword) {
      setError(
        "The new passwords do not match."
      );
      return;
    }
  
    try {
      setSaving(true);
  
      const response = await fetch(
        "/api/auth/password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to change your password."
        );
      }
  
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
  
      setSaved(true);
  
      window.setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        error
      );
  
      setError(
        error instanceof Error
          ? error.message
          : "Unable to change your password."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[600px]">
      <div className="mb-6">
        <h2 className="text-[11px] font-semibold text-[#222]">
          Security
        </h2>

        <p className="mt-1 text-[10px] leading-relaxed text-[#999]">
          Keep your account secure by updating your
          password regularly.
        </p>
      </div>

      {/* Password section */}
      <div className="mb-7 rounded-[5px] border border-[#eeeeee]">
        <div className="flex items-center gap-3 border-b border-[#eeeeee] px-4 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e8e8e8] bg-[#fafafa]">
            <LockKeyhole
              className="h-3 w-3 text-[#555]"
              strokeWidth={1.6}
            />
          </div>

          <div>
            <p className="text-[12px] font-medium text-[#333]">
              Password
            </p>

            <p className="mt-0.5 text-[7px] text-[#999]">
              Update your account password.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 px-4 py-5"
        >
          <PasswordField
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            visible={showCurrent}
            onToggle={() =>
              setShowCurrent((value) => !value)
            }
          />

          <PasswordField
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            visible={showNew}
            onToggle={() =>
              setShowNew((value) => !value)
            }
          />

          <PasswordField
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showConfirm}
            onToggle={() =>
              setShowConfirm((value) => !value)
            }
          />

          {error && (
            <div className="rounded-[4px] border border-[#eadede] bg-[#fffafa] px-3 py-2">
              <p className="text-[10px] text-[#9a5555]">
                {error}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-1">
            <div>
              {saved && (
                <div className="flex items-center gap-1 text-[10px] text-[#777]">
                  <Check
                    className="h-[10px] w-[10px]"
                    strokeWidth={1.8}
                  />
                  Password updated
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex h-8 min-w-[120px] items-center justify-center gap-1.5 rounded-[4px] bg-[#111] px-4 text-[10px] font-medium text-white transition-colors hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle
                    className="h-[10px] w-[10px] animate-spin"
                    strokeWidth={1.8}
                  />
                  Updating...
                </>
              ) : (
                "Update password"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security information */}
      <div className="border-t border-[#eeeeee] pt-5">
        <p className="text-[10px] font-medium text-[#444]">
          Account security
        </p>

        <p className="mt-1 max-w-[480px] text-[10px] leading-relaxed text-[#999]">
          Never share your password with anyone. If you
          believe your account has been compromised,
          contact support immediately.
        </p>
      </div>
    </div>
  );
};

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
}

const PasswordField = ({
  label,
  value,
  onChange,
  visible,
  onToggle,
}: PasswordFieldProps) => {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-medium text-[#555]">
        {label}
      </span>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-8 w-full rounded-[4px] border border-[#e6e6e6] bg-white px-2.5 pr-8 text-[12px] text-[#333] outline-none transition-colors focus:border-[#bdbdbd]"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999] transition-colors hover:text-[#444]"
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
        >
          {visible ? (
            <EyeOff
              className="h-3 w-3"
              strokeWidth={1.6}
            />
          ) : (
            <Eye
              className="h-3 w-3"
              strokeWidth={1.6}
            />
          )}
        </button>
      </div>
    </label>
  );
};