import { NextResponse } from "next/server";
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

    const admins = await User.find({ role: "admin" })
      .select("_id fname lname email")
      .sort({ fname: 1, lname: 1 })
      .lean();

    return NextResponse.json({ admins });
  } catch (error) {
    console.error("GET PROJECT REQUEST ADMINS ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load administrators." },
      { status: 500 }
    );
  }
}