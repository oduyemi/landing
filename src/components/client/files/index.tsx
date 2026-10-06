"use client";
import { useMemo, useState } from "react";
import { Check, ChevronDown, FileText, FolderOpen, Upload } from "lucide-react";
import { FileRow } from "./FileRow";
import { files, type FileCategory } from "./data";

type FileFilter = "All Files" | "Client Uploads" | "Deliverables";

const filters: FileFilter[] = [
  "All Files",
  "Client Uploads",
  "Deliverables",
];

export const ClientFiles = () => {
  const [filter, setFilter] = useState<FileFilter>("All Files");
  const [projectOpen, setProjectOpen] = useState(false);

  const filteredFiles = useMemo(() => {
    if (filter === "All Files") {
      return files;
    }

    return files.filter(
      (file) => file.category === filter as FileCategory
    );
  }, [filter]);

  const clientUploads = filteredFiles.filter(
    (file) => file.category === "Client Uploads"
  );

  const deliverables = filteredFiles.filter(
    (file) => file.category === "Deliverables"
  );

  return (
    <div className="min-h-full bg-[#fafafa]">
      <div className="mx-auto max-w-[1180px] px-5 py-8 sm:px-7 lg:px-9">
        {/* Header */}
        <header className="flex flex-col gap-5 border-b border-[#e8e8e8] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#999]">
              Client workspace
            </p>

            <div className="mt-1.5 flex items-center gap-2">
              <h1 className="text-[22px] font-semibold tracking-[-0.04em] text-[#171717]">
                Files
              </h1>

              <span className="rounded-full bg-[#ededed] px-1.5 py-0.5 text-[10px] font-medium text-[#777]">
                {files.length}
              </span>
            </div>

            <p className="mt-1 text-[10px] text-[#888]">
              Files shared between you and your project team.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Project selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProjectOpen((value) => !value)}
                className="flex h-9 items-center gap-2 rounded-[6px] border border-[#e3e3e3] bg-white px-3 text-[9px] font-medium text-[#444] transition-colors hover:border-[#ccc]"
              >
                <span className="max-w-[150px] truncate">
                  Global Crossfire Church
                </span>

                <ChevronDown
                  className={[
                    "h-3 w-3 text-[#999] transition-transform",
                    projectOpen ? "rotate-180" : "",
                  ].join(" ")}
                  strokeWidth={1.7}
                />
              </button>

              {projectOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-[220px] overflow-hidden rounded-[7px] border border-[#e5e5e5] bg-white p-1 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                  <button
                    type="button"
                    onClick={() => setProjectOpen(false)}
                    className="flex w-full items-center justify-between rounded-[5px] px-3 py-2.5 text-left text-[9px] text-[#333] hover:bg-[#f7f7f7]"
                  >
                    <span>Global Crossfire Church</span>
                    <Check
                      className="h-3 w-3 text-[#222]"
                      strokeWidth={1.8}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setProjectOpen(false)}
                    className="w-full rounded-[5px] px-3 py-2.5 text-left text-[9px] text-[#777] hover:bg-[#f7f7f7]"
                  >
                    View all projects
                  </button>
                </div>
              )}
            </div>

            {/* Upload */}
            <button
              type="button"
              className="flex h-9 items-center gap-1.5 rounded-[6px] bg-[#111] px-3 text-[9px] font-medium text-white transition-colors hover:bg-[#2a2a2a]"
            >
              <Upload
                className="h-3 w-3"
                strokeWidth={1.8}
              />
              Upload Files
            </button>
          </div>
        </header>

        {/* File navigation */}
        <div className="mt-6 flex items-center gap-1 border-b border-[#e8e8e8]">
          {filters.map((item) => {
            const active = filter === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={[
                  "relative px-3 pb-3 pt-1 text-[10px] font-medium transition-colors",
                  active
                    ? "text-[#111]"
                    : "text-[#999] hover:text-[#444]",
                ].join(" ")}
              >
                {item}

                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-[1.5px] rounded-full bg-[#111]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Files */}
        <div className="mt-7 space-y-8">
          {clientUploads.length > 0 && (
            <FileSection
              title="Client Uploads"
              icon={FolderOpen}
              files={clientUploads}
            />
          )}

          {deliverables.length > 0 && (
            <FileSection
              title="Deliverables"
              icon={FileText}
              files={deliverables}
            />
          )}
        </div>

        {filteredFiles.length === 0 && (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function FileSection({
  title,
  icon: Icon,
  files,
}: {
  title: string;
  icon: typeof FolderOpen;
  files: typeof import("./data").files;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Icon
          className="h-3.5 w-3.5 text-[#777]"
          strokeWidth={1.6}
        />

        <h2 className="text-[11px] font-semibold text-[#222]">
          {title}
        </h2>

        <span className="rounded-full bg-[#ededed] px-1.5 py-0.5 text-[10px] font-medium text-[#888]">
          {files.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-[8px] border border-[#e6e6e6] bg-white">
        {files.map((file) => (
          <FileRow key={file.id} file={file} />
        ))}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="mt-8 flex min-h-[260px] flex-col items-center justify-center rounded-[8px] border border-dashed border-[#ddd] bg-white text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f4f4]">
        <FileText
          className="h-4 w-4 text-[#999]"
          strokeWidth={1.6}
        />
      </div>

      <p className="mt-3 text-[11px] font-medium text-[#444]">
        No files found
      </p>

      <p className="mt-1 max-w-[230px] text-[9px] leading-4 text-[#999]">
        There are no files in this category yet.
      </p>
    </div>
  );
}