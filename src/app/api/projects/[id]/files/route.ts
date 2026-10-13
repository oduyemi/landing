import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import File from "@/models/file.model";
import Project from "@/models/project.model";
import { dbConnect } from "@/utils/db";
import { getCurrentUser, requireRole } from "@/utils/auth";
import {uploadProjectFile, type FileCategory, type BrandAssetType} from "@/utils/project-files";


type RouteContext = {
  params: Promise<{ id: string }>;
};




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
    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const project = await Project.findById(id)
      .select("_id title client cloudinaryFolder")
      .lean();

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (
      currentUser.role !== "admin" &&
      project.client.toString() !==
        currentUser._id.toString()
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const files = await File.find({
      project: id,
    })
      .populate(
        "uploadedBy",
        "fname lname email image role"
      )
      .sort({
        order: 1,
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({
      project,
      files,
      count: files.length,
    });
  } catch (error) {
    console.error("GET PROJECT FILES ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
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
        { error: "Invalid project ID." },
        { status: 400 }
      );
    }
    const project = await Project.findById(id)
      .select("_id title client cloudinaryFolder")
      .lean();

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    if (!project.cloudinaryFolder) {
      return NextResponse.json(
        {
          error:
            "This project does not have a Cloudinary storage folder.",
        },
        { status: 409 }
      );
    }

    const formData = await req.formData();
    const fileValue = formData.get("file");
    const categoryValue = formData.get("category");
    const assetTypeValue = formData.get("assetType");
    const descriptionValue = formData.get("description");
    if (
      !fileValue ||
      typeof fileValue === "string" ||
      typeof fileValue.name !== "string" ||
      typeof fileValue.arrayBuffer !== "function"
    ) {
      return NextResponse.json(
        {
          error:
            "A valid file is required in the 'file' field.",
        },
        { status: 400 }
      );
    }

    const allowedCategories: FileCategory[] = [
      "image",
      "brand-asset",
      "deliverable",
    ];

    if (
      typeof categoryValue !== "string" ||
      !allowedCategories.includes(
        categoryValue as FileCategory
      )
    ) {
      return NextResponse.json(
        { error: "Invalid file category." },
        { status: 400 }
      );
    }

    const category = categoryValue as FileCategory;

    let assetType: BrandAssetType | undefined;

    if (category === "brand-asset") {
      const allowedAssetTypes: BrandAssetType[] = [
        "logo",
        "icon",
        "favicon",
        "other",
      ];

      if (
        typeof assetTypeValue !== "string" ||
        !allowedAssetTypes.includes(
          assetTypeValue as BrandAssetType
        )
      ) {
        return NextResponse.json(
          { error: "Choose a valid brand asset type." },
          { status: 400 }
        );
      }

      assetType = assetTypeValue as BrandAssetType;
    } else if (assetTypeValue !== null && assetTypeValue !== "") {
      return NextResponse.json(
        {
          error:
            "Asset type is only supported for brand assets.",
        },
        { status: 400 }
      );
    }

    const description =
      typeof descriptionValue === "string"
        ? descriptionValue.trim()
        : "";

    if (description.length > 2000) {
      return NextResponse.json(
        {
          error:
            "Description cannot exceed 2,000 characters.",
        },
        { status: 400 }
      );
    }

    const savedFile = await uploadProjectFile({
      projectId: id,
      userId: currentUser._id as mongoose.Types.ObjectId,
      file: fileValue,
      category,
      assetType,
      description,
    });

    const populatedFile = await File.findById(savedFile._id)
      .populate(
        "uploadedBy",
        "fname lname email image role"
      )
      .populate(
        "project",
        "title cloudinaryFolder"
      )
      .lean();

    return NextResponse.json(
      {
        message: "File uploaded successfully.",
        file: populatedFile,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("UPLOAD PROJECT FILE ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Internal server error.";

    const statusByMessage: Record<string, number> = {
      "User not found.": 401,
      "Project not found.": 404,
      "Invalid project ID.": 400,
      "You do not have access to this project.": 403,
      "You are not permitted to upload files.": 403,
      "The project does not have a Cloudinary folder.": 409,
    };

    if (statusByMessage[message]) {
      return NextResponse.json(
        { error: message },
        { status: statusByMessage[message] }
      );
    }

    const isClientError =
      /^(Please select|Files must be|Unsupported image|Brand assets must be|This deliverable|Choose a valid brand|Asset type is only|The file's content type|A project can contain a maximum|Invalid file category|Invalid file\.|The file)/i.test(
        message
      );

    return NextResponse.json(
      {
        error: isClientError
          ? message
          : "Unable to upload the file. Please try again.",
      },
      { status: isClientError ? 400 : 500 }
    );
  }
}
