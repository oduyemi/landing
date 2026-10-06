"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays } from "lucide-react";

type ProjectStatus =
  | "Planning"
  | "In Progress"
  | "Completed"
  | "On Hold"
  | "Cancelled";

interface ProjectCardProps {
  id?: string;
  title: string;
  type: string;
  image?: string | null;
  progress: number;
  status: ProjectStatus;
  deadline: string;
  featured?: boolean;
  compact?: boolean;
}

const getStatusClasses = (status: ProjectStatus) => {
  switch (status) {
    case "In Progress":
      return "bg-[#eaf7ef] text-[#3f8a5c]";

    case "Completed":
      return "bg-[#f0f0f0] text-[#555]";

    case "On Hold":
      return "bg-[#fff6e5] text-[#a06b13]";

    case "Planning":
      return "bg-[#eef3ff] text-[#536b9f]";

    case "Cancelled":
      return "bg-[#fcecec] text-[#a34b4b]";

    default:
      return "bg-[#f0f0f0] text-[#555]";
  }
};

const formatDeadline = (deadline: string) => {
  const date = new Date(deadline);

  if (Number.isNaN(date.getTime())) {
    return deadline;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

export const ProjectCard = ({
  id,
  title,
  type,
  image,
  progress,
  status,
  deadline,
  featured = false,
  compact = false,
}: ProjectCardProps) => {
  const formattedDeadline = formatDeadline(deadline);

  const projectHref = id
    ? `/client/projects/${id}`
    : "/client/projects";

  if (compact) {
    return (
      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ x: 2 }}
        transition={{ duration: 0.18 }}
        className="group flex items-center gap-3 rounded-[6px] border border-[#e7e7e7] bg-white px-3.5 py-3"
      >
        <div className="relative h-[42px] w-[54px] shrink-0 overflow-hidden rounded-[4px] bg-[#eeeeee]">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes="54px"
              className="object-cover grayscale-[20%]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[7px] text-[#999]">
              No image
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[9px] font-semibold text-[#333]">
              {title}
            </h3>

            <span
              className={[
                "hidden rounded-full px-1.5 py-[2px] text-[6px] font-medium sm:inline-flex",
                getStatusClasses(status),
              ].join(" ")}
            >
              {status}
            </span>
          </div>

          <p className="mt-0.5 truncate text-[7px] text-[#999]">
            {type}
          </p>
        </div>

        <div className="hidden items-center gap-1 text-[7px] text-[#999] sm:flex">
          <CalendarDays
            className="h-2.5 w-2.5"
            strokeWidth={1.6}
          />
          {formattedDeadline}
        </div>

        <ArrowRight
          className="h-3 w-3 shrink-0 text-[#aaa] transition-transform group-hover:translate-x-0.5 group-hover:text-[#555]"
          strokeWidth={1.6}
        />
      </motion.article>
    );
  }

  return (
    <motion.article
      whileHover={{ y: -1 }}
      transition={{ duration: 0.18 }}
      className={[
        "rounded-[6px] border border-[#e7e7e7] bg-white",
        featured ? "p-5" : "p-4",
      ].join(" ")}
    >
      <div className="flex gap-4">
        <div
          className={[
            "relative shrink-0 overflow-hidden rounded-[4px] bg-[#e8e8e8]",
            featured
              ? "h-[92px] w-[116px]"
              : "h-[72px] w-[91px]",
          ].join(" ")}
        >
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes={featured ? "116px" : "91px"}
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[8px] text-[#999]">
              No image
            </div>
          )}

          {featured && (
            <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 backdrop-blur-sm">
              <span className="text-[6px] font-semibold uppercase tracking-[0.08em] text-[#333]">
                Active
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-[11px] font-semibold text-[#222]">
                {title}
              </h3>

              <p className="mt-0.5 text-[9px] text-[#777]">
                {type}
              </p>
            </div>

            <span
              className={[
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-[3px]",
                "text-[7px] font-medium",
                getStatusClasses(status),
              ].join(" ")}
            >
              <span className="h-[4px] w-[4px] rounded-full bg-current" />
              {status}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="h-[4px] flex-1 overflow-hidden rounded-full bg-[#e9e9e9]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{
                  duration: 0.7,
                  ease: "easeOut",
                }}
                className="h-full rounded-full bg-[#111]"
              />
            </div>

            <span className="w-[27px] text-right text-[10px] font-medium text-[#555]">
              {progress}%
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[7px] text-[#999]">
              Project progress
            </span>

            <span className="text-[10px] text-[#8a8a8a]">
              Deadline: {formattedDeadline}
            </span>
          </div>
        </div>
      </div>

      {featured && (
        <div className="mt-4 flex items-center justify-between border-t border-[#f0f0f0] pt-3">
          <span className="text-[7px] text-[#999]">
            Last updated recently
          </span>

          <Link
            href={projectHref}
            className="group flex items-center gap-1 text-[7px] font-medium text-[#555] transition-colors hover:text-[#111]"
          >
            Open project

            <ArrowRight
              className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5"
              strokeWidth={1.8}
            />
          </Link>
        </div>
      )}
    </motion.article>
  );
};