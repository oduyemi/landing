"use client";
import { InputHTMLAttributes } from "react";


interface AuthInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}


export const AuthInput = ({
  label,
  id,
  ...props
}: AuthInputProps) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[8px] font-medium text-neutral-700"
      >
        {label}
      </label>

      <input
        id={id}
        {...props}
        className="h-9 w-full rounded-[3px] border border-neutral-200 bg-white px-3 text-[9px] text-black outline-none transition-all placeholder:text-neutral-300 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-100"
      />
    </div>
  );
};