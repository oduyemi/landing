import { NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";
import User from "@/models/user.model";

export async function GET() {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    if (currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden." },
        { status: 403 }
      );
    }

    const users = await User.find({
      role: { $in: ["user", "admin"] },
    })
      .select("_id fname lname email image role")
      .sort({ role: 1, fname: 1, lname: 1 })
      .lean();

      return NextResponse.json({
        success: true,
        data: users,
        users,
        currentUserId: currentUser._id.toString(),
      });
  } catch (error) {
    console.error("GET /api/tasks/assignees ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load task assignees.",
      },
      { status: 500 }
    );
  }
}