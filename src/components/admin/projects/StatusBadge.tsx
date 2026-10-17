import type { ProjectStatus } from "./types";



interface ProjectStatusBadgeProps {
  status?: ProjectStatus | string;
}



export const ProjectStatusBadge = ({status = "Planning"}: ProjectStatusBadgeProps) =>{
  const styles: Record<string, string> = {
    Planning: "border-[#e8e8e8] bg-[#f7f7f7] text-[#777]",
    "In Progress": "border-[#dce6f5] bg-[#f2f6fc] text-[#526b91]",
    "Client Review": "border-[#e5def5] bg-[#f7f4fc] text-[#755a9e]",
    "Awaiting Client": "border-[#efe5d2] bg-[#fcf8ef] text-[#8c764b]",
    Completed: "border-[#dce9df] bg-[#f2f7f3] text-[#52745a]",
    "On Hold": "border-[#e8e3d8] bg-[#f8f6f1] text-[#8a7c5c]",
    Cancelled: "border-[#ebdddd] bg-[#fbf4f4] text-[#986767]",
  };

  const className =
    styles[status] ?? "border-[#e8e8e8] bg-[#f7f7f7] text-[#777]";

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[9px] font-medium ${className}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
