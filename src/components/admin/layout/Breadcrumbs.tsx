"use client";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";

const labels: Record<string, string> = {
  admin: "Dashboard",
  client: "Clients",
  clients: "Clients",
  projects: "Projects",
  tasks: "Tasks",
  files: "Files",
  messages: "Messages",
  notifications: "Notifications",
  activity: "Activity",
  profile: "Profile",
  settings: "Settings",
};

export default function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label =
      labels[segment] ??
      segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());

    return { href, label, isLast: index === segments.length - 1 };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5">
      <Link
        href="/admin"
        aria-label="Admin home"
        className="shrink-0 text-[#999] transition-colors hover:text-[#222]"
      >
        <Home size={13} strokeWidth={1.8} />
      </Link>

      {crumbs.map((crumb, index) => (
        <span key={crumb.href} className="flex min-w-0 items-center gap-1.5">
          <ChevronRight
            size={11}
            className="shrink-0 text-[#c2c2c2]"
          />
          {crumb.isLast ? (
            <span className="truncate text-[10px] font-medium text-[#292929]">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="truncate text-[10px] text-[#999] transition-colors hover:text-[#222]"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
