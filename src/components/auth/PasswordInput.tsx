"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";


interface PasswordInputProps {
  label: string;
  id: string;
  placeholder?: string;
  value?: string;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  required?: boolean;
}

export const PasswordInput = ({
  label,
  id,
  placeholder,
  value,
  onChange,
  required,
}: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[8px] font-medium text-neutral-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="h-9 w-full rounded-[3px] border border-neutral-200 bg-white px-3 pr-9 text-[9px] text-black outline-none transition-all placeholder:text-neutral-300 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-100"
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={
            visible ? "Hide password" : "Show password"
          }
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-black"
        >
          {visible ? (
            <EyeOff size={12} strokeWidth={1.5} />
          ) : (
            <Eye size={12} strokeWidth={1.5} />
          )}
        </button>
      </div>
    </div>
  );
};