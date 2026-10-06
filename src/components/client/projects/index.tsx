"use client";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { ProjectHeader } from "./Header";
import { ProjectClientCard } from "./ClientCard";
import { ProjectTabs, ProjectTab } from "./Tabs";
import { ProjectInfo } from "./Info";
import { ActionRequired } from "./ActionRequired";
import { Project } from "./types";
import { actionItems } from "./data";

interface ProjectOverviewProps {
  project: Project;
}

export function ProjectOverview({
  project,
}: ProjectOverviewProps) {
  const [activeTab, setActiveTab] =
    useState<ProjectTab>("Overview");

  return (
    <div className="min-h-full bg-white">
      <div className="mx-auto max-w-[1100px] px-5 py-7 sm:px-7 lg:px-9">
        {/* Back */}
        <Link
          href="/client/projects"
          className="mb-6 inline-flex items-center gap-1.5 text-[9px] font-medium text-[#777] transition-colors hover:text-[#111]"
        >
          <ArrowLeft
            className="h-3 w-3"
            strokeWidth={1.7}
          />

          Back to Projects
        </Link>

        {/* Header */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_235px]">
          <ProjectHeader project={project} />
          <ProjectClientCard project={project} />
        </div>

        {/* Tabs */}
        <div className="mt-7">
          <ProjectTabs
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Overview */}
        {activeTab === "Overview" && (
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
            <ProjectInfo project={project} />

            <ActionRequired items={actionItems} />
          </div>
        )}

        {/* Placeholder tabs */}
        {activeTab !== "Overview" && (
          <div className="mt-5 flex min-h-[240px] items-center justify-center rounded-[8px] border border-dashed border-[#e1e1e1]">
            <div className="text-center">
              <p className="text-[11px] font-medium text-[#444]">
                {activeTab}
              </p>

              <p className="mt-1 text-[9px] text-[#999]">
                This project section is coming next.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}