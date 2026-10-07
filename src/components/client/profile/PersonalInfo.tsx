"use client";
import { FormEvent, useEffect, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { motion } from "framer-motion";
import { ProfileAvatar } from "./Avatar";
import type { AuthUser } from "@/context/AuthContext";

interface PersonalInformationProps {
  user: AuthUser;
  onSaved?: () => Promise<AuthUser | null>;
}

export const PersonalInformation = ({
  user,
  onSaved,
}: PersonalInformationProps) => {
  const [firstName, setFirstName] =
    useState(user.fname ?? "");

  const [lastName, setLastName] =
    useState(user.lname ?? "");

  const [email, setEmail] =
    useState(user.email ?? "");

  const [phone, setPhone] =
    useState((user as AuthUser & {
      phone?: string;
    }).phone ?? "");

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    setFirstName(user.fname ?? "");
    setLastName(user.lname ?? "");
    setEmail(user.email ?? "");

    setPhone(
      (user as AuthUser & {
        phone?: string;
      }).phone ?? ""
    );
  }, [user]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch(
        "/api/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            fname: firstName.trim(),
            lname: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to update your profile."
        );
      }

      if (onSaved) {
        await onSaved();
      }

      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[600px]">
      <div className="mb-6">
        <h2 className="text-[11px] font-semibold text-[#222]">
          Personal information
        </h2>

        <p className="mt-1 text-[10px] leading-relaxed text-[#999]">
          Update the information associated with
          your client account.
        </p>
      </div>

      <div className="mb-7 flex items-start gap-5">
        <ProfileAvatar
          fname={user.fname}
          lname={user.lname}
          image={user.image}
        />

        <div className="pt-0.5">
          <p className="text-[10px] font-medium text-[#333]">
            {user.fname} {user.lname}
          </p>

          <p className="mt-1 text-[10px] text-[#999]">
            Client account
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="First name"
            value={firstName}
            onChange={setFirstName}
            placeholder="First name"
          />

          <FormField
            label="Last name"
            value={lastName}
            onChange={setLastName}
            placeholder="Last name"
          />
        </div>

        <FormField
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="client@company.com"
        />

        <FormField
          label="Phone number"
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="+234 801 234 5678"
        />

        {error && (
          <div className="rounded-[4px] border border-[#eadede] bg-[#fffafa] px-3 py-2">
            <p className="text-[10px] text-[#9a5555]">
              {error}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="min-h-[18px]">
            {saved && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 2,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="flex items-center gap-1 text-[10px] text-[#777]"
              >
                <Check
                  className="h-[10px] w-[10px]"
                  strokeWidth={1.8}
                />

                Changes saved
              </motion.div>
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

                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

const FormField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: FormFieldProps) => {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-medium text-[#555]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-8 w-full rounded-[4px] border border-[#e6e6e6] bg-white px-2.5 text-[12px] text-[#333] outline-none transition-colors placeholder:text-[#b5b5b5] focus:border-[#bdbdbd]"
      />
    </label>
  );
};