"use client";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarDays } from "lucide-react";
import type { ClientProject } from "./ClientDetailTypes";
import { formatClientDate, getProjectProgress } from "./ClientDetailTypes";


interface ClientProjectsCardProps {
  projects: ClientProject[];
  loading?: boolean;
  onViewAll?: () => void;
  compact?: boolean;
}



function ProjectStatus({ status }: { status?: string }) {
  const value = status || "Planning";

  const style =
    value === "Completed"
      ? "bg-[#f1f7f2] text-[#507456]"
      : value === "On Hold" || value === "Cancelled"
        ? "bg-[#f5f5f5] text-[#858585]"
        : "bg-[#f2f4f7] text-[#667085]";

  return (
    <span className={`rounded-[3px] px-1.5 py-0.5 text-[8px] ${style}`}>
      {value}
    </span>
  );
}

export const ClientProjectsCard = ({
  projects,
  loading = false,
  onViewAll,
  compact = false,
}: ClientProjectsCardProps) => {
  const visibleProjects = compact ? projects.slice(0, 3) : projects;

  return (
    <section className="rounded-[6px] border border-[#e8e8e8] bg-white">
      <div className="flex items-center justify-between border-b border-[#eeeeee] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[10px] font-semibold text-[#292929]">
            Projects
          </h2>
          <span className="text-[9px] text-[#999]">({projects.length})</span>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-[9px] text-[#777] hover:text-[#111]"
        >
          View all <ArrowRight size={10} />
        </button>
      </div>

      <div className="divide-y divide-[#f0f0f0] px-4">
        {loading &&
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="space-y-2 py-4">
              <div className="h-3 w-2/3 animate-pulse rounded bg-[#f0f0f0]" />
              <div className="h-1.5 w-full animate-pulse rounded bg-[#f0f0f0]" />
            </div>
          ))}

        {!loading && visibleProjects.length === 0 && (
          <div className="py-8 text-center">
            <BriefcaseBusiness
              size={17}
              className="mx-auto text-[#bbb]"
              strokeWidth={1.5}
            />
            <p className="mt-2 text-[10px] text-[#777]">No projects yet</p>
            <p className="mt-1 text-[9px] text-[#aaa]">
              Projects assigned to this client will appear here.
            </p>
          </div>
        )}

        {!loading &&
          visibleProjects.map((project) => {
            const progress = getProjectProgress(project);

            return (
              <div key={project._id} className="py-3">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] border border-[#ededed] bg-[#fafafa]">
                    <BriefcaseBusiness size={11} className="text-[#777]" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/admin/projects/${project._id}`}
                        className="truncate text-[10px] font-medium text-[#333] hover:text-black"
                      >
                        {project.title}
                      </Link>
                      <span className="shrink-0 text-[9px] tabular-nums text-[#777]">
                        {progress}%
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <ProjectStatus status={project.status} />
                      {project.deadline && (
                        <span className="inline-flex items-center gap-1 text-[8px] text-[#999]">
                          <CalendarDays size={9} />
                          Due {formatClientDate(project.deadline)}
                        </span>
                      )}
                    </div>

                    <div
                      className="mt-2 h-[3px] overflow-hidden rounded-full bg-[#eeeeee]"
                      role="progressbar"
                      aria-label={`${project.title} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress}
                    >
                      <div
                        className="h-full rounded-full bg-[#222]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}
