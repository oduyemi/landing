import { UserRound } from "lucide-react";
import { Project } from "./types";

interface ProjectClientCardProps {
  project: Project;
}

const formatDate = (date: string) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(parsed);
};

export function ProjectClientCard({
  project,
}: ProjectClientCardProps) {
  const clientName =
    `${project.client.fname} ${project.client.lname}`.trim();

  return (
    <div className="rounded-[8px] border border-[#e8e8e8] bg-white p-4">
      <p className="text-[9px] font-semibold text-[#555]">
        Client
      </p>

      <div className="mt-3 flex items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#efefef]">
          {project.client.image ? (
            <img
              src={project.client.image}
              alt={clientName}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound
              className="h-3.5 w-3.5 text-[#777]"
              strokeWidth={1.6}
            />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold text-[#222]">
            {clientName || "Client"}
          </p>

          <p className="truncate text-[10px] text-[#999]">
            {project.client.email}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <p className="text-[10px] text-[#999]">
            Start Date
          </p>

          <p className="mt-0.5 text-[9px] font-medium text-[#333]">
            {formatDate(project.startDate)}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-[#999]">
            Deadline
          </p>

          <p className="mt-0.5 text-[9px] font-medium text-[#333]">
            {formatDate(project.deadline)}
          </p>
        </div>
      </div>
    </div>
  );
}