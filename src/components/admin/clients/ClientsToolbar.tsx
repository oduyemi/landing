"use client";
import { Search, UserPlus } from "lucide-react";
import type { ClientStatus } from "./ClientStatusBadge";

export type ClientFilter = "All" | ClientStatus;

interface ClientsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: ClientFilter;
  onFilterChange: (value: ClientFilter) => void;
  onAddClient: () => void;
}

const filters: ClientFilter[] = ["All", "Active", "Invited", "Disabled"];

export const ClientsToolbar = ({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onAddClient,
}: ClientsToolbarProps) => {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-center">
        <label className="flex h-[34px] min-w-0 items-center gap-2 rounded-[5px] border border-[#e7e7e7] bg-white px-3 sm:w-[250px]">
          <Search size={13} className="shrink-0 text-[#999]" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search clients..."
            aria-label="Search clients"
            className="min-w-0 flex-1 bg-transparent text-[10px] text-[#333] outline-none placeholder:text-[#aaa]"
          />
        </label>

        <div
          role="group"
          aria-label="Filter clients by status"
          className="flex flex-wrap items-center gap-1"
        >
          {filters.map((item) => {
            const active = filter === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => onFilterChange(item)}
                aria-pressed={active}
                className={[
                  "h-[30px] rounded-[5px] border px-3 text-[9px] font-medium transition-colors",
                  active
                    ? "border-[#111] bg-[#111] text-white"
                    : "border-[#e9e9e9] bg-white text-[#777] hover:border-[#ccc] hover:text-[#222]",
                ].join(" ")}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onAddClient}
        className="inline-flex h-[33px] shrink-0 items-center justify-center gap-2 self-start rounded-[5px] bg-[#111] px-3.5 text-[10px] font-medium text-white transition-colors hover:bg-[#303030] lg:self-auto"
      >
        <UserPlus size={12} strokeWidth={1.8} />
        Add Client
      </button>
    </div>
  );
}
