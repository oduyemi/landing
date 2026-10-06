"use client";
import { CircleAlert } from "lucide-react";
import { ActionItem } from "./types";

interface ActionRequiredProps {
  items: ActionItem[];
}

export function ActionRequired({
  items,
}: ActionRequiredProps) {
  return (
    <section className="rounded-[8px] border border-[#e8e8e8] bg-white p-5">
      <h2 className="text-[11px] font-semibold text-[#222]">
        Action Required
      </h2>

      <div className="mt-4 divide-y divide-[#f1f1f1]">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5]">
              <CircleAlert
                className="h-2.5 w-2.5 text-[#555]"
                strokeWidth={1.8}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-medium text-[#333]">
                {item.title}
              </p>

              <p className="mt-0.5 truncate text-[10px] text-[#999]">
                {item.description}
              </p>
            </div>

            <button
              type="button"
              className="shrink-0 rounded-[4px] border border-[#e2e2e2] px-2.5 py-1 text-[10px] font-medium text-[#444] transition-colors hover:border-[#ccc] hover:bg-[#f7f7f7]"
            >
              View
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}