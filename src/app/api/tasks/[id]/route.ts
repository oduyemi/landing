import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";

import Task, {
  TaskPriority,
  TaskStatus,
  TaskAssignee,
} from "@/models/task.model";

import Project from "@/models/project.model";
import User from "@/models/user.model";

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

function isValidObjectId(value: string) {
  return mongoose.Types.ObjectId.isValid(value);
}

/**
 * GET /api/tasks/:id
 *
 * Admin:
 *   Can view any task.
 *
 * Client:
 *   Can only view tasks assigned to them or
 *   tasks they created.
 */
export async function GET(
  _req: NextRequest,
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

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid task ID.",
        },
        { status: 400 }
      );
    }

    const task = await Task.findById(id)
      .populate("project", "title")
      .populate(
        "assignedUser",
        "fname lname email image role"
      )
      .populate(
        "createdBy",
        "fname lname email image role"
      )
      .lean();

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
     * Admins can access every task.
     */
    if (currentUser.role !== "admin") {
      const userId = currentUser._id.toString();

      const assignedUserId = task.assignedUser
        ? "_id" in task.assignedUser
          ? task.assignedUser._id.toString()
          : task.assignedUser.toString()
        : null;

      const createdById = task.createdBy
        ? "_id" in task.createdBy
          ? task.createdBy._id.toString()
          : task.createdBy.toString()
        : null;

      if (
        assignedUserId !== userId &&
        createdById !== userId
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden.",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: task,
      task,
    });
  } catch (error) {
    console.error(
      "GET /api/tasks/[id] ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load task.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks/:id
 *
 * Admin:
 *   Can update any task.
 *
 * Client:
 *   Can only update a task assigned to themselves.
 *
 * Clients cannot:
 *   - change the creator
 *   - reassign tasks
 *   - change project
 */
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

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid task ID.",
        },
        { status: 400 }
      );
    }

    const existingTask = await Task.findById(id);

    if (!existingTask) {
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
     */

    const isAdmin =
      currentUser.role === "admin";

    const isAssignedClient =
      existingTask.assignedUser?.toString() ===
      currentUser._id.toString();

    if (!isAdmin && !isAssignedClient) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden.",
        },
        { status: 403 }
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
    } = body;

    /**
     * --------------------------------------------------
     * CLIENT RESTRICTIONS
     * --------------------------------------------------
     *
     * A client may update the progress/details of
     * a task assigned to them, but cannot reassign it.
     */

    if (!isAdmin) {
      if (
        assignedTo !== undefined ||
        assignedUser !== undefined
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Clients cannot reassign tasks.",
          },
          { status: 403 }
        );
      }
    }

    /**
     * --------------------------------------------------
     * TITLE
     * --------------------------------------------------
     */

    if (
      title !== undefined &&
      (typeof title !== "string" ||
        !title.trim())
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Task title cannot be empty.",
        },
        { status: 400 }
      );
    }

    /**
     * --------------------------------------------------
     * STATUS
     * --------------------------------------------------
     */

    if (
      status !== undefined &&
      !VALID_STATUSES.includes(
        status as TaskStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid task status.",
        },
        { status: 400 }
      );
    }

    /**
     * --------------------------------------------------
     * PRIORITY
     * --------------------------------------------------
     */

    if (
      priority !== undefined &&
      !VALID_PRIORITIES.includes(
        priority as TaskPriority
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid task priority.",
        },
        { status: 400 }
      );
    }

    /**
     * --------------------------------------------------
     * ASSIGNEE TYPE
     * --------------------------------------------------
     */

    if (
      assignedTo !== undefined &&
      !VALID_ASSIGNEES.includes(
        assignedTo as TaskAssignee
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid assignee type.",
        },
        { status: 400 }
      );
    }

    /**
     * --------------------------------------------------
     * ASSIGNED USER
     * --------------------------------------------------
     */

    let assignedUserRecord = null;

    if (assignedUser !== undefined) {
      if (
        assignedUser !== null &&
        (
          typeof assignedUser !== "string" ||
          !isValidObjectId(assignedUser)
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid assigned user ID.",
          },
          { status: 400 }
        );
      }

      if (assignedUser) {
        assignedUserRecord =
          await User.findById(assignedUser)
            .select(
              "_id fname lname email image role"
            )
            .lean();

        if (!assignedUserRecord) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Assigned user not found.",
            },
            { status: 404 }
          );
        }
      }
    }

    /**
     * --------------------------------------------------
     * VALIDATE ASSIGNMENT DIRECTION
     * --------------------------------------------------
     *
     * Admin → client
     * Client → admin
     */

    const nextAssignedTo =
      assignedTo !== undefined
        ? assignedTo
        : existingTask.assignedTo;

    const nextAssignedUserId =
      assignedUser !== undefined
        ? assignedUser
        : existingTask.assignedUser?.toString();

    if (
      nextAssignedTo !== "client" &&
      nextAssignedTo !== "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid task assignment.",
        },
        { status: 400 }
      );
    }

    /**
     * If assignment is being changed, validate
     * the actual user's role.
     */
    if (
      assignedUser !== undefined &&
      assignedUserRecord
    ) {
      if (
        nextAssignedTo === "client" &&
        assignedUserRecord.role !== "user"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Client tasks must be assigned to a client.",
          },
          { status: 400 }
        );
      }

      if (
        nextAssignedTo === "admin" &&
        assignedUserRecord.role !== "admin"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Admin tasks must be assigned to an admin.",
          },
          { status: 400 }
        );
      }
    }

    /**
     * If assignedUser isn't changing but assignedTo
     * is changing, load the existing/new user.
     */
    if (
      assignedTo !== undefined &&
      assignedUser === undefined &&
      existingTask.assignedUser
    ) {
      const currentAssignedUser =
        await User.findById(
          existingTask.assignedUser
        )
          .select("_id role")
          .lean();

      if (!currentAssignedUser) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Current assigned user was not found.",
          },
          { status: 404 }
        );
      }

      if (
        nextAssignedTo === "client" &&
        currentAssignedUser.role !== "user"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Client tasks must be assigned to a client.",
          },
          { status: 400 }
        );
      }

      if (
        nextAssignedTo === "admin" &&
        currentAssignedUser.role !== "admin"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Admin tasks must be assigned to an admin.",
          },
          { status: 400 }
        );
      }
    }

    /**
     * --------------------------------------------------
     * PROJECT / CLIENT VALIDATION
     * --------------------------------------------------
     *
     * If an admin assigns a task to a client,
     * that client must belong to the task's project.
     */

    if (
      isAdmin &&
      nextAssignedTo === "client" &&
      nextAssignedUserId
    ) {
      const project = await Project.findById(
        existingTask.project
      )
        .select("_id client")
        .lean();

      if (!project) {
        return NextResponse.json(
          {
            success: false,
            error:
              "The task's project was not found.",
          },
          { status: 404 }
        );
      }

      if (
        project.client.toString() !==
        nextAssignedUserId.toString()
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "The assigned client does not belong to this project.",
          },
          { status: 400 }
        );
      }
    }

    /**
     * --------------------------------------------------
     * DUE DATE
     * --------------------------------------------------
     */

    let parsedDueDate: Date | undefined;

    if (
      dueDate !== undefined &&
      dueDate !== null &&
      dueDate !== ""
    ) {
      parsedDueDate = new Date(dueDate);

      if (
        Number.isNaN(
          parsedDueDate.getTime()
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid due date.",
          },
          { status: 400 }
        );
      }
    }

    /**
     * --------------------------------------------------
     * APPLY CHANGES
     * --------------------------------------------------
     */

    if (title !== undefined) {
      existingTask.title =
        title.trim();
    }

    if (description !== undefined) {
      existingTask.description =
        typeof description === "string"
          ? description.trim()
          : "";
    }

    if (status !== undefined) {
      existingTask.status = status;

      if (status === "Completed") {
        existingTask.completedAt =
          existingTask.completedAt ||
          new Date();
      } else {
        existingTask.completedAt =
          undefined;
      }
    }

    if (priority !== undefined) {
      existingTask.priority =
        priority;
    }

    /**
     * Only admins can modify assignment.
     */
    if (isAdmin) {
      if (assignedTo !== undefined) {
        existingTask.assignedTo =
          assignedTo;
      }

      if (assignedUser !== undefined) {
        existingTask.assignedUser =
          assignedUser
            ? new mongoose.Types.ObjectId(
                assignedUser
              )
            : undefined;
      }
    }

    if (dueDate !== undefined) {
      existingTask.dueDate =
        parsedDueDate;
    }

    /**
     * IMPORTANT:
     * createdBy is intentionally never modified.
     *
     * project is intentionally never modified.
     */

    await existingTask.save();

    const task =
      await Task.findById(
        existingTask._id
      )
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
        "Task updated successfully.",
      data: task,
      task,
    });
  } catch (error) {
    console.error(
      "PATCH /api/tasks/[id] ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to update task.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/:id
 *
 * Admin only.
 */
export async function DELETE(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    await dbConnect();

    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    if (currentUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only administrators can delete tasks.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid task ID.",
        },
        { status: 400 }
      );
    }

    const task =
      await Task.findById(id);

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: "Task not found.",
        },
        { status: 404 }
      );
    }

    await Task.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message:
        "Task deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/tasks/[id] ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to delete task.",
      },
      { status: 500 }
    );
  }
}