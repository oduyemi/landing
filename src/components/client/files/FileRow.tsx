"use client";
import { MoreHorizontal } from "lucide-react";
import type { ClientFile } from "./data";

interface FileRowProps {
  file: ClientFile;
}

export const FileRow = ({ file }: FileRowProps) => {
  const Icon = file.icon;
  const isDeliverable = file.category === "Deliverables";

  return (
    <div className="group flex items-center gap-3 border-b border-[#eeeeee] px-4 py-3 last:border-b-0 hover:bg-[#fafafa] sm:px-5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] border border-[#e7e7e7] bg-white">
        <Icon
          className="h-3.5 w-3.5 text-[#555]"
          strokeWidth={1.5}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-medium text-[#252525]">
          {file.name}
        </p>

        <p className="mt-0.5 text-[10px] text-[#999]">
          {file.type} · {file.size}
        </p>
      </div>

      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-[10px] text-[#999]">
          {isDeliverable ? "Shared" : "Uploaded"} {file.uploadedAt}
        </p>
      </div>

      <button
        type="button"
        aria-label={`More options for ${file.name}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#999] transition-colors hover:bg-[#eeeeee] hover:text-[#333]"
      >
        <MoreHorizontal
          className="h-3.5 w-3.5"
          strokeWidth={1.7}
        />
      </button>
    </div>
  );
}