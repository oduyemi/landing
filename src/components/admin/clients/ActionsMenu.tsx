"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Ellipsis, ExternalLink, Mail, UserRound } from "lucide-react";


interface ClientActionsMenuProps {
  clientId: string;
  email: string;
  onEdit: () => void;
  onToggleStatus: () => void;
  disabled?: boolean;
}

export const ClientActionsMenu = ({
  clientId,
  email,
  onEdit,
  onToggleStatus,
  disabled = false,
}: ClientActionsMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const runAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div ref={menuRef} className="relative flex justify-end">
      <button
        type="button"
        aria-label="Client actions"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className="flex h-7 w-7 items-center justify-center rounded-[5px] text-[#888] transition-colors hover:bg-[#f2f2f2] hover:text-[#222] disabled:opacity-40"
      >
        <Ellipsis size={16} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-8 z-30 w-[170px] rounded-[6px] border border-[#e8e8e8] bg-white p-1 shadow-[0_8px_25px_rgba(0,0,0,0.08)]"
        >
          <Link
            role="menuitem"
            href={`/admin/clients/${clientId}`}
            onClick={() => setOpen(false)}
            className="flex h-8 items-center gap-2 rounded px-2.5 text-[10px] text-[#555] hover:bg-[#f6f6f6] hover:text-[#111]"
          >
            <ExternalLink size={12} />
            View client
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={() => runAction(onEdit)}
            className="flex h-8 w-full items-center gap-2 rounded px-2.5 text-left text-[10px] text-[#555] hover:bg-[#f6f6f6] hover:text-[#111]"
          >
            <UserRound size={12} />
            Edit client
          </button>

          <a
            role="menuitem"
            href={`mailto:${email}`}
            onClick={() => setOpen(false)}
            className="flex h-8 items-center gap-2 rounded px-2.5 text-[10px] text-[#555] hover:bg-[#f6f6f6] hover:text-[#111]"
          >
            <Mail size={12} />
            Send email
          </a>

          <div className="my-1 border-t border-[#eee]" />

          <button
            type="button"
            role="menuitem"
            onClick={() => runAction(onToggleStatus)}
            className="flex h-8 w-full items-center gap-2 rounded px-2.5 text-left text-[10px] text-[#555] hover:bg-[#f6f6f6] hover:text-[#111]"
          >
            Change account status
          </button>
        </div>
      )}
    </div>
  );
}
