import {
    NextRequest,
    NextResponse,
  } from "next/server";
  import mongoose from "mongoose";
  import Message from "@/models/message.model";
  import { dbConnect } from "@/utils/db";
  import { getCurrentUser } from "@/utils/auth";
  
  export async function GET(
    req: NextRequest
  ) {
    try {
      await dbConnect();
  
      const user =
        await getCurrentUser();
  
      if (!user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
  
      const { searchParams } =
        new URL(req.url);
  
      const projectId =
        searchParams.get("projectId");
  
      const baseQuery: Record<
        string,
        unknown
      > = {
        $or: [
          {
            sender: user._id,
          },
          {
            recipient: user._id,
          },
        ],
      };
  
      if (projectId) {
        if (
          !mongoose.Types.ObjectId.isValid(
            projectId
          )
        ) {
          return NextResponse.json(
            {
              error:
                "Invalid project ID.",
            },
            { status: 400 }
          );
        }
  
        baseQuery.project =
          new mongoose.Types.ObjectId(
            projectId
          );
      }
  
      const messages =
        await Message.find(baseQuery)
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
          .sort({
            createdAt: -1,
          })
          .lean();
  
      const conversations = new Map<
        string,
        {
          threadId: string;
          project: unknown;
          participant: unknown;
          lastMessage: unknown;
          unreadCount: number;
        }
      >();
  
      for (const message of messages) {
        const key =
          `${message.project._id.toString()}-${message.threadId}`;
  
        if (!conversations.has(key)) {
          const isSender =
            message.sender._id.toString() ===
            user._id.toString();
  
          conversations.set(key, {
            threadId:
              message.threadId,
            project:
              message.project,
            participant: isSender
              ? message.recipient
              : message.sender,
            lastMessage: message,
            unreadCount: 0,
          });
        }
  
        const conversation =
          conversations.get(key)!;
  
        if (
          message.recipient._id.toString() ===
            user._id.toString() &&
          !message.read
        ) {
          conversation.unreadCount += 1;
        }
      }
  
      return NextResponse.json({
        success: true,
        conversations:
          Array.from(
            conversations.values()
          ),
        count: conversations.size,
      });
    } catch (error) {
      console.error(
        "GET CONVERSATIONS ERROR:",
        error
      );
  
      return NextResponse.json(
        {
          error:
            "Unable to load conversations.",
        },
        { status: 500 }
      );
    }
  }