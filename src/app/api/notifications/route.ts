
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Notification from "@/models/notification.model";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";

const notificationTypes = [
  "task",
  "message",
  "file",
  "project",
  "deliverable",
  "milestone",
  "system",
] as const;

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const params = req.nextUrl.searchParams;
    const page = Math.max(
      1,
      Number.parseInt(params.get("page") || "1", 10) || 1
    );
    const limit = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(params.get("limit") || "20", 10) || 20
      )
    );

    const query: Record<string, unknown> = {
      recipient: user._id,
    };

    const unread = params.get("unread");
    const type = params.get("type");
    const projectId = params.get("projectId");

    if (unread === "true") query.read = false;
    if (unread === "false") query.read = true;

    if (type) {
      if (
        !notificationTypes.includes(
          type as (typeof notificationTypes)[number]
        )
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid notification type." },
          { status: 400 }
        );
      }

      query.type = type;
    }

    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return NextResponse.json(
          { success: false, error: "Invalid project ID." },
          { status: 400 }
        );
      }

      query.project = new mongoose.Types.ObjectId(projectId);
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate("actor", "fname lname image role")
        .populate("project", "title")
        .populate("task", "title status")
        .populate("message", "content threadId")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Notification.countDocuments(query),

      Notification.countDocuments({
        recipient: user._id,
        read: false,
      }),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load notifications." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const result = await Notification.deleteMany({
      recipient: user._id,
    });

    return NextResponse.json({
      success: true,
      message: "Notifications cleared.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("DELETE ALL NOTIFICATIONS ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to clear notifications." },
      { status: 500 }
    );
  }
}
