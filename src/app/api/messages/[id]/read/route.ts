import {
    NextRequest,
    NextResponse,
  } from "next/server";
  import mongoose from "mongoose";
  import Message from "@/models/message.model";
  import { dbConnect } from "@/utils/db";
  import { getCurrentUser } from "@/utils/auth";
  
  interface RouteContext {
    params: Promise<{
      id: string;
    }>;
  }
  
  export async function PATCH(_req: NextRequest, context: RouteContext) {
    try {
        await dbConnect();
        const user = await getCurrentUser();
        if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
        }
    
        const { id } =
        await context.params;
    
        if (
        !mongoose.Types.ObjectId.isValid(id)
        ) {
        return NextResponse.json(
            {
            error:
                "Invalid message ID.",
            },
            { status: 400 }
        );
        }
    
        const message =
        await Message.findOneAndUpdate(
            {
            _id: id,
            recipient: user._id,
            },
            {
            $set: {
                read: true,
                readAt: new Date(),
            },
            },
            {
            new: true,
            }
        )
            .populate(
            "sender",
            "fname lname email image role"
            )
            .lean();
    
        if (!message) {
        return NextResponse.json(
            {
            error:
                "Message not found or you are not the recipient.",
            },
            { status: 404 }
        );
        }
    
        return NextResponse.json({
        success: true,
        message,
        });
    } catch (error) {
        console.error(
        "MARK MESSAGE READ ERROR:",
        error
        );
    
        return NextResponse.json(
            {
                error:
                "Unable to mark message as read.",
            },
            { status: 500 }
        );
    }
}