"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ClientsPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const ClientsPagination = ({
  page,
  pageSize,
  total,
  onPageChange,
}: ClientsPaginationProps) => {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 text-[9px] text-[#888] sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing <span className="font-medium text-[#555]">{start}–{end}</span> of{" "}
        <span className="font-medium text-[#555]">{total}</span> clients
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-7 w-7 items-center justify-center rounded border border-[#e8e8e8] bg-white hover:bg-[#f6f6f6] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={13} />
        </button>

        <span className="min-w-12 text-center tabular-nums">
          {page} / {pageCount}
        </span>

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="flex h-7 w-7 items-center justify-center rounded border border-[#e8e8e8] bg-white hover:bg-[#f6f6f6] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
