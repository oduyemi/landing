
"use client";
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";
import type { AdminProject } from "./types";
import {formatProjectDate, getProjectClientName} from "./types";
import {ProjectStatusBadge} from "./StatusBadge";
import {ProjectProgress} from "./Progress";


interface ProjectsTableProps {
  projects: AdminProject[];
  loading?: boolean;
}


function relativeDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const days = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;

  return formatProjectDate(value);
}

export const ProjectsTable = ({
  projects,
  loading = false,
}: ProjectsTableProps) => {
  return (
    <div className="overflow-hidden rounded-[7px] border border-[#e8e8e8] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#ededed] bg-[#fcfcfc]">
              {[
                "Project",
                "Client",
                "Status",
                "Progress",
                "Deadline",
                "Last updated",
                "",
              ].map((label) => (
                <th
                  key={label}
                  className="px-3 py-3 text-[9px] font-medium text-[#888]"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#f0f0f0]">
            {loading &&
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  {Array.from({ length: 7 }).map((__, cell) => (
                    <td key={cell} className="px-3 py-3.5">
                      <div className="h-3 w-16 animate-pulse rounded bg-[#f0f0f0]" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && projects.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center">
                  <BriefcaseBusiness
                    size={20}
                    className="mx-auto text-[#bbb]"
                    strokeWidth={1.5}
                  />
                  <p className="mt-2 text-[11px] font-medium text-[#444]">
                    No projects found
                  </p>
                  <p className="mt-1 text-[9px] text-[#999]">
                    Try changing your filters or create a project.
                  </p>
                </td>
              </tr>
            )}

            {!loading &&
              projects.map((project) => (
                <tr
                  key={project._id}
                  className="group transition-colors hover:bg-[#fcfcfc]"
                >
                  <td className="px-3 py-3">
                    <Link
                      href={`/admin/projects/${project._id}`}
                      className="flex min-w-0 items-center gap-2.5"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] border border-[#ededed] bg-[#fafafa] text-[#666]">
                        <BriefcaseBusiness size={12} />
                      </span>
                      <span className="min-w-0">
                        <span className="block max-w-[180px] truncate text-[10px] font-medium text-[#333] group-hover:text-black">
                          {project.title}
                        </span>
                        <span className="mt-0.5 block text-[9px] text-[#999]">
                          {project.type || "Project"}
                        </span>
                      </span>
                    </Link>
                  </td>

                  <td className="px-3 py-3 text-[10px] text-[#666]">
                    {getProjectClientName(project.client)}
                  </td>

                  <td className="px-3 py-3">
                    <ProjectStatusBadge status={project.status} />
                  </td>

                  <td className="px-3 py-3">
                    <ProjectProgress value={project.progress} />
                  </td>

                  <td className="px-3 py-3 text-[9px] text-[#777]">
                    {formatProjectDate(project.deadline)}
                  </td>

                  <td className="px-3 py-3 text-[9px] text-[#999]">
                    {relativeDate(project.updatedAt || project.createdAt)}
                  </td>

                  <td className="px-3 py-3 text-right">
                    <Link
                      href={`/admin/projects/${project._id}`}
                      aria-label={`Open ${project.title}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#999] transition-colors hover:bg-[#f0f0f0] hover:text-[#222]"
                    >
                      <ArrowUpRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && projects.length > 0 && (
        <div className="border-t border-[#ededed] px-3 py-2.5 text-[9px] text-[#999]">
          Showing {projects.length} project{projects.length === 1 ? "" : "s"}
        </div>
      )}
    </div>
  );
}
