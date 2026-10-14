
export type ClientAccountStatus = "Active" | "Invited" | "Disabled";

export interface ClientDetail {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  image?: string;
  role: "user" | "admin";
  firstLogin?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;

  // Optional until these fields are added to the User model.
  phone?: string;
  company?: string;
  status?: ClientAccountStatus | string;
  disabled?: boolean;
  invited?: boolean;
}

export interface ClientProject {
  _id: string;
  title: string;
  type?: string;
  status?: "Planning" | "In Progress" | "Completed" | "On Hold" | "Cancelled" | string;
  progress?: number;
  startDate?: string;
  deadline?: string;
  updatedAt?: string;
  createdAt?: string;
  client?: string | { _id: string; fname?: string; lname?: string };
}

export interface ClientActivity {
  id: string;
  title: string;
  description?: string;
  type: "project" | "task" | "message" | "file" | "deliverable" | "system";
  action?: string;
  createdAt: string;
  href?: string;
  actorName?: string;
}

export const getClientFullName = (client: Pick<ClientDetail, "fname" | "lname">) => {
  return [client.fname, client.lname].filter(Boolean).join(" ").trim() || "Unnamed client";
}

export const getClientStatus = (client: ClientDetail): ClientAccountStatus => {
  if (client.disabled || client.status?.toLowerCase() === "disabled") {
    return "Disabled";
  }

  if (client.invited || client.status?.toLowerCase() === "invited") {
    return "Invited";
  }

  return "Active";
}

export const getClientInitials = (client: Pick<ClientDetail, "fname" | "lname">) => {
  return `${client.fname?.[0] ?? ""}${client.lname?.[0] ?? ""}`.toUpperCase() || "C";
}

export const formatClientDate = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export const formatRelativeTime = (value?: string | null) => {
  if (!value) return "No activity";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return formatClientDate(value);
}

export const getProjectProgress = (project: ClientProject) => {
  const value = Number(project.progress ?? 0);
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}
