
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";
import Project from "@/models/project.model";
import FileModel from "@/models/file.model";
import {
  getAuthorizedProject,
  uploadProjectFile,
  type FileCategory,
  type BrandAssetType,
} from "@/utils/project-files";

const CATEGORIES: FileCategory[] = [
  "image",
  "brand-asset",
  "deliverable",
];

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const params = request.nextUrl.searchParams;
    const category = params.get("category");
    const projectId = params.get("projectId");
    const page = Math.max(1, Number(params.get("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(params.get("limit")) || 30)
    );

    if (category && !CATEGORIES.includes(category as FileCategory)) {
      return NextResponse.json(
        { success: false, error: "Invalid file category." },
        { status: 400 }
      );
    }

    let projectIds: string[] | undefined;

    if (projectId) {
      const access = await getAuthorizedProject(projectId, user);

      if (!access.project) {
        return NextResponse.json(
          { success: false, error: access.error },
          { status: access.status }
        );
      }

      projectIds = [projectId];
    } else if (user.role !== "admin") {
      const projects = await Project.find({
        client: user._id,
      })
        .select("_id")
        .lean();

      projectIds = projects.map((project) => project._id.toString());
    }

    const filter = {
      ...(projectIds ? { project: { $in: projectIds } } : {}),
      ...(category ? { category } : {}),
    };

    const [files, total] = await Promise.all([
      FileModel.find(filter)
        .populate("project", "title type status")
        .populate("uploadedBy", "fname lname image role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      FileModel.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET FILES ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load files." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const projectId = formData.get("projectId");
    const file = formData.get("file");
    const category = formData.get("category");
    const assetType = formData.get("assetType");
    const description = formData.get("description");

    if (
      typeof projectId !== "string" ||
      !(file instanceof globalThis.File) ||
      typeof category !== "string" ||
      !CATEGORIES.includes(category as FileCategory)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Project, file, and valid category are required.",
        },
        { status: 400 }
      );
    }

    const access = await getAuthorizedProject(projectId, user);

    if (!access.project) {
      return NextResponse.json(
        { success: false, error: access.error },
        { status: access.status }
      );
    }

    if (
      assetType !== null &&
      typeof assetType !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid asset type." },
        { status: 400 }
      );
    }

    if (
      description !== null &&
      typeof description !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid description." },
        { status: 400 }
      );
    }

    const savedFile = await uploadProjectFile({
      projectId,
      userId: user._id,
      file,
      category: category as FileCategory,
      assetType: (assetType ?? undefined) as
        | BrandAssetType
        | undefined,
      description: (description as string | null) ?? "",
    });

    return NextResponse.json(
      { success: true, file: savedFile },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "";

    const isValidationError =
      message.includes("maximum of") ||
      message.includes("25 MB") ||
      message.includes("format") ||
      message.includes("supported") ||
      message.includes("valid");

    if (!isValidationError) {
      console.error("POST FILE ERROR:", error);
    }

    return NextResponse.json(
      {
        success: false,
        error: isValidationError
          ? message
          : "Unable to upload the file.",
      },
      { status: isValidationError ? 400 : 500 }
    );
  }
}
