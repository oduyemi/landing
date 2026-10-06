import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Project, {ProjectStatus} from "@/models/project.model";
import User from "@/models/user.model";
import { dbConnect } from "@/utils/db";
import { getCurrentUser, requireRole } from "@/utils/auth";
import { deleteProjectFolder } from "@/utils/cloudinary";

const PROJECT_STATUSES: ProjectStatus[] = [
  "Planning",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
];

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    await dbConnect();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const project = await Project.findById(id)
      .populate("client", "fname lname email image role")
      .lean();

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (
      currentUser.role !== "admin" &&
      project.client &&
      project.client._id.toString() !==
        currentUser._id.toString()
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      project,
    });
  } catch (error) {
    console.error("GET PROJECT ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    await dbConnect();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const roleError = requireRole(currentUser, ["admin"]);

    if (roleError) {
      return roleError;
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      title,
      type,
      image,
      progress,
      status,
      startDate,
      deadline,
      description,
      client,
    }: {
      title?: string;
      type?: string;
      image?: string | null;
      progress?: number;
      status?: ProjectStatus;
      startDate?: string | Date;
      deadline?: string | Date;
      description?: string;
      client?: string;
    } = body;

    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json(
          { error: "Project title cannot be empty" },
          { status: 400 }
        );
      }

      project.title = title.trim();
    }

    if (type !== undefined) {
      if (!type.trim()) {
        return NextResponse.json(
          { error: "Project type cannot be empty" },
          { status: 400 }
        );
      }

      project.type = type.trim();
    }

    if (image !== undefined) {
      project.image = image?.trim() || undefined;
    }

    if (description !== undefined) {
      project.description = description.trim();
    }

    if (progress !== undefined) {
      if (
        typeof progress !== "number" ||
        !Number.isFinite(progress) ||
        progress < 0 ||
        progress > 100
      ) {
        return NextResponse.json(
          {
            error:
              "Progress must be a number between 0 and 100.",
          },
          { status: 400 }
        );
      }

      project.progress = progress;
    }

    if (status !== undefined) {
      if (!PROJECT_STATUSES.includes(status)) {
        return NextResponse.json(
          {
            error: `Invalid project status. Allowed statuses: ${PROJECT_STATUSES.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }

      project.status = status;
    }

    if (client !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(client)) {
        return NextResponse.json(
          { error: "Invalid client ID" },
          { status: 400 }
        );
      }

      const clientUser = await User.findById(client)
        .select("_id fname lname email role");

      if (!clientUser) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 }
        );
      }

      if (clientUser.role !== "user") {
        return NextResponse.json(
          {
            error:
              "Projects can only be assigned to client users.",
          },
          { status: 400 }
        );
      }

      project.client = clientUser._id;
    }

    if (startDate !== undefined) {
      const parsedStartDate = new Date(startDate);

      if (Number.isNaN(parsedStartDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid start date" },
          { status: 400 }
        );
      }

      project.startDate = parsedStartDate;
    }

    if (deadline !== undefined) {
      const parsedDeadline = new Date(deadline);

      if (Number.isNaN(parsedDeadline.getTime())) {
        return NextResponse.json(
          { error: "Invalid deadline" },
          { status: 400 }
        );
      }

      project.deadline = parsedDeadline;
    }

    if (project.deadline < project.startDate) {
      return NextResponse.json(
        {
          error:
            "Deadline cannot be earlier than the start date.",
        },
        { status: 400 }
      );
    }

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("client", "fname lname email image role")
      .lean();

    return NextResponse.json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
    _req: NextRequest,
    context: RouteContext
  ) {
    try {
      await dbConnect();
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
  
      const roleError = requireRole(currentUser, ["admin"]);
      if (roleError) {
        return roleError;
      }
  
      const { id } = await context.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { error: "Invalid project ID" },
          { status: 400 }
        );
      }
  
      const project = await Project.findById(id);
  
      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }
      try {
        await deleteProjectFolder(
          project.cloudinaryFolder
        );
      } catch (cloudinaryError) {
        console.error(
          "DELETE PROJECT CLOUDINARY ERROR:",
          cloudinaryError
        );
  
        return NextResponse.json(
          {
            error:
              "Could not remove the project's Cloudinary storage. The project was not deleted.",
          },
          { status: 500 }
        );
      }
  
      /*
       * ---------------------------------------------------------
       * Delete MongoDB project
       * ---------------------------------------------------------
       */
  
      await Project.findByIdAndDelete(id);
  
      return NextResponse.json({
        message: "Project and its Cloudinary storage deleted successfully",
  
        project: {
          _id: project._id,
          title: project.title,
          client: project.client,
          cloudinaryFolder: project.cloudinaryFolder,
        },
      });
    } catch (error) {
      console.error("DELETE PROJECT ERROR:", error);
  
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }