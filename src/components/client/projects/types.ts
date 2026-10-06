export type ProjectStatus =
  | "In Progress"
  | "Completed"
  | "On Hold";

export interface Project {
  id: string;
  title: string;
  type: string;
  image: string;
  progress: number;
  status: ProjectStatus;
  startDate: string;
  deadline: string;
  description: string;
  client: {
    name: string;
    email: string;
  };
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
}