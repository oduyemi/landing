import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/utils/auth";
import { dbConnect } from "@/utils/db";
import { uploadProjectImage } from "@/utils/cloudinary";
export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

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

    const formData = await req.formData();
    const file = formData.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select a project image." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Use a JPG, PNG, or WebP image." },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "The image must be smaller than 5 MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadProjectImage(
      buffer,
      file.type
    );

    return NextResponse.json(
      {
        message: "Project image uploaded successfully.",
        image: uploaded.secure_url,
        publicId: uploaded.public_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("PROJECT IMAGE UPLOAD ERROR:", error);

    return NextResponse.json(
      { error: "Could not upload the project image." },
      { status: 500 }
    );
  }
}