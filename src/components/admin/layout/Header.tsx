"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, ChevronDown, Command, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AdminBreadcrumbs from "./Breadcrumbs";

interface AdminHeaderProps {
  onOpenSearch?: () => void;
}

export default function AdminHeader({
  onOpenSearch,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const fullName = [user?.fname, user?.lname]
    .filter(Boolean)
    .join(" ")
    .trim();

  const initials =
    `${user?.fname?.[0] ?? ""}${user?.lname?.[0] ?? ""}`
      .toUpperCase() || "A";

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = search.trim();
    if (!query) return;

    setMobileSearchOpen(false);
    router.push(`/admin/search?q=${encodeURIComponent(query)}`);
  };

  const openSearch = () => {
    if (onOpenSearch) {
      onOpenSearch();
      return;
    }

    setMobileSearchOpen(true);
  };

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-[68px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="min-w-0 flex-1 overflow-hidden pl-10 lg:pl-0">
          <AdminBreadcrumbs />
        </div>

        {/* Header actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          {/* Desktop search */}
          <form
            onSubmit={submitSearch}
            role="search"
            className="group hidden h-10 w-[200px] items-center gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50/70 px-3 transition-all duration-200 focus-within:border-neutral-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.035)] md:flex lg:w-[260px]"
          >
            <Search
              size={16}
              strokeWidth={1.8}
              className="shrink-0 text-neutral-400 transition-colors group-focus-within:text-neutral-800"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search workspace..."
              aria-label="Search admin workspace"
              className="min-w-0 flex-1 bg-transparent text-xs text-neutral-800 outline-none placeholder:text-neutral-400"
            />

            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-800"
              >
                <X size={13} />
              </button>
            ) : (
              <span className="flex shrink-0 items-center gap-1 rounded-md border border-neutral-200 bg-white px-1.5 py-1 text-[10px] font-medium text-neutral-400 shadow-sm">
                <Command size={10} />
                K
              </span>
            )}
          </form>

          {/* Mobile search */}
          <button
            type="button"
            onClick={openSearch}
            aria-label="Open search"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 md:hidden"
          >
            <Search size={18} strokeWidth={1.8} />
          </button>

          {/* Notifications */}
          <Link
            href="/admin/notifications"
            aria-label="Open notifications"
            aria-current={
              pathname.startsWith("/admin/notifications")
                ? "page"
                : undefined
            }
            className={[
              "relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
              pathname.startsWith("/admin/notifications")
                ? "bg-neutral-100 text-neutral-950"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950",
            ].join(" ")}
          >
            <Bell size={18} strokeWidth={1.8} />
          </Link>

          <span className="mx-1 hidden h-7 w-px bg-neutral-200 sm:block" />

          {/* Profile */}
          <Link
            href="/admin/settings"
            aria-label={`Open profile${fullName ? ` for ${fullName}` : ""}`}
            className="group flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={fullName || "Profile"}
                  width={72}
                  height={72}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[11px] font-semibold tracking-wide text-neutral-700">
                  {initials}
                </span>
              )}
            </span>

            <span className="hidden min-w-0 text-left xl:block">
              <span className="block max-w-[120px] truncate text-xs font-semibold text-neutral-800">
                {fullName || "Administrator"}
              </span>
              <span className="mt-0.5 block text-[10px] text-neutral-400">
                Administrator
              </span>
            </span>

            <ChevronDown
              size={14}
              className="hidden text-neutral-400 transition-transform group-hover:text-neutral-700 xl:block"
            />
          </Link>
        </div>
      </div>

      {/* Expandable mobile search, used when no external search modal exists */}
      {mobileSearchOpen && !onOpenSearch && (
        <div className="border-t border-neutral-100 bg-white px-4 py-3 md:hidden">
          <form
            onSubmit={submitSearch}
            role="search"
            className="flex h-11 items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 focus-within:border-neutral-400 focus-within:bg-white"
          >
            <Search
              size={17}
              className="shrink-0 text-neutral-400"
            />

            <input
              type="search"
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search workspace..."
              aria-label="Search admin workspace"
              className="min-w-0 flex-1 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
            />

            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              aria-label="Close search"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-200 hover:text-neutral-800"
            >
              <X size={16} />
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
