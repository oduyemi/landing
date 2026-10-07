import { NextResponse } from "next/server";
import User from "@/models/user.model";
import { getCurrentUser, requireRole } from "@/utils/auth";
import { dbConnect } from "@/utils/db";

export async function GET() {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const roleError = requireRole(user, ["admin"]);
    if (roleError) {
      return roleError;
    }

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({
      users,
      count: users.length,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}