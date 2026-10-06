import { Project } from "./types";

interface ProjectInfoProps {
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

export function ProjectInfo({
  project,
}: ProjectInfoProps) {
  const clientName =
    `${project.client.fname} ${project.client.lname}`.trim();

  return (
    <section className="rounded-[8px] border border-[#e8e8e8] bg-white p-5">
      <h2 className="text-[11px] font-semibold text-[#222]">
        Project Information
      </h2>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-[10px] text-[#999]">
            Client
          </dt>

          <dd className="mt-1 text-[9px] font-medium text-[#333]">
            {clientName || "Client"}
          </dd>
        </div>

        <div>
          <dt className="text-[10px] text-[#999]">
            Start Date
          </dt>

          <dd className="mt-1 text-[9px] font-medium text-[#333]">
            {formatDate(project.startDate)}
          </dd>
        </div>

        <div>
          <dt className="text-[10px] text-[#999]">
            Deadline
          </dt>

          <dd className="mt-1 text-[9px] font-medium text-[#333]">
            {formatDate(project.deadline)}
          </dd>
        </div>
      </dl>

      <div className="mt-5">
        <p className="text-[10px] text-[#999]">
          Description
        </p>

        <p className="mt-1.5 max-w-xl text-[9px] leading-[1.7] text-[#666]">
          {project.description || "No description provided."}
        </p>
      </div>
    </section>
  );
}