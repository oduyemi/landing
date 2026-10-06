"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Project } from "./types";

interface ProjectCardProps {
  project: Project;
  compact?: boolean;
}

export function ProjectCard({
  project,
  compact = false,
}: ProjectCardProps) {
  const isCompleted = project.status === "Completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Link
        href={`/client/projects/${project.id}`}
        className="block overflow-hidden rounded-[8px] border border-[#e6e6e6] bg-white transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
      >
        {/* Image */}
        <div
          className={[
            "relative overflow-hidden bg-[#f2f2f2]",
            compact ? "aspect-[1.7/1]" : "aspect-[1.8/1]",
          ].join(" ")}
        >
          {project.image ? (
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={[
                "object-cover transition-transform duration-500",
                "group-hover:scale-[1.025]",
                isCompleted ? "grayscale-[0.15]" : "",
              ].join(" ")}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[9px] text-[#999]">
              No image
            </div>
          )}

          {/* Status */}
          <span
            className={[
              "absolute right-3 top-3 rounded-full px-2.5 py-1",
              "text-[10px] font-semibold backdrop-blur-sm",
              isCompleted
                ? "bg-white/90 text-[#666]"
                : "bg-[#edf8f1]/95 text-[#35724b]",
            ].join(" ")}
          >
            {project.status}
          </span>

          {/* Progress */}
          {!isCompleted && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${project.progress}%`,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="h-full bg-[#111]"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-[12px] font-semibold tracking-[-0.015em] text-[#222]">
                {project.title}
              </h3>

              <p className="mt-1 text-[9px] text-[#999]">
                {project.type}
              </p>
            </div>

            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#e7e7e7] text-[#777] transition-colors group-hover:border-[#111] group-hover:bg-[#111] group-hover:text-white">
              <ArrowUpRight
                className="h-3 w-3"
                strokeWidth={1.7}
              />
            </span>
          </div>

          {!isCompleted && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[9px] text-[#999]">
                Progress
              </span>

              <span className="text-[9px] font-semibold text-[#444]">
                {project.progress}%
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}