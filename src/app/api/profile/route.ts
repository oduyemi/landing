import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user.model";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";

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

    const user = await User.findById(currentUser._id)
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
      fname,
      lname,
      email,
      phone,
    }: {
      fname?: string;
      lname?: string;
      email?: string;
      phone?: string;
    } = body;

    const user = await User.findById(currentUser._id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (fname !== undefined) {
      const value = fname.trim();

      if (!value) {
        return NextResponse.json(
          { error: "First name cannot be empty." },
          { status: 400 }
        );
      }

      user.fname = value;
    }

    if (lname !== undefined) {
      const value = lname.trim();

      if (!value) {
        return NextResponse.json(
          { error: "Last name cannot be empty." },
          { status: 400 }
        );
      }

      user.lname = value;
    }

    if (email !== undefined) {
      const normalizedEmail = email
        .trim()
        .toLowerCase();

      if (!normalizedEmail) {
        return NextResponse.json(
          { error: "Email cannot be empty." },
          { status: 400 }
        );
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: {
          $ne: currentUser._id,
        },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            error:
              "Another account already uses this email.",
          },
          { status: 409 }
        );
      }

      user.email = normalizedEmail;
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    await user.save();

    const updatedUser = await User.findById(
      currentUser._id
    )
      .select("-password")
      .lean();

    return NextResponse.json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}