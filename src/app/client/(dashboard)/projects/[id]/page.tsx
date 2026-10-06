import { notFound } from "next/navigation";

import { ProjectOverview } from "@/components/client/projects";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";
import Project from "@/models/project.model";

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({
  params,
}: ProjectPageProps) {
  const { id } = await params;

  await dbConnect();

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    notFound();
  }

  const query =
    currentUser.role === "admin"
      ? { _id: id }
      : {
          _id: id,
          client: currentUser._id,
        };

  const projectDocument = await Project.findOne(query)
    .populate(
      "client",
      "fname lname email image role"
    )
    .lean();

  if (!projectDocument) {
    notFound();
  }

  const project = JSON.parse(
    JSON.stringify(projectDocument)
  );

  return <ProjectOverview project={project} />;
}