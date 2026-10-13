
import { NextResponse } from "next/server";
import Notification from "@/models/notification.model";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";

export async function PATCH() {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const result = await Notification.updateMany(
      {
        recipient: user._id,
        read: false,
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to mark notifications as read." },
      { status: 500 }
    );
  }
}
