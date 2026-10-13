"use client";
import { useState } from "react";
import {Check, Download, ExternalLink, MoreHorizontal, Pencil, Trash2} from "lucide-react";
import {formatFileDate, formatFileSize, getCategoryLabel, getFileIcon, getApiError,  type ClientFile} from "./data";


interface FileRowProps {
  file: ClientFile;
  onChanged: () => void;
  onError: (message: string) => void;
}


export const FileRow = ({file, onChanged, onError}: FileRowProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const Icon = getFileIcon(file);

  async function updateFile(
    changes: Record<string, string | number>
  ) {
    setBusy(true);
    setMenuOpen(false);

    try {
      const response = await fetch(`/api/files/${file.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getApiError(payload, "Unable to update this file.")
        );
      }

      onChanged();
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Unable to update this file."
      );
    } finally {
      setBusy(false);
    }
  }

  async function renameFile() {
    const nextName = window.prompt("Enter a new file name:", file.name);

    if (nextName === null) return;

    const name = nextName.trim();

    if (!name || name === file.name) return;

    if (name.length > 180) {
      onError("The file name must be 180 characters or fewer.");
      return;
    }

    await updateFile({ name });
  }

  async function editDescription() {
    const nextDescription = window.prompt(
      "Edit file description:",
      file.description
    );

    if (nextDescription === null) return;

    if (nextDescription.length > 2000) {
      onError("The description must be 2,000 characters or fewer.");
      return;
    }

    await updateFile({ description: nextDescription });
  }

  async function deleteFile() {
    const confirmed = window.confirm(
      `Delete "${file.name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      setMenuOpen(false);
      return;
    }

    setBusy(true);
    setMenuOpen(false);

    try {
      const response = await fetch(`/api/files/${file.id}`, {
        method: "DELETE",
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getApiError(payload, "Unable to delete this file.")
        );
      }

      onChanged();
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Unable to delete this file."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="group flex items-center gap-3 border-b border-[#eeeeee] px-4 py-3 last:border-b-0 hover:bg-[#fafafa] sm:px-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border border-[#e7e7e7] bg-white">
        <Icon
          className="h-4 w-4 text-[#555]"
          strokeWidth={1.5}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[11px] font-medium text-[#252525]"
          title={file.name}
        >
          {file.name}
        </p>

        <p className="mt-1 truncate text-[10px] text-[#999]">
          {file.extension.toUpperCase() || "FILE"} ·{" "}
          {formatFileSize(file.size)}
          {file.category === "brand-asset" && file.assetType
            ? ` · ${file.assetType}`
            : ""}
        </p>

        {file.description && (
          <p className="mt-1 truncate text-[10px] text-[#777]">
            {file.description}
          </p>
        )}
      </div>

      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-[10px] text-[#777]">
          {getCategoryLabel(file.category)}
        </p>
        <p className="mt-1 text-[10px] text-[#999]">
          {formatFileDate(file.createdAt)}
        </p>
      </div>

      {file.url && (
        <a
          href={file.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${file.name}`}
          title="Open file"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#888] transition-colors hover:bg-[#eee] hover:text-[#222]"
        >
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.7} />
        </a>
      )}

      <div className="relative shrink-0">
        <button
          type="button"
          disabled={busy}
          aria-label={`More options for ${file.name}`}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#999] transition-colors hover:bg-[#eee] hover:text-[#333] disabled:opacity-50"
        >
          {busy ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#ddd] border-t-[#333]" />
          ) : (
            <MoreHorizontal
              className="h-4 w-4"
              strokeWidth={1.7}
            />
          )}
        </button>

        {menuOpen && (
          <>
            <button
              type="button"
              aria-label="Close file options"
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setMenuOpen(false)}
            />

            <div className="absolute right-0 top-full z-20 mt-1 w-[190px] overflow-hidden rounded-[7px] border border-[#e5e5e5] bg-white p-1 shadow-[0_10px_30px_rgba(0,0,0,0.09)]">
              {file.url && (
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2 rounded-[5px] px-3 py-2.5 text-left text-[10px] text-[#444] hover:bg-[#f6f6f6]"
                >
                  <Download className="h-3.5 w-3.5" />
                  Open / download
                </a>
              )}

              <button
                type="button"
                onClick={renameFile}
                className="flex w-full items-center gap-2 rounded-[5px] px-3 py-2.5 text-left text-[10px] text-[#444] hover:bg-[#f6f6f6]"
              >
                <Pencil className="h-3.5 w-3.5" />
                Rename file
              </button>

              <button
                type="button"
                onClick={editDescription}
                className="flex w-full items-center gap-2 rounded-[5px] px-3 py-2.5 text-left text-[10px] text-[#444] hover:bg-[#f6f6f6]"
              >
                <Check className="h-3.5 w-3.5" />
                Edit description
              </button>

              <div className="my-1 border-t border-[#eee]" />

              <button
                type="button"
                onClick={deleteFile}
                className="flex w-full items-center gap-2 rounded-[5px] px-3 py-2.5 text-left text-[10px] text-[#b42318] hover:bg-[#fff4f2]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete file
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};