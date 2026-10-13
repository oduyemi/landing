
import { NextResponse } from "next/server";
import Notification from "@/models/notification.model";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";

export async function GET() {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const unreadCount = await Notification.countDocuments({
      recipient: user._id,
      read: false,
    });

    return NextResponse.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("GET UNREAD COUNT ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load unread count." },
      { status: 500 }
    );
  }
}
