
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";
import mongoose from "mongoose";
import Task from "@/models/task.model";
import Notification from "@/models/notification.model";



if (!mongoose.models.Task) {
  mongoose.model("Task", Task.schema);
}



export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Administrator access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const search = (searchParams.get("search") || "").trim();
    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10) || 1
    );
    const limit = 50;

    const filter: Record<string, unknown> = {
      recipient: user._id,
    };

    const allowedTypes = [
      "task",
      "message",
      "file",
      "project",
      "deliverable",
      "milestone",
      "system",
    ];

    if (type !== "all" && allowedTypes.includes(type)) {
      filter.type = type;
    }

    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const [activities, total] = await Promise.all([
        Notification.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate("actor", "fname lname image role")
          .populate("project", "title")
          .populate({
            path: "task",
            model: Task,
            select: "title",
          })
          .lean(),
      
        Notification.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      activities: activities.map((activity: any) => ({
        _id: String(activity._id),
        type: activity.type,
        action: activity.action,
        title: activity.title,
        description: activity.description || "",
        href: activity.href || null,
        createdAt: activity.createdAt,
        actor: activity.actor
          ? {
              _id: String(activity.actor._id),
              fname: activity.actor.fname,
              lname: activity.actor.lname,
              image: activity.actor.image || null,
              role: activity.actor.role,
            }
          : null,
          project: activity.project
          ? {
              _id: String(activity.project._id),
              title: activity.project.title,
            }
          : null,
        
        task: activity.task
          ? {
              _id: String(activity.task._id),
              title: activity.task.title,
            }
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("ADMIN ACTIVITY GET ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load activity." },
      { status: 500 }
    );
  }
}
