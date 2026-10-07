import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Message from "@/models/message.model";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";


export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { searchParams } = new URL(req.url);

    const projectId = searchParams.get("projectId");
    const threadId = searchParams.get("threadId");
    const limitParam = searchParams.get("limit");

    const parsedLimit = Number(limitParam);

    const limit = Math.min(
      Math.max(
        Number.isFinite(parsedLimit)
          ? parsedLimit
          : 100,
        1
      ),
      100
    );

    if (!projectId) {
      return NextResponse.json(
        {
          error: "Project ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(projectId)
    ) {
      return NextResponse.json(
        {
          error: "Invalid project ID.",
        },
        {
          status: 400,
        }
      );
    }

    if (!threadId?.trim()) {
      return NextResponse.json(
        {
          error: "Thread ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const messages = await Message.find({
      project: new mongoose.Types.ObjectId(projectId),

      threadId: threadId.trim(),

      $or: [
        {
          sender: currentUser._id,
        },
        {
          recipient: currentUser._id,
        },
      ],
    })
      .populate(
        "sender",
        "fname lname email image role"
      )
      .populate(
        "recipient",
        "fname lname email image role"
      )
      .populate(
        "project",
        "title type"
      )
      .populate(
        "task",
        "title status priority"
      )
      .populate(
        "replyTo",
        "sender content createdAt"
      )
      .sort({
        createdAt: 1,
      })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error(
      "GET MESSAGE THREAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load conversation.",
      },
      {
        status: 500,
      }
    );
  }
}