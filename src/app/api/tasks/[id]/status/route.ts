import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";

import Task, {
  TaskStatus,
} from "@/models/task.model";

const VALID_STATUSES: TaskStatus[] = [
  "Pending",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
];

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    await dbConnect();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid task ID.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const status = body.status as TaskStatus;
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid task status.",
        },
        { status: 400 }
      );
    }

    const task = await Task.findById(id);

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: "Task not found.",
        },
        { status: 404 }
      );
    }

    /**
     * --------------------------------------------------
     * AUTHORIZATION
     * --------------------------------------------------
     *
     * Admins can update any task.
     *
     * Clients can only update the status of tasks
     * assigned to them.
     */

    const isAdmin =
      currentUser.role === "admin";

    const isAssignedUser =
      task.assignedUser?.toString() ===
      currentUser._id.toString();

    if (!isAdmin && !isAssignedUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden.",
        },
        { status: 403 }
      );
    }

    task.status = status;

    if (status === "Completed") {
      task.completedAt =
        task.completedAt || new Date();
    } else {
      task.completedAt = undefined;
    }

    await task.save();

    const updatedTask =
      await Task.findById(task._id)
        .populate(
          "project",
          "title"
        )
        .populate(
          "assignedUser",
          "fname lname email image role"
        )
        .populate(
          "createdBy",
          "fname lname email image role"
        )
        .lean();

    return NextResponse.json({
      success: true,
      message:
        "Task status updated successfully.",
      data: updatedTask,
      task: updatedTask,
    });
  } catch (error) {
    console.error(
      "PATCH /api/tasks/[id]/status ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to update task status.",
      },
      { status: 500 }
    );
  }
}