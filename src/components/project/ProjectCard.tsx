"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import type { ClientProject } from "./ProjectsPage";

interface ProjectCardProps {
  project: ClientProject;
  featured?: boolean;
}

export function ProjectCard({
  project,
  featured = false,
}: ProjectCardProps) {
  const isCompleted = project.status === "Completed";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -2 }}
      transition={{
        duration: 0.2,
        layout: {
          duration: 0.25,
        },
      }}
      className={[
        "group overflow-hidden rounded-[7px] border border-[#e5e5e5] bg-white",
        "transition-shadow duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.045)]",
      ].join(" ")}
    >
      {/* Image */}
      <div
        className={[
          "relative overflow-hidden bg-[#ededed]",
          featured
            ? "h-[190px] sm:h-[210px]"
            : "h-[150px] sm:h-[165px]",
        ].join(" ")}
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes={
            featured
              ? "(max-width: 768px) 100vw, 50vw"
              : "(max-width: 768px) 100vw, 33vw"
          }
          className={[
            "object-cover transition-transform duration-500",
            "group-hover:scale-[1.025]",
            isCompleted ? "grayscale-[12%]" : "",
          ].join(" ")}
        />

        {/* Image overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60" />

        {/* Status */}
        <div className="absolute left-3 top-3">
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-2 py-1",
              "border border-white/30 bg-white/90 backdrop-blur-md",
              "text-[7px] font-semibold",
              isCompleted
                ? "text-[#555]"
                : "text-[#32734a]",
            ].join(" ")}
          >
            {isCompleted ? (
              <CheckCircle2
                className="h-2.5 w-2.5"
                strokeWidth={1.8}
              />
            ) : (
              <Clock3
                className="h-2.5 w-2.5"
                strokeWidth={1.8}
              />
            )}

            {project.status}
          </span>
        </div>

        {/* Progress */}
        {!isCompleted && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="mb-1.5 flex items-center justify-between text-white">
              <span className="text-[7px] font-medium">
                Project progress
              </span>

              <span className="text-[7px] font-semibold">
                {project.progress}%
              </span>
            </div>

            <div className="h-[3px] overflow-hidden rounded-full bg-white/35">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${project.progress}%`,
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
                className="h-full rounded-full bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[11px] font-semibold tracking-[-0.01em] text-[#222]">
              {project.title}
            </h3>

            <p className="mt-1 text-[8px] text-[#888]">
              {project.type}
            </p>
          </div>

          <span className="shrink-0 text-[8px] font-medium text-[#999]">
            {project.progress}%
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#f0f0f0] pt-3">
          <span className="text-[7px] text-[#aaa]">
            {isCompleted
              ? "Project completed"
              : "Currently in development"}
          </span>

          <button
            type="button"
            className="group/link flex items-center gap-1 text-[7px] font-semibold text-[#555] transition-colors hover:text-[#111]"
          >
            View project

            <ArrowRight
              className="h-2.5 w-2.5 transition-transform group-hover/link:translate-x-0.5"
              strokeWidth={1.8}
            />
          </button>
        </div>
      </div>
    </motion.article>
  );
}