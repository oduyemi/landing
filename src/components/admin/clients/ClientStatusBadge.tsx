"use client";
import type { ClientAccountStatus } from "./ClientDetailTypes";

interface ClientStatusBadgeProps {
  status: ClientAccountStatus;
}

export type ClientStatus = "Active" | "Invited" | "Disabled";


const styles: Record<ClientAccountStatus, string> = {
  Active: "border-[#dce9df] bg-[#f3f8f4] text-[#46684d]",
  Invited: "border-[#e9e2d1] bg-[#fbf8f0] text-[#8b7444]",
  Disabled: "border-[#e6e6e6] bg-[#f4f4f4] text-[#777]",
};

export const ClientStatusBadge = ({
  status,
}: ClientStatusBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[9px] font-medium ${styles[status]}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
          status === "Active"
            ? "bg-[#62966d]"
            : status === "Invited"
              ? "bg-[#b39a61]"
              : "bg-[#999]"
        }`}
      />
      {status}
    </span>
  );
}
