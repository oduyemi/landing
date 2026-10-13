
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Notification from "@/models/notification.model";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid notification ID." },
        { status: 400 }
      );
    }

    let body: { read?: boolean };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    if (typeof body.read !== "boolean") {
      return NextResponse.json(
        { success: false, error: "'read' must be a boolean." },
        { status: 400 }
      );
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        recipient: user._id,
      },
      {
        $set: {
          read: body.read,
          readAt: body.read ? new Date() : null,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("UPDATE NOTIFICATION ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to update notification." },
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

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid notification ID." },
        { status: 400 }
      );
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: user._id,
    }).lean();

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted.",
      id,
    });
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to delete notification." },
      { status: 500 }
    );
  }
}
