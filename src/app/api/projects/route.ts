import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import Project, {
  ProjectStatus,
} from "@/models/project.model";

import User from "@/models/user.model";

import { dbConnect } from "@/utils/db";
import {
  getCurrentUser,
  requireRole,
} from "@/utils/auth";

import { createProjectFolders } from "@/utils/cloudinary";

const PROJECT_STATUSES: ProjectStatus[] = [
  "Planning",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
];

/**
 * Converts a project title into a safe Cloudinary folder name.
 *
 * Examples:
 *
 * "Laguan"                    → "laguan"
 * "Laguan Website"           → "laguan-website"
 * "Laguan — Redesign 2026"   → "laguan-redesign-2026"
 */
const createCloudinaryFolderName = (title: string) => {
  const slug = title
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `project-${Date.now()}`;
};

export async function GET() {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let projects;

    if (currentUser.role === "admin") {
      projects = await Project.find()
        .populate(
          "client",
          "fname lname email image role"
        )
        .sort({ createdAt: -1 })
        .lean();
    } else {
      projects = await Project.find({
        client: currentUser._id,
      })
        .populate(
          "client",
          "fname lname email image role"
        )
        .sort({ createdAt: -1 })
        .lean();
    }

    return NextResponse.json({
      projects,
      count: projects.length,
    });
  } catch (error) {
    console.error("GET PROJECTS ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    /*
     * ---------------------------------------------------------
     * Required fields
     * ---------------------------------------------------------
     */

    if (!title || !title.trim()) {
      return NextResponse.json(
        {
          error: "Project title is required",
        },
        { status: 400 }
      );
    }

    if (!type || !type.trim()) {
      return NextResponse.json(
        {
          error: "Project type is required",
        },
        { status: 400 }
      );
    }

    if (!client) {
      return NextResponse.json(
        {
          error: "Client is required",
        },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        {
          error: "Start date is required",
        },
        { status: 400 }
      );
    }

    if (!deadline) {
      return NextResponse.json(
        {
          error: "Deadline is required",
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------------------
     * Validate client
     * ---------------------------------------------------------
     */

    if (!mongoose.Types.ObjectId.isValid(client)) {
      return NextResponse.json(
        {
          error: "Invalid client ID",
        },
        { status: 400 }
      );
    }

    const clientUser = await User.findById(client).select(
      "_id fname lname email image role"
    );

    if (!clientUser) {
      return NextResponse.json(
        {
          error: "Client not found",
        },
        { status: 404 }
      );
    }

    /**
     * Only normal client accounts can own projects.
     */
    if (clientUser.role !== "user") {
      return NextResponse.json(
        {
          error:
            "Projects can only be assigned to client users.",
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------------------
     * Validate progress
     * ---------------------------------------------------------
     */

    const projectProgress = progress ?? 0;

    if (
      typeof projectProgress !== "number" ||
      !Number.isFinite(projectProgress) ||
      projectProgress < 0 ||
      projectProgress > 100
    ) {
      return NextResponse.json(
        {
          error:
            "Progress must be a number between 0 and 100.",
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------------------
     * Validate status
     * ---------------------------------------------------------
     */

    const projectStatus = status ?? "Planning";

    if (!PROJECT_STATUSES.includes(projectStatus)) {
      return NextResponse.json(
        {
          error: `Invalid project status. Allowed statuses: ${PROJECT_STATUSES.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------------------
     * Validate dates
     * ---------------------------------------------------------
     */

    const parsedStartDate = new Date(startDate);
    const parsedDeadline = new Date(deadline);

    if (Number.isNaN(parsedStartDate.getTime())) {
      return NextResponse.json(
        {
          error: "Invalid start date",
        },
        { status: 400 }
      );
    }

    if (Number.isNaN(parsedDeadline.getTime())) {
      return NextResponse.json(
        {
          error: "Invalid deadline",
        },
        { status: 400 }
      );
    }

    if (parsedDeadline < parsedStartDate) {
      return NextResponse.json(
        {
          error:
            "Deadline cannot be earlier than the start date.",
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------------------
     * Generate Cloudinary folder name
     * ---------------------------------------------------------
     */

    const baseFolder = createCloudinaryFolderName(title);

    /**
     * Prevent duplicate Cloudinary folder names.
     *
     * Example:
     *
     * Existing:
     * laguan
     *
     * New project with same title:
     * laguan-2
     *
     * New project again:
     * laguan-3
     */
    let cloudinaryFolder = baseFolder;
    let suffix = 1;

    while (
      await Project.exists({
        cloudinaryFolder,
      })
    ) {
      suffix += 1;
      cloudinaryFolder = `${baseFolder}-${suffix}`;
    }

    /*
     * ---------------------------------------------------------
     * Create Cloudinary folder structure
     * ---------------------------------------------------------
     */

    try {
      await createProjectFolders(cloudinaryFolder);
    } catch (cloudinaryError) {
      console.error(
        "CREATE CLOUDINARY PROJECT FOLDERS ERROR:",
        cloudinaryError
      );

      return NextResponse.json(
        {
          error:
            "Could not create the project's Cloudinary storage.",
        },
        { status: 500 }
      );
    }

    /*
     * ---------------------------------------------------------
     * Create MongoDB project
     * ---------------------------------------------------------
     */

    try {
      const project = await Project.create({
        title: title.trim(),
        type: type.trim(),
        image: image?.trim() || undefined,
        progress: projectProgress,
        status: projectStatus,
        startDate: parsedStartDate,
        deadline: parsedDeadline,
        description: description?.trim() || "",
        client: clientUser._id,
        cloudinaryFolder,
      });

      const populatedProject = await Project.findById(
        project._id
      )
        .populate(
          "client",
          "fname lname email image role"
        )
        .lean();

      return NextResponse.json(
        {
          message: "Project created successfully",
          project: populatedProject,
          cloudinary: {
            folder: cloudinaryFolder,
            media: `${cloudinaryFolder}/media`,
            brand: `${cloudinaryFolder}/brand`,
            others: `${cloudinaryFolder}/others`,
          },
        },
        { status: 201 }
      );
    } catch (databaseError) {
      console.error(
        "CREATE PROJECT DATABASE ERROR:",
        databaseError
      );

      try {
        const { deleteProjectFolder } = await import(
          "@/utils/cloudinary"
        );

        await deleteProjectFolder(cloudinaryFolder);
      } catch (cleanupError) {
        console.error(
          "CLOUDINARY PROJECT CLEANUP ERROR:",
          cleanupError
        );
      }

      throw databaseError;
    }
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}