import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/user.model";
import { dbConnect } from "@/utils/db";
import { getCurrentUser, requireRole } from "@/utils/auth";


type Role = "user" | "admin";


interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

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

    const roleError = requireRole(currentUser, ["admin"]);
    if (roleError) {
      return roleError;
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const user = await User.findById(id)
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
    console.error("GET USER ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


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
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const existingUser = await User.findById(id);

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const {
      fname,
      lname,
      email,
      role,
      image,
      firstLogin,
    }: {
      fname?: string;
      lname?: string;
      email?: string;
      role?: Role;
      image?: string | null;
      firstLogin?: boolean;
    } = body;

    if (
      role !== undefined &&
      role !== "user" &&
      role !== "admin"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid role. Role must be either user or admin.",
        },
        { status: 400 }
      );
    }

    if (
      existingUser._id.toString() ===
        currentUser._id.toString() &&
      role === "user"
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot remove your own administrator role.",
        },
        { status: 400 }
      );
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        return NextResponse.json(
          { error: "Email cannot be empty" },
          { status: 400 }
        );
      }

      const duplicateEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (duplicateEmail) {
        return NextResponse.json(
          {
            error:
              "Another account already uses this email.",
          },
          { status: 409 }
        );
      }

      existingUser.email = normalizedEmail;
    }

    if (fname !== undefined) {
      if (!fname.trim()) {
        return NextResponse.json(
          { error: "First name cannot be empty" },
          { status: 400 }
        );
      }

      existingUser.fname = fname.trim();
    }

    if (lname !== undefined) {
      if (!lname.trim()) {
        return NextResponse.json(
          { error: "Last name cannot be empty" },
          { status: 400 }
        );
      }

      existingUser.lname = lname.trim();
    }

    if (role !== undefined) {
      existingUser.role = role;
    }

    if (image !== undefined) {
      existingUser.image = image || undefined;
    }

    if (firstLogin !== undefined) {
      existingUser.firstLogin = firstLogin;
    }

    await existingUser.save();

    const updatedUser = await User.findById(id)
      .select("-password")
      .lean();

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


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
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    if (currentUser._id.toString() === id) {
      return NextResponse.json(
        {
          error:
            "You cannot delete your own administrator account.",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      message: "User deleted successfully",
      user: {
        _id: user._id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}