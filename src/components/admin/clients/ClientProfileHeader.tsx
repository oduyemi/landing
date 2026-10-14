"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, MoreHorizontal, Phone, Send, ShieldOff } from "lucide-react";
import { useState } from "react";
import type { ClientDetail } from "./ClientDetailTypes";
import {getClientFullName, getClientInitials, getClientStatus} from "./ClientDetailTypes";
import {ClientStatusBadge} from "./ClientStatusBadge";

interface ClientProfileHeaderProps {
  client: ClientDetail;
  onSendInvitation?: () => void;
  onToggleAccess?: () => void;
  onEdit?: () => void;
  busy?: boolean;
}

export const ClientProfileHeader =({
  client,
  onSendInvitation,
  onToggleAccess,
  onEdit,
  busy = false,
}: ClientProfileHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const name = getClientFullName(client);
  const status = getClientStatus(client);

  return (
    <section className="border-b border-[#eaeaea] pb-4">
      <Link
        href="/admin/clients"
        className="mb-5 inline-flex items-center gap-1.5 text-[9px] text-[#888] transition-colors hover:text-[#222]"
      >
        <ArrowLeft size={12} />
        Back to clients
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e5e5e5] bg-[#f0f0f0]">
            {client.image ? (
              <Image
                src={client.image}
                alt={name}
                width={88}
                height={88}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[13px] font-medium text-[#555]">
                {getClientInitials(client)}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-[17px] font-semibold tracking-[-0.045em] text-[#191919]">
                {name}
              </h1>
              <ClientStatusBadge status={status} />
            </div>

            <p className="mt-1 truncate text-[10px] text-[#888]">
              {client.email}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-[#777]">
              <span className="inline-flex items-center gap-1">
                <Mail size={10} />
                {client.email}
              </span>
              {client.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone size={10} />
                  {client.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
          <button
            type="button"
            onClick={onSendInvitation}
            disabled={!onSendInvitation || busy}
            className="inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-[#e5e5e5] bg-white px-2.5 text-[9px] font-medium text-[#444] transition-colors hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={11} />
            Send invitation
          </button>

          <button
            type="button"
            onClick={onToggleAccess}
            disabled={!onToggleAccess || busy}
            className="inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-[#e5e5e5] bg-white px-2.5 text-[9px] font-medium text-[#444] transition-colors hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShieldOff size={11} />
            {status === "Disabled" ? "Enable access" : "Disable access"}
          </button>

          <div className="relative">
            <button
              type="button"
              aria-label="More client actions"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
              className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-[#e5e5e5] bg-white text-[#666] hover:bg-[#f7f7f7]"
            >
              <MoreHorizontal size={14} />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close actions menu"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-9 z-20 w-36 rounded-[6px] border border-[#e8e8e8] bg-white p-1 shadow-lg">
                  <button
                    type="button"
                    disabled={!onEdit || busy}
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit?.();
                    }}
                    className="w-full rounded-[4px] px-2.5 py-2 text-left text-[10px] text-[#444] hover:bg-[#f6f6f6] disabled:opacity-40"
                  >
                    Edit account
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
