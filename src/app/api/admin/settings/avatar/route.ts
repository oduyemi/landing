
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";
import User from "@/models/user.model";
import { uploadToCloudinary, deleteCloudinaryResource } from "@/utils/cloudinary";


export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function POST(request: NextRequest) {
  let uploadedPublicId: string | null = null;
  try {
    await dbConnect();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    if (currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select a profile image." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG and WebP images are supported." },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "The image must be between 1 byte and 5 MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToCloudinary(buffer, {
        folder: "portal/users",
        resourceType: "image",
        originalFilename: file.name,
      });

    uploadedPublicId = uploaded.public_id;
    const previousPublicId = currentUser.imagePublicId ?? null;
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      {
        $set: {
          image: uploaded.secure_url,
          imagePublicId: uploaded.public_id,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("_id image imagePublicId");

    if (!updatedUser) {
      await deleteCloudinaryResource(uploaded.public_id, "image");
      uploadedPublicId = null;

      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    if (
      previousPublicId &&
      previousPublicId !== uploaded.public_id
    ) {
      try {
        const deletion = await deleteCloudinaryResource(
          previousPublicId,
          "image"
        );

        if (deletion.result !== "ok" && deletion.result !== "not found") {
          console.warn(
            "Previous profile image could not be deleted:",
            deletion.result
          );
        }
      } catch (deleteError) {
        console.error(
          "OLD PROFILE IMAGE CLEANUP ERROR:",
          deleteError
        );
      }
    }

    uploadedPublicId = null;

    return NextResponse.json({
      message: "Profile photo updated successfully.",
      image: updatedUser.image,
      imagePublicId: updatedUser.imagePublicId,
    });
  } catch (error) {
    console.error("ADMIN AVATAR UPLOAD ERROR:", error);
    if (uploadedPublicId) {
      try {
        await deleteCloudinaryResource(uploadedPublicId, "image");
      } catch (cleanupError) {
        console.error("NEW AVATAR CLEANUP ERROR:", cleanupError);
      }
    }

    return NextResponse.json(
      { error: "Unable to upload your profile photo." },
      { status: 500 }
    );
  }
}
