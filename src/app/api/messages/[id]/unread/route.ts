import {
    NextRequest,
    NextResponse,
  } from "next/server";
  import mongoose from "mongoose";
  import Message from "@/models/message.model";
  import { dbConnect } from "@/utils/db";
  import { getCurrentUser } from "@/utils/auth";
  
  export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getCurrentUser();
        if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
        }
    
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");
        const query: Record<string, unknown> = {
        recipient: user._id,
        read: false,
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
    
        query.project =
            new mongoose.Types.ObjectId(
            projectId
            );
        }
    
        const count = await Message.countDocuments(query);
        return NextResponse.json({
        success: true,
        count,
        });
    } catch (error) {
        console.error(
        "GET UNREAD MESSAGES ERROR:",
        error
        );
    
        return NextResponse.json(
            {
                error:
                "Unable to load unread message count.",
            },
            { status: 500 }
        );
    }
}