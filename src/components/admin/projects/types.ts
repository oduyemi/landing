
export type ProjectStatus =
| "Planning"
| "In Progress"
| "Completed"
| "On Hold"
| "Cancelled"
| "Client Review"
| "Awaiting Client";

export interface ProjectClient {
_id: string;
fname: string;
lname: string;
email: string;
image?: string;
}

export interface ProjectTaskItem {
_id: string;
title: string;
description?: string;
status?: string;
priority?: "Low" | "Medium" | "High" | "Urgent" | string;
dueDate?: string;
deadline?: string;
assignedTo?: string | { _id: string; fname?: string; lname?: string };
createdAt?: string;
updatedAt?: string;
}

export interface ProjectMilestone {
_id?: string;
title: string;
description?: string;
dueDate?: string;
status?: "Pending" | "In Progress" | "Completed" | string;
}

export interface AdminProject {
_id: string;
title: string;
type: string;
description?: string;
progress: number;
status: ProjectStatus | string;
startDate?: string;
deadline?: string;
client: string | ProjectClient;
cloudinaryFolder?: string;
createdAt?: string;
updatedAt?: string;
milestones?: ProjectMilestone[];
tasks?: ProjectTaskItem[];
}

export interface ProjectActivity {
id: string;
title: string;
description?: string;
type?: string;
createdAt: string;
href?: string;
}

export const PROJECT_STATUSES: ProjectStatus[] = [
"Planning",
"In Progress",
"Client Review",
"Awaiting Client",
"On Hold",
"Completed",
"Cancelled",
];

export const PROJECT_TYPES = [
"Website Development",
"Web Application",
"UI/UX Design",
"Brand Identity",
"E-commerce",
"Maintenance",
"Other",
] as const;

export function getProjectClientName(
client: AdminProject["client"]
): string {
if (typeof client === "string") return "Client";

return [client?.fname, client?.lname].filter(Boolean).join(" ") || "Client";
}

export function getProjectClientId(
client: AdminProject["client"]
): string {
return typeof client === "string" ? client : client?._id ?? "";
}

export function clampProgress(progress?: number): number {
const value = Number(progress ?? 0);
return Number.isFinite(value)
  ? Math.max(0, Math.min(100, Math.round(value)))
  : 0;
}

export function formatProjectDate(value?: string): string {
if (!value) return "—";

const date = new Date(value);
if (Number.isNaN(date.getTime())) return "—";

return new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
}).format(date);
}

export function getProjectId(value: unknown): string {
if (typeof value === "string") return value;

if (value && typeof value === "object" && "_id" in value) {
  const id = (value as { _id?: unknown })._id;
  return typeof id === "string" ? id : "";
}

return "";
}
