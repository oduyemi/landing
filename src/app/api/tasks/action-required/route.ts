import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import Task from "@/models/task.model";
import { getCurrentUser } from "@/utils/auth";

const ACTION_REQUIRED_STATUSES = [
  "Pending",
  "In Progress",
  "On Hold",
];

export async function GET(_req: NextRequest) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const assignedTo =
      user.role === "admin" ? "admin" : "client";

    const filter = {
      assignedTo,
      assignedUser: user._id,
      status: {
        $in: ACTION_REQUIRED_STATUSES,
      },
    };

    const [tasks, count] = await Promise.all([
      Task.find(filter)
        .populate("project", "title")
        .populate(
          "createdBy",
          "fname lname email image role"
        )
        .sort({
          dueDate: 1,
          createdAt: -1,
        })
        .limit(10)
        .lean(),

      Task.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      tasks,
      count,
    });
  } catch (error) {
    console.error(
      "GET /api/tasks/action-required ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load required actions.",
      },
      { status: 500 }
    );
  }
}
