
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";
import FileModel from "@/models/file.model";
import {
  getAuthorizedProject,
  type FileCategory,
} from "@/utils/project-files";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const CATEGORIES: FileCategory[] = [
  "image",
  "brand-asset",
  "deliverable",
];

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
    const access = await getAuthorizedProject(id, user);

    if (!access.project) {
      return NextResponse.json(
        { success: false, error: access.error },
        { status: access.status }
      );
    }

    const body = await request.json();
    const { category, items } = body as {
      category: FileCategory;
      items: { id: string; order: number }[];
    };

    if (
      !CATEGORIES.includes(category) ||
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 100
    ) {
      return NextResponse.json(
        { success: false, error: "Provide a valid category and 1–100 items." },
        { status: 400 }
      );
    }

    const ids = items.map((item) => item.id);

    if (
      ids.some((id) => !mongoose.Types.ObjectId.isValid(id)) ||
      new Set(ids).size !== ids.length ||
      items.some(
        (item) =>
          !Number.isInteger(item.order) ||
          item.order < 0
      )
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid file IDs or order values." },
        { status: 400 }
      );
    }

    const matchingFiles = await FileModel.find({
      _id: { $in: ids },
      project: id,
      category,
    })
      .select("_id")
      .lean();

    if (matchingFiles.length !== ids.length) {
      return NextResponse.json(
        {
          success: false,
          error: "One or more files do not belong to this project and category.",
        },
        { status: 400 }
      );
    }

    await FileModel.bulkWrite(
      items.map((item) => ({
        updateOne: {
          filter: {
            _id: item.id,
            project: id,
            category,
          },
          update: { $set: { order: item.order } },
        },
      }))
    );

    return NextResponse.json({
      success: true,
      message: "File order updated.",
    });
  } catch (error) {
    console.error("REORDER FILES ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to reorder files." },
      { status: 500 }
    );
  }
}
