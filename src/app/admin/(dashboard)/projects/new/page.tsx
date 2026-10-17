
import type { Metadata } from "next";
import {ProjectForm} from "@/components/admin/projects/Form";

export const metadata: Metadata = {
  title: "Create Project | Admin Workspace",
  description: "Create a project and assign it to a client.",
};

export default function CreateProjectPage() {
  return <ProjectForm />;
}
