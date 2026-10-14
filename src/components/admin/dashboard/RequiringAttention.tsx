
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CircleAlert } from "lucide-react";

type ProjectStatus =
  | "Planning"
  | "In Progress"
  | "Completed"
  | "On Hold"
  | "Cancelled";

interface AdminProject {
  _id: string;
  title: string;
  type?: string;
  status: ProjectStatus | string;
  progress?: number;
  deadline?: string | null;
  client?: {
    _id?: string;
    fname?: string;
    lname?: string;
    email?: string;
  } | string | null;
  updatedAt?: string;
}

interface ProjectsResponse {
  success?: boolean;
  projects?: AdminProject[];
  data?: AdminProject[] | { projects?: AdminProject[] };
  error?: string;
}

function getProjects(data: ProjectsResponse): AdminProject[] {
  if (Array.isArray(data.projects)) return data.projects;
  if (Array.isArray(data.data)) return data.data;
  if (data.data && !Array.isArray(data.data) && Array.isArray(data.data.projects)) {
    return data.data.projects;
  }
  return [];
}

function clientName(client: AdminProject["client"]) {
  if (!client) return "—";
  if (typeof client === "string") return "Client";
  return [client.fname, client.lname].filter(Boolean).join(" ") || "Client";
}

function formatDeadline(value?: string | null) {
  if (!value) return "Not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function isOverdue(project: AdminProject) {
  if (!project.deadline || project.status === "Completed" || project.status === "Cancelled") {
    return false;
  }

  const deadline = new Date(project.deadline);
  if (Number.isNaN(deadline.getTime())) return false;

  deadline.setHours(23, 59, 59, 999);
  return deadline.getTime() < Date.now();
}

function statusStyle(status: string, overdue: boolean) {
  if (overdue) return "border-rose-200 bg-rose-50 text-rose-700";

  switch (status) {
    case "Completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "In Progress":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "On Hold":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Planning":
      return "border-[#e8e8e8] bg-[#f8f8f8] text-[#666]";
    default:
      return "border-[#e8e8e8] bg-white text-[#666]";
  }
}

export default function ProjectsRequiringAttention() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/projects", {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Unable to load projects.");

        const data = (await response.json()) as ProjectsResponse;
        const allProjects = getProjects(data);

        const attentionProjects = allProjects
          .filter((project) => project.status !== "Completed" && project.status !== "Cancelled")
          .sort((a, b) => {
            const overdueDifference = Number(isOverdue(b)) - Number(isOverdue(a));
            if (overdueDifference !== 0) return overdueDifference;

            const deadlineA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
            const deadlineB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
            return deadlineA - deadlineB;
          })
          .slice(0, 5);

        setProjects(attentionProjects);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unable to load projects.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadProjects();
    return () => controller.abort();
  }, []);

  return (
    <section className="min-w-0 overflow-hidden rounded-[6px] border border-[#e8e8e8] bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-[#ededed] px-4 py-3.5">
        <div>
          <h2 className="text-[11px] font-semibold text-[#222]">
            Projects requiring attention
          </h2>
          <p className="mt-0.5 text-[9px] text-[#999]">
            Keep track of ongoing client work
          </p>
        </div>

        <Link
          href="/admin/projects"
          className="flex shrink-0 items-center gap-1 text-[9px] font-medium text-[#777] transition-colors hover:text-[#111]"
        >
          View all <ArrowRight size={11} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[610px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#f0f0f0] bg-[#fdfdfd]">
              {["Project", "Client", "Status", "Deadline", "Progress"].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-2.5 text-[9px] font-medium text-[#999]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading &&
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="border-b border-[#f2f2f2]">
                  {Array.from({ length: 5 }).map((__, cell) => (
                    <td key={cell} className="px-4 py-3">
                      <div className="h-3 animate-pulse rounded bg-[#f1f1f1]" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && error && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[10px] text-[#888]">
                  {error}{" "}
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="underline underline-offset-2"
                  >
                    Retry
                  </button>
                </td>
              </tr>
            )}

            {!loading && !error && projects.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <BriefcaseBusiness size={18} className="mx-auto text-[#bbb]" />
                  <p className="mt-2 text-[10px] text-[#888]">
                    No active projects need attention.
                  </p>
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              projects.map((project) => {
                const overdue = isOverdue(project);
                const progress = Math.min(100, Math.max(0, project.progress ?? 0));

                return (
                  <tr
                    key={project._id}
                    className="border-b border-[#f1f1f1] last:border-0 transition-colors hover:bg-[#fdfdfd]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/projects/${project._id}`}
                        className="block max-w-[150px] truncate text-[10px] font-medium text-[#333] hover:text-black hover:underline hover:underline-offset-2"
                      >
                        {project.title}
                      </Link>
                      {project.type && (
                        <p className="mt-1 max-w-[150px] truncate text-[9px] text-[#aaa]">
                          {project.type}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-[10px] text-[#666]">
                      {clientName(project.client)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 text-[8px] font-medium ${statusStyle(project.status, overdue)}`}
                      >
                        {overdue && <CircleAlert size={9} />}
                        {overdue ? "Overdue" : project.status}
                      </span>
                    </td>

                    <td className={`whitespace-nowrap px-4 py-3 text-[9px] ${overdue ? "font-medium text-rose-600" : "text-[#777]"}`}>
                      {formatDeadline(project.deadline)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex min-w-[95px] items-center gap-2">
                        <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[#ededed]">
                          <div
                            className="h-full rounded-full bg-[#333] transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="w-7 text-right text-[9px] tabular-nums text-[#777]">
                          {progress}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
