
"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MoreHorizontal, Users } from "lucide-react";
import {ClientStatus, ClientStatusBadge} from "./ClientStatusBadge";
import {ClientActionsMenu} from "./ActionsMenu";

export interface AdminClient {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  role?: "user" | "admin";
  image?: string;
  status?: string;
  disabled?: boolean;
  invited?: boolean;
  projectCount?: number;
  lastActivity?: string | null;
  createdAt?: string;
  lastLogin?: string | null;
}

interface ClientsTableProps {
  clients: AdminClient[];
  loading: boolean;
  onEdit: (client: AdminClient) => void;
  onToggleStatus: (client: AdminClient) => void;
}

function getStatus(client: AdminClient): ClientStatus {
  if (client.disabled || client.status?.toLowerCase() === "disabled") {
    return "Disabled";
  }

  if (client.invited || client.status?.toLowerCase() === "invited") {
    return "Invited";
  }

  return "Active";
}

function initials(client: AdminClient) {
  return `${client.fname?.[0] ?? ""}${client.lname?.[0] ?? ""}`.toUpperCase() || "C";
}

function formatActivity(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export const ClientsTable = ({
  clients,
  loading,
  onEdit,
  onToggleStatus,
}: ClientsTableProps) => {
  const [imageErrors, setImageErrors] = useState<string[]>([]);

  return (
    <div className="overflow-visible rounded-[6px] border border-[#e8e8e8] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#ededed] bg-[#fdfdfd]">
              {["Name", "Email", "Projects", "Status", "Last Activity", "Actions"].map(
                (label) => (
                  <th
                    key={label}
                    className="whitespace-nowrap px-4 py-3 text-[9px] font-medium text-[#888]"
                  >
                    {label}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, row) => (
                <tr key={row} className="border-b border-[#f1f1f1]">
                  {Array.from({ length: 6 }).map((__, column) => (
                    <td key={column} className="px-4 py-3.5">
                      <div className="h-3 animate-pulse rounded bg-[#f1f1f1]" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && clients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center">
                  <Users size={20} className="mx-auto text-[#bbb]" />
                  <p className="mt-2 text-[11px] font-medium text-[#555]">
                    No clients found
                  </p>
                  <p className="mt-1 text-[10px] text-[#999]">
                    Try another search or change the status filter.
                  </p>
                </td>
              </tr>
            )}

            {!loading &&
              clients.map((client) => {
                const status = getStatus(client);
                const name = `${client.fname} ${client.lname}`.trim();
                const showImage = Boolean(
                  client.image && !imageErrors.includes(client._id)
                );

                return (
                  <tr
                    key={client._id}
                    className="border-b border-[#f0f0f0] last:border-0 transition-colors hover:bg-[#fdfdfd]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/clients/${client._id}`}
                        className="flex min-w-[150px] items-center gap-2.5"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e7e7e7] bg-[#f1f1f1]">
                          {showImage ? (
                            <Image
                              src={client.image!}
                              alt={name}
                              width={56}
                              height={56}
                              unoptimized
                              onError={() =>
                                setImageErrors((current) =>
                                  current.includes(client._id)
                                    ? current
                                    : [...current, client._id]
                                )
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-[9px] font-semibold text-[#555]">
                              {initials(client)}
                            </span>
                          )}
                        </span>

                        <span className="max-w-[140px] truncate text-[10px] font-medium text-[#333] hover:text-black">
                          {name || "Unnamed client"}
                        </span>
                      </Link>
                    </td>

                    <td className="px-4 py-3 text-[10px] text-[#777]">
                      {client.email}
                    </td>

                    <td className="px-4 py-3 text-[10px] tabular-nums text-[#666]">
                      {client.projectCount ?? 0}
                    </td>

                    <td className="px-4 py-3">
                      <ClientStatusBadge status={status} />
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-[9px] text-[#999]">
                      {formatActivity(client.lastActivity ?? client.lastLogin)}
                    </td>

                    <td className="px-4 py-2">
                      <ClientActionsMenu
                        clientId={client._id}
                        email={client.email}
                        onEdit={() => onEdit(client)}
                        onToggleStatus={() => onToggleStatus(client)}
                      />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
