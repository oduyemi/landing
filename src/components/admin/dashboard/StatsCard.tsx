
import type { LucideIcon } from "lucide-react";

interface DashboardStatCardProps {
  label: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  loading?: boolean;
  href?: string;
}

export default function DashboardStatCard({
  label,
  value,
  description,
  icon: Icon,
  loading = false,
  href,
}: DashboardStatCardProps) {
  const content = (
    <div className="flex h-full min-h-[100px] flex-col justify-between rounded-[6px] border border-[#e8e8e8] bg-white p-3.5 transition-colors hover:border-[#d7d7d7] sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-medium text-[#777]">{label}</p>
        <Icon size={14} strokeWidth={1.7} className="text-[#999]" />
      </div>

      {loading ? (
        <div className="mt-3 h-6 w-12 animate-pulse rounded bg-[#f0f0f0]" />
      ) : (
        <p className="mt-2 text-[24px] font-semibold leading-none tracking-[-0.055em] text-[#171717]">
          {value}
        </p>
      )}

      <p className="mt-2 text-[9px] leading-4 text-[#999]">
        {description}
      </p>
    </div>
  );

  if (!href) return content;

  return (
    <a
      href={href}
      className="block rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#999]"
    >
      {content}
    </a>
  );
}
