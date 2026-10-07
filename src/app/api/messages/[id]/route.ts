import {NextRequest, NextResponse} from "next/server";
import mongoose from "mongoose";
import Message from "@/models/message.model";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";
  
interface RouteContext {
    params: Promise<{
      id: string;
    }>;
}
  
export async function GET(_req: NextRequest, context: RouteContext) {
    try {
        await dbConnect();
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
              { error: "Unauthorized" },
            { status: 401 }
        );
      }
  
        const { id } = await context.params;
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
        
            const message = await Message.findOne({
                _id: id,
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
                "title"
                )
                .populate(
                "task",
                "title status priority"
                )
                .lean();
        
            if (!message) {
            return NextResponse.json(
                {
                error:
                    "Message not found.",
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
            "GET MESSAGE ERROR:",
            error
            );
        
            return NextResponse.json(
            {
                error:
                "Unable to load message.",
            },
            { status: 500 }
        );
    }
}