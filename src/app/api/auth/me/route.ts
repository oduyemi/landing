import { NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";

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
    return NextResponse.json({
      user: {
        _id: user._id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        image: user.image,
        firstLogin: user.firstLogin,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
      firstLogin: user.firstLogin,
    });
  } catch (error) {
    console.error("ME ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}