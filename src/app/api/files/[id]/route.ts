import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import File, {
  FileCategory,
  BrandAssetType,
} from "@/models/file.model";
import Project from "@/models/project.model";
import { dbConnect } from "@/utils/db";
import { getCurrentUser, requireRole } from "@/utils/auth";

const FILE_CATEGORIES: FileCategory[] = [
  "image",
  "brand-asset",
  "deliverable",
];

const BRAND_ASSET_TYPES: BrandAssetType[] = [
  "logo",
  "icon",
  "favicon",
  "other",
];

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// --------------------------------------------------
// GET /api/files/:id
//
// Admin  → any file
// User   → file belonging to their project
// --------------------------------------------------

export async function GET(
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

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid file ID" },
        { status: 400 }
      );
    }

    const file = await File.findById(id)
      .populate(
        "uploadedBy",
        "fname lname email image role"
      )
      .populate(
        "project",
        "title type status client"
      )
      .lean();

    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // ----------------------------------------
    // Check project ownership for regular users
    // ----------------------------------------

    if (currentUser.role !== "admin") {
      const project = await Project.findById(
        file.project._id
      )
        .select("client")
        .lean();

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      if (
        project.client.toString() !==
        currentUser._id.toString()
      ) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      file,
    });
  } catch (error) {
    console.error("GET FILE ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// PATCH /api/files/:id
//
// Admin only
// --------------------------------------------------

export async function PATCH(
  req: NextRequest,
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
        { error: "Invalid file ID" },
        { status: 400 }
      );
    }

    const file = await File.findById(id);

    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const {
      name,
      originalName,
      url,
      publicId,
      category,
      assetType,
      mimeType,
      extension,
      size,
      description,
      order,
    }: {
      name?: string;
      originalName?: string;
      url?: string;
      publicId?: string | null;
      category?: FileCategory;
      assetType?: BrandAssetType | null;
      mimeType?: string;
      extension?: string;
      size?: number;
      description?: string;
      order?: number;
    } = body;

    // ----------------------------------------
    // Name
    // ----------------------------------------

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { error: "File name cannot be empty" },
          { status: 400 }
        );
      }

      file.name = name.trim();
    }

    if (originalName !== undefined) {
      if (!originalName.trim()) {
        return NextResponse.json(
          {
            error:
              "Original file name cannot be empty",
          },
          { status: 400 }
        );
      }

      file.originalName = originalName.trim();
    }

    if (url !== undefined) {
      if (!url.trim()) {
        return NextResponse.json(
          { error: "File URL cannot be empty" },
          { status: 400 }
        );
      }

      file.url = url.trim();
    }

    if (publicId !== undefined) {
      file.publicId = publicId?.trim() || undefined;
    }

    // ----------------------------------------
    // Category
    // ----------------------------------------

    if (category !== undefined) {
      if (!FILE_CATEGORIES.includes(category)) {
        return NextResponse.json(
          {
            error: `Invalid file category. Allowed categories: ${FILE_CATEGORIES.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }

      file.category = category;
    }

    // ----------------------------------------
    // Asset type
    // ----------------------------------------

    if (assetType !== undefined) {
      if (
        assetType !== null &&
        !BRAND_ASSET_TYPES.includes(assetType)
      ) {
        return NextResponse.json(
          {
            error: `Invalid asset type. Allowed types: ${BRAND_ASSET_TYPES.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }

      file.assetType =
        assetType === null
          ? undefined
          : assetType;
    }

    // ----------------------------------------
    // Ensure brand assets have asset type
    // ----------------------------------------

    if (
      file.category === "brand-asset" &&
      !file.assetType
    ) {
      return NextResponse.json(
        {
          error:
            "Brand assets must have an asset type.",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // MIME type
    // ----------------------------------------

    if (mimeType !== undefined) {
      if (!mimeType.trim()) {
        return NextResponse.json(
          { error: "MIME type cannot be empty" },
          { status: 400 }
        );
      }

      file.mimeType = mimeType.trim();
    }

    // ----------------------------------------
    // Extension
    // ----------------------------------------

    if (extension !== undefined) {
      if (!extension.trim()) {
        return NextResponse.json(
          { error: "File extension cannot be empty" },
          { status: 400 }
        );
      }

      file.extension = extension
        .trim()
        .replace(/^\./, "")
        .toLowerCase();
    }

    // ----------------------------------------
    // Size
    // ----------------------------------------

    if (size !== undefined) {
      if (
        typeof size !== "number" ||
        !Number.isFinite(size) ||
        size < 0
      ) {
        return NextResponse.json(
          { error: "Invalid file size" },
          { status: 400 }
        );
      }

      file.size = size;
    }

    // ----------------------------------------
    // Description
    // ----------------------------------------

    if (description !== undefined) {
      file.description = description.trim();
    }

    // ----------------------------------------
    // Order
    // ----------------------------------------

    if (order !== undefined) {
      if (
        typeof order !== "number" ||
        !Number.isFinite(order) ||
        order < 0
      ) {
        return NextResponse.json(
          {
            error:
              "Order must be a number greater than or equal to 0.",
          },
          { status: 400 }
        );
      }

      file.order = order;
    }

    await file.save();

    const updatedFile = await File.findById(file._id)
      .populate(
        "uploadedBy",
        "fname lname email image role"
      )
      .populate(
        "project",
        "title type status client"
      )
      .lean();

    return NextResponse.json({
      message: "File updated successfully",
      file: updatedFile,
    });
  } catch (error) {
    console.error("UPDATE FILE ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// DELETE /api/files/:id
//
// Admin only
// --------------------------------------------------

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
        { error: "Invalid file ID" },
        { status: 400 }
      );
    }

    const file = await File.findById(id);

    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    await File.findByIdAndDelete(id);

    return NextResponse.json({
      message: "File deleted successfully",
      file: {
        _id: file._id,
        name: file.name,
        originalName: file.originalName,
        project: file.project,
      },
    });
  } catch (error) {
    console.error("DELETE FILE ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}