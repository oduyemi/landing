"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock3, FolderOpen, Search, SlidersHorizontal } from "lucide-react";
import { ProjectCard } from "./ProjectCard";


export type ProjectStatus = "In Progress" | "Completed";

export interface ClientProject {
  id: string;
  title: string;
  type: string;
  image: string;
  progress: number;
  status: ProjectStatus;
}

const projects: ClientProject[] = [
  {
    id: "cleo-astro",
    title: "Cleo Astro",
    type: "Web Application",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790690916/cleoastro.jpg",
    progress: 95,
    status: "In Progress",
  },
  {
    id: "rare-koncepts",
    title: "Rare Koncepts",
    type: "Website Development",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790689463/rarekoncepts.jpg",
    progress: 100,
    status: "Completed",
  },
  {
    id: "global-crossfire",
    title: "Global Crossfire Church",
    type: "Website Application",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790689374/gcc.jpg",
    progress: 92,
    status: "In Progress",
  },
  {
    id: "erekere",
    title: "Erékéré",
    type: "Web Application",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790689460/erekere.jpg",
    progress: 100,
    status: "Completed",
  },
  {
    id: "alaso",
    title: "Alaso",
    type: "Web Application",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790689294/alaso.jpg",
    progress: 96,
    status: "In Progress",
  },
  {
    id: "progrowing",
    title: "ProGrowing (Revamped)",
    type: "Web Application",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790689807/progrowing.jpg",
    progress: 100,
    status: "Completed",
  },
  {
    id: "sparkling-white",
    title: "Sparkling White",
    type: "Web Application",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790689795/sparklingwhite.jpg",
    progress: 100,
    status: "Completed",
  },
  {
    id: "docmarine-hs",
    title: "DocMarine HS (Revamped)",
    type: "Full Site Revamp",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790689345/docmarinehs.jpg",
    progress: 100,
    status: "Completed",
  },
  {
    id: "hustle-n-grind",
    title: "Hustle n Grind",
    type: "Website Development",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790690054/hustlengrind.jpg",
    progress: 100,
    status: "Completed",
  },
  {
    id: "idyll-consults",
    title: "Idyll Consults",
    type: "Website Development",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790689292/idyllconsults.jpg",
    progress: 100,
    status: "Completed",
  },
  {
    id: "slack-standup-bot",
    title: "Standup Bot for Slack Integration",
    type: "Software Integration",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790690192/slackbot.jpg",
    progress: 100,
    status: "Completed",
  },
  {
    id: "openai-chatbot",
    title: "OpenAI Chatbot",
    type: "AI Development",
    image:
      "https://res.cloudinary.com/notq0oia/image/upload/v1790690144/chatbot.png",
    progress: 100,
    status: "Completed",
  },
];

type Filter = "All" | "In Progress" | "Completed";

export const AllProjects = () => {
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const activeProjects = projects.filter((project) => project.status === "In Progress");
  const completedProjects = projects.filter((project) => project.status === "Completed");
  const filteredProjects = useMemo(() => {const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesFilter =
        filter === "All" || project.status === filter;

      const matchesSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.type.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  const filteredActiveProjects = filteredProjects.filter(
    (project) => project.status === "In Progress"
  );

  const filteredCompletedProjects = filteredProjects.filter(
    (project) => project.status === "Completed"
  );

  return (
    <div className="px-5 sm:px-7">
      {/* Page header */}
      <motion.section
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border-b border-[#eeeeee] pb-5 pt-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-[#f2f2f2]">
                <FolderOpen
                  className="h-3.5 w-3.5 text-[#555]"
                  strokeWidth={1.7}
                />
              </div>

              <div>
                <h1 className="text-[16px] font-semibold tracking-[-0.02em] text-[#181818]">
                  Projects
                </h1>

                <p className="mt-0.5 text-[10px] text-[#999]">
                  View and keep track of your projects.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#888]">
            <span>
              {projects.length} projects
            </span>

            <span className="h-1 w-1 rounded-full bg-[#cfcfcf]" />

            <span>
              {activeProjects.length} active
            </span>
          </div>
        </div>
      </motion.section>

      {/* Controls */}
      <section className="py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-[260px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#999]"
              strokeWidth={1.7}
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects..."
              className="h-9 w-full rounded-[6px] border border-[#e5e5e5] bg-white pl-9 pr-3 text-[9px] text-[#333] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#c8c8c8]"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 text-[10px] text-[#999] sm:flex">
              <SlidersHorizontal
                className="h-3 w-3"
                strokeWidth={1.6}
              />
              Filter
            </div>

            <div className="flex rounded-[6px] border border-[#e5e5e5] bg-white p-0.5">
              {(["All", "In Progress", "Completed"] as Filter[]).map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={[
                      "rounded-[4px] px-2.5 py-1.5 text-[10px] font-medium transition-colors",
                      filter === item
                        ? "bg-[#111] text-white"
                        : "text-[#777] hover:text-[#222]",
                    ].join(" ")}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Active projects */}
      {(filter === "All" || filter === "In Progress") &&
        filteredActiveProjects.length > 0 && (
          <ProjectSection
            title="Active Projects"
            description="Projects currently in development."
            icon={<Clock3 className="h-3.5 w-3.5" />}
            projects={filteredActiveProjects}
            featured
          />
        )}

      {/* Completed projects */}
      {(filter === "All" || filter === "Completed") &&
        filteredCompletedProjects.length > 0 && (
          <ProjectSection
            title="Completed Projects"
            description="Your previous projects and completed work."
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            projects={filteredCompletedProjects}
          />
        )}

      {/* Empty state */}
      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-[300px] flex-col items-center justify-center rounded-[7px] border border-dashed border-[#dedede] bg-white px-6 text-center"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f4f4]">
            <Search
              className="h-4 w-4 text-[#777]"
              strokeWidth={1.6}
            />
          </div>

          <h2 className="mt-3 text-[12px] font-semibold text-[#333]">
            No projects found
          </h2>

          <p className="mt-1 max-w-[230px] text-[8px] leading-4 text-[#999]">
            Try adjusting your search or selecting a different project
            status.
          </p>

          {(search || filter !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("All");
              }}
              className="mt-3 text-[10px] font-medium text-[#333] underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}

interface ProjectSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  projects: ClientProject[];
  featured?: boolean;
}

function ProjectSection({
  title,
  description,
  icon,
  projects,
  featured = false,
}: ProjectSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8"
    >
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#777]">
              {icon}
            </span>

            <h2 className="text-[11px] font-semibold text-[#222]">
              {title}
            </h2>

            <span className="flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#f1f1f1] px-1 text-[7px] font-semibold text-[#777]">
              {projects.length}
            </span>
          </div>

          <p className="mt-1 text-[8px] text-[#999]">
            {description}
          </p>
        </div>
      </div>

      <div
        className={[
          "grid gap-4",
          featured
            ? "grid-cols-1 xl:grid-cols-2"
            : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
        ].join(" ")}
      >
        <AnimatePresence mode="popLayout">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              featured={featured}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}