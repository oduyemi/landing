
"use client";
import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, Pencil, Settings2 } from "lucide-react";
import type { AdminProject } from "./types";
import { getProjectClientName } from "./types";
import {ProjectStatusBadge} from "./StatusBadge";
import {ProjectProgress} from "./Progress";


interface ProjectDetailHeaderProps {
  project: AdminProject;
  onEdit?: () => void;
  onSettings?: () => void;
}

export const ProjectDetailHeader =({
  project,
  onEdit,
  onSettings,
}: ProjectDetailHeaderProps) => {
  return (
    <section className="border-b border-[#eaeaea] pb-4">
      <Link
        href="/admin/projects"
        className="mb-4 inline-flex items-center gap-1.5 text-[9px] text-[#888] hover:text-[#222]"
      >
        <ArrowLeft size={11} />
        Project list
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] border border-[#e8e8e8] bg-[#fafafa] text-[#555]">
            <BriefcaseBusiness size={16} strokeWidth={1.5} />
          </span>

          <div className="min-w-0">
            <h1 className="text-[17px] font-semibold tracking-[-0.045em] text-[#191919]">
              {project.title}
            </h1>
            <p className="mt-1 text-[10px] text-[#888]">
              {project.type || "Project"} · {getProjectClientName(project.client)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ProjectStatusBadge status={project.status} />
              <div className="w-24">
                <ProjectProgress value={project.progress} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onEdit}
            disabled={!onEdit}
            className="inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-[#e5e5e5] px-2.5 text-[9px] font-medium text-[#444] hover:bg-[#f7f7f7] disabled:opacity-40"
          >
            <Pencil size={11} />
            Edit Project
          </button>
          <button
            type="button"
            aria-label="Project settings"
            onClick={onSettings}
            disabled={!onSettings}
            className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-[#e5e5e5] text-[#777] hover:bg-[#f7f7f7] disabled:opacity-40"
          >
            <Settings2 size={12} />
          </button>
        </div>
      </div>
    </section>
  );
}
