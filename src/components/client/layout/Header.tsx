"use client";
import { Bell, Search, UserRound } from "lucide-react";


export const DashboardHeader = () => {
  return (
    <header className="flex h-[48px] items-center justify-end gap-4">
      <div className="flex h-[32px] w-[178px] items-center gap-2 rounded-[6px] border border-[#e4e4e4] bg-white px-3">
        <Search className="h-[12px] w-[12px] text-[#9a9a9a]" />
        <input
          type="text"
          placeholder="Search projects..."
          className="w-full bg-transparent text-[10px] text-[#333] outline-none placeholder:text-[#a3a3a3]"
        />
      </div>

      <button
        type="button"
        className="flex h-7 w-7 items-center justify-center rounded-full text-[#333] transition-colors hover:bg-[#f4f4f4]"
      >
        <Bell className="h-[14px] w-[14px]" strokeWidth={1.8} />
      </button>

      {/* Profile */}
      <button
        type="button"
        className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#151515]"
      >
        <UserRound
          className="h-[13px] w-[13px] text-white"
          strokeWidth={1.8}
        />
      </button>
    </header>
  );
}