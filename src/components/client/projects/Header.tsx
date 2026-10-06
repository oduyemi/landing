"use client";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Project } from "./types";

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({
  project,
}: ProjectHeaderProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] font-semibold tracking-[-0.03em] text-[#171717]">
              {project.title}
            </h1>

            <MapPin
              className="h-3.5 w-3.5 text-[#999]"
              strokeWidth={1.7}
            />
          </div>

          <p className="mt-1 text-[11px] text-[#8a8a8a]">
            {project.type}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-[#eaf7ef] px-2.5 py-1 text-[9px] font-semibold text-[#35724b]">
          ● {project.status}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-[4px] flex-1 overflow-hidden rounded-full bg-[#ededed]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="h-full rounded-full bg-[#111]"
          />
        </div>

        <span className="text-[10px] font-medium text-[#777]">
          {project.progress}%
        </span>
      </div>
    </div>
  );
}