
"use client";
import Link from "next/link";
import { CalendarDays, CheckCircle2, ClipboardList, FileUp, Plus } from "lucide-react";
import type { AdminProject, ProjectTaskItem } from "./types";
import { formatProjectDate, getProjectClientName } from "./types";
import {ProjectProgress} from "./Progress";

interface ProjectOverviewPanelProps {
  project: AdminProject;
  tasks?: ProjectTaskItem[];
  onAddTask?: () => void;
  onUploadFile?: () => void;
  onSendUpdate?: () => void;
}

export const ProjectOverviewPanel = ({
  project,
  tasks = [],
  onAddTask,
  onUploadFile,
  onSendUpdate,
}: ProjectOverviewPanelProps) => {
  const attentionTasks = tasks
    .filter((task) => task.status !== "Completed")
    .slice(0, 4);

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const quickActions = [
    { label: "Send update", icon: Plus, onClick: onSendUpdate },
    { label: "Add task", icon: ClipboardList, onClick: onAddTask },
    { label: "Upload files", icon: FileUp, onClick: onUploadFile },
  ];

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        <section className="rounded-[6px] border border-[#e8e8e8] bg-white">
          <div className="border-b border-[#eeeeee] px-4 py-3">
            <h2 className="text-[10px] font-semibold text-[#292929]">
              Project Information
            </h2>
          </div>

          <dl className="space-y-4 p-4">
            <div>
              <dt className="text-[9px] text-[#999]">Client</dt>
              <dd className="mt-1 text-[10px] text-[#444]">
                {getProjectClientName(project.client)}
              </dd>
            </div>

            <div>
              <dt className="text-[9px] text-[#999]">Project type</dt>
              <dd className="mt-1 text-[10px] text-[#444]">
                {project.type || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-[9px] text-[#999]">Start date</dt>
              <dd className="mt-1 inline-flex items-center gap-1.5 text-[10px] text-[#444]">
                <CalendarDays size={11} className="text-[#999]" />
                {formatProjectDate(project.startDate)}
              </dd>
            </div>

            <div>
              <dt className="text-[9px] text-[#999]">Deadline</dt>
              <dd className="mt-1 inline-flex items-center gap-1.5 text-[10px] text-[#444]">
                <CalendarDays size={11} className="text-[#999]" />
                {formatProjectDate(project.deadline)}
              </dd>
            </div>

            <div>
              <dt className="text-[9px] text-[#999]">Description</dt>
              <dd className="mt-1 whitespace-pre-wrap text-[10px] leading-5 text-[#666]">
                {project.description || "No project description has been added."}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[6px] border border-[#e8e8e8] bg-white p-4">
          <h2 className="text-[10px] font-semibold text-[#292929]">
            Quick Actions
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  disabled={!action.onClick}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-[#e5e5e5] px-2.5 text-[9px] text-[#555] transition-colors hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon size={11} />
                  {action.label}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="space-y-4">
        <section className="rounded-[6px] border border-[#e8e8e8] bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-semibold text-[#292929]">
              Progress
            </h2>
            <span className="text-[11px] font-semibold text-[#333]">
              {Math.max(0, Math.min(100, project.progress ?? 0))}%
            </span>
          </div>

          <div className="mt-3">
            <ProjectProgress value={project.progress} showLabel={false} size="md" />
          </div>

          <p className="mt-3 text-[9px] text-[#999]">
            {completedTasks} of {tasks.length} tasks completed
          </p>
        </section>

        <section className="rounded-[6px] border border-[#e8e8e8] bg-white">
          <div className="flex items-center justify-between border-b border-[#eeeeee] px-4 py-3">
            <h2 className="text-[10px] font-semibold text-[#292929]">
              Action Required
            </h2>
            <Link
              href="/admin/tasks"
              className="text-[9px] text-[#777] hover:text-[#111]"
            >
              View tasks
            </Link>
          </div>

          <div className="divide-y divide-[#f0f0f0] px-4">
            {attentionTasks.length === 0 ? (
              <div className="py-7 text-center">
                <CheckCircle2
                  size={17}
                  className="mx-auto text-[#799780]"
                />
                <p className="mt-2 text-[10px] text-[#555]">
                  No outstanding tasks
                </p>
              </div>
            ) : (
              attentionTasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex min-w-0 items-start gap-2">
                    <span className="mt-0.5 text-[#888]">
                      <ClipboardList size={12} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[10px] text-[#444]">
                        {task.title}
                      </p>
                      <p className="mt-0.5 text-[9px] text-[#999]">
                        {task.status || "Pending"}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/admin/tasks"
                    className="shrink-0 rounded-[4px] border border-[#e5e5e5] px-2 py-1 text-[9px] text-[#555] hover:bg-[#f7f7f7]"
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
