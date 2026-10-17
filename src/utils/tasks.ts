import type { AdminTask, TaskProject, TaskPerson } from "@/components/admin/tasks/types";
  

export function getTaskProject(
    project: AdminTask["project"]
  ): TaskProject | null {
    return typeof project === "object" && project !== null
      ? project
      : null;
  }
  
  export function getTaskAssignee(
    assignedUser: AdminTask["assignedUser"]
  ): TaskPerson | null {
    return typeof assignedUser === "object" &&
      assignedUser !== null
      ? assignedUser
      : null;
  }
  
  export function getTaskCreator(
    createdBy: AdminTask["createdBy"]
  ): TaskPerson | null {
    return typeof createdBy === "object" &&
      createdBy !== null
      ? createdBy
      : null;
  }
  
  export function getFullName(
    user: TaskPerson | null | undefined
  ): string {
    if (!user) return "Unassigned";
  
    return [user.fname, user.lname]
      .filter(Boolean)
      .join(" ")
      .trim();
  }
  
  export function formatTaskDate(
    value?: string | null
  ): string {
    if (!value) return "—";
  
    const date = new Date(value);
  
    if (Number.isNaN(date.getTime())) return "—";
  
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }
  
  export function isTaskOverdue(task: AdminTask): boolean {
    if (!task.dueDate || task.status === "Completed") {
      return false;
    }
  
    const dueDate = new Date(task.dueDate);
  
    if (Number.isNaN(dueDate.getTime())) return false;
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
  
    return dueDate < today;
  }
  
export function getInitials(
    user: TaskPerson | null | undefined
  ): string {
    if (!user) return "?";
  
    return `${user.fname?.[0] ?? ""}${user.lname?.[0] ?? ""}`
      .toUpperCase() || "?";
}