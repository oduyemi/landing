import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/user.model";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      currentPassword,
      newPassword,
    }: {
      currentPassword?: string;
      newPassword?: string;
    } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          error:
            "Current password and new password are required.",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          error:
            "New password must contain at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(
      currentUser._id
    ).select("+password");

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          error:
            "Your current password is incorrect.",
        },
        { status: 400 }
      );
    }

    const samePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (samePassword) {
      return NextResponse.json(
        {
          error:
            "Your new password must be different from your current password.",
        },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(
      newPassword,
      12
    );

    await user.save();

    return NextResponse.json({
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error(
      "UPDATE PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}