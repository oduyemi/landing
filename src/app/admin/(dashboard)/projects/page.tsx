
import type { Metadata } from "next";
import {ProjectsOverview} from "@/components/admin/projects/index";



export const metadata: Metadata = {
  title: "Projects | Admin Workspace",
  description: "View, filter, and manage client projects.",
};

export default function AdminProjects() {
  return <ProjectsOverview />;
}
