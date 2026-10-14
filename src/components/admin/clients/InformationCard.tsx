"use client";
import { Building2, CalendarDays, Mail, Phone, UserRound } from "lucide-react";
import type { ClientDetail } from "./ClientDetailTypes";
import {formatClientDate, getClientFullName, getClientStatus} from "./ClientDetailTypes";
import {ClientStatusBadge} from "./ClientStatusBadge";

interface ClientInformationCardProps {
  client: ClientDetail;
}

export const ClientInformationCard = ({
  client,
}: ClientInformationCardProps) => {
  const details = [
    {
      label: "Full name",
      value: getClientFullName(client),
      icon: UserRound,
    },
    {
      label: "Email",
      value: client.email || "—",
      icon: Mail,
    },
    {
      label: "Phone number",
      value: client.phone || "—",
      icon: Phone,
    },
    {
      label: "Company",
      value: client.company || "—",
      icon: Building2,
    },
    {
      label: "Joined",
      value: formatClientDate(client.createdAt),
      icon: CalendarDays,
    },
  ];

  return (
    <section className="rounded-[6px] border border-[#e8e8e8] bg-white">
      <div className="border-b border-[#eeeeee] px-4 py-3">
        <h2 className="text-[10px] font-semibold text-[#292929]">
          Client Information
        </h2>
      </div>

      <div className="space-y-4 p-4">
        {details.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label}>
              <p className="mb-1 text-[9px] text-[#999]">{item.label}</p>
              <div className="flex min-w-0 items-center gap-1.5">
                <Icon
                  size={11}
                  strokeWidth={1.6}
                  className="shrink-0 text-[#999]"
                />
                <p className="min-w-0 break-words text-[10px] text-[#444]">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}

        <div>
          <p className="mb-1.5 text-[9px] text-[#999]">Status</p>
          <ClientStatusBadge status={getClientStatus(client)} />
        </div>
      </div>
    </section>
  );
}
