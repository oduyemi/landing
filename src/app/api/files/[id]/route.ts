
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";
import FileModel from "@/models/file.model";
import {
  getAuthorizedProject,
  deleteStoredFile,
  type BrandAssetType,
} from "@/utils/project-files";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const ASSET_TYPES: BrandAssetType[] = [
  "logo",
  "icon",
  "favicon",
  "other",
];

async function getAccessibleFile(id: string, user: {
  _id: mongoose.Types.ObjectId;
  role: string;
}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return {
      file: null,
      error: "Invalid file ID.",
      status: 400,
    };
  }

  const file = await FileModel.findById(id);

  if (!file) {
    return {
      file: null,
      error: "File not found.",
      status: 404,
    };
  }

  const access = await getAuthorizedProject(
    file.project.toString(),
    user
  );

  if (!access.project) {
    return {
      file: null,
      error: access.error,
      status: access.status,
    };
  }

  return { file, error: null, status: 200 };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const result = await getAccessibleFile(id, user);

    if (!result.file) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    await result.file.populate([
      { path: "project", select: "title type status client" },
      { path: "uploadedBy", select: "fname lname image role" },
    ]);

    return NextResponse.json({
      success: true,
      file: result.file,
    });
  } catch (error) {
    console.error("GET FILE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load file." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const result = await getAccessibleFile(id, user);

    if (!result.file) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (
        typeof body.name !== "string" ||
        !body.name.trim() ||
        body.name.trim().length > 180
      ) {
        return NextResponse.json(
          { success: false, error: "Name must be 1–180 characters." },
          { status: 400 }
        );
      }

      updates.name = body.name.trim();
    }

    if (body.description !== undefined) {
      if (
        typeof body.description !== "string" ||
        body.description.length > 2000
      ) {
        return NextResponse.json(
          { success: false, error: "Description must be 2,000 characters or fewer." },
          { status: 400 }
        );
      }

      updates.description = body.description.trim();
    }

    if (body.order !== undefined) {
      if (
        !Number.isInteger(body.order) ||
        body.order < 0
      ) {
        return NextResponse.json(
          { success: false, error: "Order must be a non-negative integer." },
          { status: 400 }
        );
      }

      updates.order = body.order;
    }

    if (body.assetType !== undefined) {
      if (
        result.file.category !== "brand-asset" ||
        !ASSET_TYPES.includes(body.assetType)
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid brand asset type." },
          { status: 400 }
        );
      }

      updates.assetType = body.assetType;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid changes provided." },
        { status: 400 }
      );
    }

    Object.assign(result.file, updates);
    await result.file.save();

    return NextResponse.json({
      success: true,
      file: result.file,
    });
  } catch (error) {
    console.error("PATCH FILE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to update file." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const result = await getAccessibleFile(id, user);

    if (!result.file) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    // Delete from Cloudinary first. If that fails, retain the DB record.
    await deleteStoredFile(result.file);
    await result.file.deleteOne();

    return NextResponse.json({
      success: true,
      message: "File deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE FILE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to delete the file. Please try again.",
      },
      { status: 500 }
    );
  }
}
