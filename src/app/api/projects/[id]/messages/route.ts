import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import Message from "@/models/message.model";
import { getMessageContext } from "@/utils/messages";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    await dbConnect();

    const { id: projectId } = await context.params;

    const contextResult = await getMessageContext(
      projectId
    );

    if (contextResult.error) {
      return NextResponse.json(
        {
          error: contextResult.error,
        },
        {
          status: contextResult.status,
        }
      );
    }

    const user = contextResult.user;

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const messages = await Message.find({
      project: projectId,
      $or: [
        {
          sender: user._id,
        },
        {
          recipient: user._id,
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
      .lean();

    return NextResponse.json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error(
      "GET PROJECT MESSAGES ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load project messages.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  try {
    await dbConnect();

    const { id: projectId } = await context.params;

    const contextResult = await getMessageContext(
      projectId
    );

    if (contextResult.error) {
      return NextResponse.json(
        {
          error: contextResult.error,
        },
        {
          status: contextResult.status,
        }
      );
    }

    const user = contextResult.user;

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const {
      recipientId,
      content,
      threadId,
      taskId,
      replyTo,
    } = body;

    /*
     * Delegate message creation to the canonical
     * /api/messages endpoint.
     */
    const response = await fetch(
      new URL("/api/messages", req.url),
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          /*
           * Forward the current user's authentication
           * cookie to /api/messages.
           */
          cookie: req.headers.get("cookie") || "",
        },

        body: JSON.stringify({
          projectId,
          recipientId,
          content,
          threadId,
          taskId,
          replyTo,
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json(
      data,
      {
        status: response.status,
      }
    );
  } catch (error) {
    console.error(
      "CREATE PROJECT MESSAGE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to send project message.",
      },
      {
        status: 500,
      }
    );
  }
}