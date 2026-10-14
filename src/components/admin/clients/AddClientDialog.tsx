"use client";
import { useEffect, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import type { AdminClient } from "./ClientsTable";


type AccountRole = "user" | "admin";

interface AddClientDialogProps {
  open: boolean;
  client?: AdminClient | null;
  onClose: () => void;
  onSaved: (message: string, emailSent: boolean) => void;
}

interface FormState {
  fname: string;
  lname: string;
  email: string;
  role: AccountRole;
}

interface RegisterResponse {
  message?: string;
  error?: string;
  emailSent?: boolean;
  user?: {
    _id: string;
    role: AccountRole;
  };
}

export const AddClientDialog = ({
  open,
  client,
  onClose,
  onSaved,
}: AddClientDialogProps) => {
  const [form, setForm] = useState<FormState>({
    fname: "",
    lname: "",
    email: "",
    role: "user",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdMessage, setCreatedMessage] = useState("");
  const [createdEmailSent, setCreatedEmailSent] = useState(false);

  const editing = Boolean(client);

  useEffect(() => {
    if (!open) return;

    setForm({
      fname: client?.fname ?? "",
      lname: client?.lname ?? "",
      email: client?.email ?? "",
      role: client?.role === "admin" ? "admin" : "user",
    });

    setError("");
    setCreatedMessage("");
    setCreatedEmailSent(false);
  }, [open, client]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, saving, onClose]);

  if (!open) return null;

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const fieldClass =
    "mt-1.5 h-9 w-full rounded-[5px] border border-[#e5e5e5] bg-white px-3 text-[11px] text-[#333] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#aaa]";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (
      !form.fname.trim() ||
      !form.lname.trim() ||
      !form.email.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (editing) {
      setError(
        "Account editing uses a separate endpoint. This dialog currently creates accounts through registration."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fname: form.fname.trim(),
          lname: form.lname.trim(),
          email: form.email.trim().toLowerCase(),
          role: form.role,
        }),
      });

      const result = (await response.json()) as RegisterResponse;

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Unable to create this account."
        );
      }

      const message =
        result.message || "Account created successfully.";

      const emailSent = result.emailSent !== false;

      // Refresh the list even when onboarding email delivery fails:
      // the account has already been created on the server.
      onSaved(message, emailSent);

      if (emailSent) {
        onClose();
      } else {
        setCreatedMessage(message);
        setCreatedEmailSent(false);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/25 p-4 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-dialog-title"
        className="w-full max-w-[420px] rounded-[8px] border border-[#e8e8e8] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.12)]"
      >
        <div className="flex items-start justify-between border-b border-[#ededed] px-5 py-4">
          <div>
            <h2
              id="client-dialog-title"
              className="text-[13px] font-semibold text-[#222]"
            >
              {editing ? "Edit account" : "Add account"}
            </h2>

            <p className="mt-1 text-[10px] text-[#888]">
              Create a client or administrator account.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close dialog"
            className="flex h-7 w-7 items-center justify-center rounded text-[#999] hover:bg-[#f5f5f5] hover:text-[#222] disabled:opacity-40"
          >
            <X size={15} />
          </button>
        </div>

        {createdMessage ? (
          <div className="space-y-4 p-5">
            <div className="rounded-[5px] border border-amber-200 bg-amber-50 p-3">
              <p className="text-[11px] font-medium text-amber-900">
                Account created, but email delivery failed
              </p>
              <p className="mt-1 text-[10px] leading-4 text-amber-800">
                {createdMessage}
              </p>
              <p className="mt-2 text-[10px] leading-4 text-amber-800">
                Do not submit this form again for the same email. The account
                already exists; retry the invitation through a separate
                invitation workflow.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="h-8 rounded-[5px] bg-[#111] px-4 text-[10px] font-medium text-white hover:bg-[#303030]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-[10px] font-medium text-[#555]">
                First name <span className="text-rose-500">*</span>
                <input
                  autoFocus
                  required
                  value={form.fname}
                  onChange={(event) =>
                    updateField("fname", event.target.value)
                  }
                  className={fieldClass}
                  placeholder="First name"
                  autoComplete="given-name"
                />
              </label>

              <label className="block text-[10px] font-medium text-[#555]">
                Last name <span className="text-rose-500">*</span>
                <input
                  required
                  value={form.lname}
                  onChange={(event) =>
                    updateField("lname", event.target.value)
                  }
                  className={fieldClass}
                  placeholder="Last name"
                  autoComplete="family-name"
                />
              </label>
            </div>

            <label className="block text-[10px] font-medium text-[#555]">
              Email address <span className="text-rose-500">*</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                className={fieldClass}
                placeholder="name@example.com"
                autoComplete="email"
              />
            </label>

            <label className="block text-[10px] font-medium text-[#555]">
              Account role <span className="text-rose-500">*</span>
              <select
                required
                value={form.role}
                onChange={(event) =>
                  updateField("role", event.target.value as AccountRole)
                }
                className={fieldClass}
              >
                <option value="user">Client</option>
                <option value="admin">Administrator</option>
              </select>
            </label>

            <p className="text-[9px] leading-4 text-[#999]">
              An onboarding email will provide the temporary sign-in code.
              The account will be required to complete its first-login flow.
            </p>

            {error && (
              <p
                role="alert"
                className="rounded-[5px] border border-rose-100 bg-rose-50 px-3 py-2 text-[10px] text-rose-700"
              >
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 border-t border-[#f0f0f0] pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="h-8 rounded-[5px] border border-[#e6e6e6] px-3.5 text-[10px] font-medium text-[#666] hover:bg-[#f7f7f7] disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-8 items-center justify-center gap-2 rounded-[5px] bg-[#111] px-4 text-[10px] font-medium text-white hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <LoaderCircle size={12} className="animate-spin" />
                )}
                {saving ? "Creating..." : "Create account"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
