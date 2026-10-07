export type ProjectStatus =
  | "Planning"
  | "In Progress"
  | "Completed"
  | "On Hold"
  | "Cancelled";

export interface Project {
  id: string;
  title: string;
  type: string;
  image?: string | null;
  progress: number;
  status: ProjectStatus;
  startDate: string;
  deadline: string;
  description: string;
  client: {
    id?: string;
    fname: string;
    lname: string;
    image?: string;
    email: string;
  };
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
}