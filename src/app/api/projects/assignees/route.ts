
import { NextResponse } from "next/server";
import User from "@/models/user.model";
import { dbConnect } from "@/utils/db";
import { getCurrentUser, requireRole } from "@/utils/auth";

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

    const roleError = requireRole(currentUser, ["admin"]);
    if (roleError) return roleError;

    const users = await User.find({
      role: { $in: ["user", "admin"] },
    })
      .select("_id fname lname email role")
      .sort({ role: 1, fname: 1, lname: 1 })
      .lean();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET PROJECT ASSIGNEES ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load project assignees." },
      { status: 500 }
    );
  }
}
