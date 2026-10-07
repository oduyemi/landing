"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, FolderOpen, Plus } from "lucide-react";
import { DashboardHeader } from "@/components/client/layout/Header";
import { StatCard } from "@/components/client/layout/StatsCard";
import { ProjectCard } from "@/components/client/layout/ProjectCard";
import { ActionRequired } from "@/components/client/layout/ActionRequired";
import { RecentActivity } from "@/components/client/layout/RecentActivities";

type ProjectStatus =
  | "Planning"
  | "In Progress"
  | "Completed"
  | "On Hold"
  | "Cancelled";

interface Project {
  _id: string;
  title: string;
  type: string;
  image?: string | null;
  progress: number;
  status: ProjectStatus;
  startDate: string;
  deadline: string;
  description?: string;
  cloudinaryFolder?: string;
  client: {
    _id: string;
    fname: string;
    lname: string;
    email: string;
    image?: string | null;
    role: "user" | "admin";
  };
  createdAt?: string;
  updatedAt?: string;
}

export function ClientDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/projects", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Unable to load your projects."
          );
        }

        setProjects(data.projects ?? []);
      } catch (error) {
        console.error("FETCH DASHBOARD PROJECTS ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load your projects."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const activeProjects = useMemo(
    () =>
      projects.filter(
        (project) => project.status !== "Completed"
      ),
    [projects]
  );

  const pastProjects = useMemo(
    () =>
      projects.filter(
        (project) => project.status === "Completed"
      ),
    [projects]
  );

  return (
    <div className="px-7">
      <DashboardHeader />

      <div className="pb-8 pt-3">
        {/* Welcome */}
        <motion.section
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-[14px] font-semibold tracking-[-0.02em] text-[#181818]">
                Hello
              </h1>

              <p className="mt-1 text-[9px] text-[#929292]">
                Here&apos;s what&apos;s happening with your projects.
              </p>
            </div>

            <span className="hidden text-[8px] text-[#aaa] sm:block">
              Client Portal
            </span>
          </div>
        </motion.section>

        {/* Overview */}
        <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          <StatCard
            value={activeProjects.length}
            label="Active Projects"
          />

          <StatCard
            value={1}
            label="Pending Action"
          />

          <StatCard
            value={3}
            label="Notifications"
          />

          <StatCard
            value={pastProjects.length}
            label="Past Projects"
          />
        </section>

        {/* Current Projects */}
        <section className="mt-7">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-[11px] font-semibold text-[#222]">
                Current Projects
              </h2>

              <p className="mt-1 text-[8px] text-[#999]">
                Projects currently being worked on
              </p>
            </div>

            <Link
              href="/client/projects"
              className="group flex items-center gap-1 text-[8px] font-medium text-[#777] transition-colors hover:text-[#111]"
            >
              View all

              <ArrowRight
                className="h-[10px] w-[10px] transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.8}
              />
            </Link>
          </div>

          {loading ? (
            <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-[150px] animate-pulse rounded-[6px] border border-[#e7e7e7] bg-white"
                />
              ))}
            </div>
          ) : error ? (
            <div className="mt-3 rounded-[6px] border border-[#f0d6d6] bg-[#fff8f8] px-6 py-10 text-center">
              <p className="text-[10px] font-medium text-[#a34b4b]">
                {error}
              </p>
            </div>
          ) : activeProjects.length > 0 ? (
            <div
              className={[
                "mt-3 grid gap-4",
                activeProjects.length > 1
                  ? "grid-cols-1 lg:grid-cols-2"
                  : "grid-cols-1",
              ].join(" ")}
            >
              {activeProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  id={project._id}
                  title={project.title}
                  type={project.type}
                  image={project.image}
                  progress={project.progress}
                  status={project.status}
                  deadline={project.deadline}
                  featured={activeProjects.length === 1}
                />
              ))}
            </div>
          ) : (
            <div className="mt-3 flex min-h-[150px] flex-col items-center justify-center rounded-[6px] border border-dashed border-[#dedede] bg-white px-6 text-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f5]">
                <FolderOpen
                  className="h-3.5 w-3.5 text-[#777]"
                  strokeWidth={1.6}
                />
              </div>

              <p className="mt-3 text-[10px] font-medium text-[#333]">
                No active projects
              </p>

              <p className="mt-1 max-w-[240px] text-[8px] leading-4 text-[#999]">
                Your completed projects will remain available
                in your project history.
              </p>
            </div>
          )}
        </section>

        {/* Activity / Action */}
        <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
          <ActionRequired />
          <RecentActivity />
        </section>

        {/* Past Projects */}
        {!loading && pastProjects.length > 0 && (
          <section className="mt-7">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-[11px] font-semibold text-[#222]">
                  Past Projects
                </h2>

                <p className="mt-1 text-[8px] text-[#999]">
                  Your completed project history
                </p>
              </div>

              <Link
                href="/client/projects"
                className="group flex items-center gap-1 text-[8px] font-medium text-[#777] transition-colors hover:text-[#111]"
              >
                View archive

                <ArrowRight
                  className="h-[10px] w-[10px] transition-transform group-hover:translate-x-0.5"
                  strokeWidth={1.8}
                />
              </Link>
            </div>

            <div className="mt-3 space-y-2">
              {pastProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  id={project._id}
                  title={project.title}
                  type={project.type}
                  image={project.image}
                  progress={project.progress}
                  status={project.status}
                  deadline={project.deadline}
                  compact
                />
              ))}
            </div>
          </section>
        )}

        {/* Future: Start another project */}
        <section className="mt-5">
          <button
            type="button"
            className="group flex w-full items-center justify-between rounded-[6px] border border-dashed border-[#dedede] bg-transparent px-4 py-3.5 text-left transition-colors hover:border-[#cfcfcf] hover:bg-white"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
                <Plus
                  className="h-3 w-3 text-[#666]"
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <p className="text-[9px] font-medium text-[#333]">
                  Start another project
                </p>

                <p className="mt-0.5 text-[7px] text-[#999]">
                  Have another idea or project in mind?
                </p>
              </div>
            </div>

            <ArrowRight
              className="h-3 w-3 text-[#999] transition-transform group-hover:translate-x-0.5 group-hover:text-[#333]"
              strokeWidth={1.7}
            />
          </button>
        </section>
      </div>
    </div>
  );
}