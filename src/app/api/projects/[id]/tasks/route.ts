import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/utils/db";
import Task, { TaskPriority, TaskStatus, TaskAssignee } from "@/models/task.model";

const VALID_STATUSES: TaskStatus[] = [
  "Pending",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
];

const VALID_PRIORITIES: TaskPriority[] = [
  "Low",
  "Medium",
  "High",
  "Urgent",
];

const VALID_ASSIGNEES: TaskAssignee[] = [
  "client",
  "admin",
];

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/projects/:id/tasks
 */
export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    await dbConnect();
    const { id: projectId } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        {
          error: "Invalid project ID.",
        },
        {
          status: 400,
        }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assignedTo = searchParams.get("assignedTo");
    const filter: Record<string, unknown> = {project: projectId};
    if (status) {
      if (!VALID_STATUSES.includes(status as TaskStatus)) {
        return NextResponse.json(
          {
            error: "Invalid task status.",
          },
          {
            status: 400,
          }
        );
      }

      filter.status = status;
    }

    if (priority) {
      if (!VALID_PRIORITIES.includes(priority as TaskPriority)) {
        return NextResponse.json(
          {
            error: "Invalid task priority.",
          },
          {
            status: 400,
          }
        );
      }

      filter.priority = priority;
    }

    if (assignedTo) {
      if (!VALID_ASSIGNEES.includes(assignedTo as TaskAssignee)) {
        return NextResponse.json(
          {
            error: "Invalid assignee type.",
          },
          {
            status: 400,
          }
        );
      }

      filter.assignedTo = assignedTo;
    }

    const tasks = await Task.find(filter)
      .populate(
        "assignedUser",
        "fname lname email image"
      )
      .populate(
        "createdBy",
        "fname lname email image"
      )
      .sort({
        status: 1,
        dueDate: 1,
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      data: tasks,
      tasks,
      total: tasks.length,
    });
  } catch (error) {
    console.error(
      "GET /api/projects/[id]/tasks error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load project tasks.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST /api/projects/:id/tasks
 */
export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  try {
    await dbConnect();

    const { id: projectId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        {
          error: "Invalid project ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await req.json();

    const {
      title,
      description,
      status,
      priority,
      assignedTo,
      assignedUser,
      dueDate,
      createdBy,
    } = body;

    if (
      !title ||
      typeof title !== "string" ||
      !title.trim()
    ) {
      return NextResponse.json(
        {
          error: "Task title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      status &&
      !VALID_STATUSES.includes(status as TaskStatus)
    ) {
      return NextResponse.json(
        {
          error: "Invalid task status.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      priority &&
      !VALID_PRIORITIES.includes(priority as TaskPriority)
    ) {
      return NextResponse.json(
        {
          error: "Invalid task priority.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      assignedTo &&
      !VALID_ASSIGNEES.includes(
        assignedTo as TaskAssignee
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid assignee type.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      assignedUser &&
      !mongoose.Types.ObjectId.isValid(
        assignedUser
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid assigned user ID.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !createdBy ||
      !mongoose.Types.ObjectId.isValid(createdBy)
    ) {
      return NextResponse.json(
        {
          error: "A valid creator is required.",
        },
        {
          status: 400,
        }
      );
    }

    const task = await Task.create({
      project: projectId,

      title: title.trim(),

      description:
        typeof description === "string"
          ? description.trim()
          : "",

      status: status || "Pending",

      priority: priority || "Medium",

      assignedTo: assignedTo || "client",

      assignedUser: assignedUser || null,

      dueDate: dueDate
        ? new Date(dueDate)
        : null,

      createdBy,
    });

    const populatedTask =
      await Task.findById(task._id)
        .populate(
          "assignedUser",
          "fname lname email image"
        )
        .populate(
          "createdBy",
          "fname lname email image"
        )
        .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully.",
        data: populatedTask,
        task: populatedTask,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/projects/[id]/tasks error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to create project task.",
      },
      {
        status: 500,
      }
    );
  }
}