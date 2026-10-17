
export type TaskStatus =
| "Pending"
| "In Progress"
| "Completed"
| "On Hold"
| "Cancelled";

export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export type TaskAssignee = "client" | "admin";

export interface TaskPerson {
_id: string;
fname: string;
lname: string;
email?: string;
image?: string | null;
role?: "user" | "admin";
}

export interface TaskProject {
_id: string;
title: string;
client?: TaskPerson | string;
}

export interface AdminTask {
_id: string;
title: string;
description?: string;
project: TaskProject | string;
status: TaskStatus;
priority: TaskPriority;
assignedTo: TaskAssignee;
assignedUser?: TaskPerson | string | null;
createdBy?: TaskPerson | string;
dueDate?: string | null;
createdAt?: string;
updatedAt?: string;
completedAt?: string | null;
}

export const TASK_STATUSES: TaskStatus[] = [
"Pending",
"In Progress",
"Completed",
"On Hold",
"Cancelled",
];

export const TASK_PRIORITIES: TaskPriority[] = [
"Low",
"Medium",
"High",
"Urgent",
];

export function getTaskPersonName(
person?: TaskPerson | string | null
): string {
if (!person) return "Unassigned";
if (typeof person === "string") return "Workspace member";

return (
  [person.fname, person.lname].filter(Boolean).join(" ") ||
  person.email ||
  "Workspace member"
);
}

export function getTaskProjectTitle(
project?: TaskProject | string | null
): string {
if (!project) return "Unknown project";
if (typeof project === "string") return "Project";

return project.title || "Untitled project";
}

export function formatTaskDate(value?: string | null): string {
if (!value) return "—";

const date = new Date(value);
if (Number.isNaN(date.getTime())) return "—";

return new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
}).format(date);
}
