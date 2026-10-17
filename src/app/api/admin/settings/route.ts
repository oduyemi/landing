
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";
import User from "@/models/user.model";


export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const fname = typeof body.fname === "string" ? body.fname.trim() : "";
    const lname = typeof body.lname === "string" ? body.lname.trim() : "";
    const email = typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!fname || !lname || !email) {
      return NextResponse.json(
        { error: "First name, last name and email are required." },
        { status: 400 }
      );
    }

    if (fname.length > 80 || lname.length > 80) {
      return NextResponse.json(
        { error: "Names must be 80 characters or fewer." },
        { status: 400 }
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: currentUser._id },
    }).select("_id");

    if (existingUser) {
      return NextResponse.json(
        { error: "That email address is already in use." },
        { status: 409 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      {
        $set: { fname, lname, email },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(
      "_id fname lname email role image firstLogin lastLogin createdAt updatedAt"
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully.",
      user: {
        _id: updatedUser._id.toString(),
        fname: updatedUser.fname,
        lname: updatedUser.lname,
        email: updatedUser.email,
        role: updatedUser.role,
        image: updatedUser.image,
        firstLogin: updatedUser.firstLogin,
        lastLogin: updatedUser.lastLogin,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { error: "That email address is already in use." },
        { status: 409 }
      );
    }

    console.error("ADMIN SETTINGS UPDATE ERROR:", error);

    return NextResponse.json(
      { error: "Unable to update your profile right now." },
      { status: 500 }
    );
  }
}
