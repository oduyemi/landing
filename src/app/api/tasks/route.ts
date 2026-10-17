
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import Task, {
  TaskPriority,
  TaskStatus,
  TaskAssignee,
} from "@/models/task.model";
import Project from "@/models/project.model";
import User from "@/models/user.model";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";
import { createActivityNotification } from "@/utils/notifications";
import { sendEmailWithRetry } from "@/helper/emailLogic";

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

const VALID_ASSIGNEES: TaskAssignee[] = ["client", "admin"];

function isValidObjectId(value: string) {
  return mongoose.Types.ObjectId.isValid(value);
}

/**
 * GET /api/tasks
 *
 * Admins can view and filter all tasks.
 * Clients can only view tasks assigned to themselves.
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const project = searchParams.get("project");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assignedTo = searchParams.get("assignedTo");
    const assignedUser = searchParams.get("assignedUser");
    const search = searchParams.get("search")?.trim();

    const page = Math.max(
      Number.parseInt(searchParams.get("page") || "1", 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(searchParams.get("limit") || "20", 10) || 20,
        1
      ),
      100
    );

    const filter: Record<string, unknown> = {};

    if (currentUser.role === "user") {
      filter.assignedUser = currentUser._id;
    }

    if (project) {
      if (!isValidObjectId(project)) {
        return NextResponse.json(
          { success: false, error: "Invalid project ID." },
          { status: 400 }
        );
      }

      if (currentUser.role === "user") {
        const clientProject = await Project.findOne({
          _id: project,
          client: currentUser._id,
        })
          .select("_id")
          .lean();

        if (!clientProject) {
          return NextResponse.json(
            { success: false, error: "Forbidden." },
            { status: 403 }
          );
        }
      }

      filter.project = project;
    }

    if (status) {
      if (!VALID_STATUSES.includes(status as TaskStatus)) {
        return NextResponse.json(
          { success: false, error: "Invalid task status." },
          { status: 400 }
        );
      }

      filter.status = status;
    }

    if (priority) {
      if (!VALID_PRIORITIES.includes(priority as TaskPriority)) {
        return NextResponse.json(
          { success: false, error: "Invalid task priority." },
          { status: 400 }
        );
      }

      filter.priority = priority;
    }

    if (assignedTo) {
      if (!VALID_ASSIGNEES.includes(assignedTo as TaskAssignee)) {
        return NextResponse.json(
          { success: false, error: "Invalid assignee type." },
          { status: 400 }
        );
      }

      if (
        currentUser.role === "user" &&
        assignedTo !== "client"
      ) {
        return NextResponse.json(
          { success: false, error: "Forbidden." },
          { status: 403 }
        );
      }

      filter.assignedTo = assignedTo;
    }

    if (assignedUser) {
      if (!isValidObjectId(assignedUser)) {
        return NextResponse.json(
          { success: false, error: "Invalid assigned user ID." },
          { status: 400 }
        );
      }

      if (currentUser.role === "user") {
        if (assignedUser !== currentUser._id.toString()) {
          return NextResponse.json(
            { success: false, error: "Forbidden." },
            { status: 403 }
          );
        }
      } else {
        filter.assignedUser = assignedUser;
      }
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate("project", "title")
        .populate("assignedUser", "fname lname email image role")
        .populate("createdBy", "fname lname email image role")
        .sort({ dueDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Task.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: tasks,
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("GET /api/tasks ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load tasks." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 *
 * Admins can assign tasks to:
 * - The client associated with the selected project.
 * - Any existing admin, regardless of project association.
 *
 * Clients can create tasks for their own projects assigned to an admin.
 * createdBy always comes from the authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      project,
      title,
      description,
      status,
      priority,
      assignedTo,
      assignedUser,
      dueDate,
    } = body;

    // Validate project ID.
    if (
      typeof project !== "string" ||
      !project ||
      !isValidObjectId(project)
    ) {
      return NextResponse.json(
        { success: false, error: "A valid project is required." },
        { status: 400 }
      );
    }

    const projectRecord = await Project.findById(project)
      .select("_id client title")
      .lean();

    if (!projectRecord) {
      return NextResponse.json(
        { success: false, error: "Project not found." },
        { status: 404 }
      );
    }

    const isAdmin = currentUser.role === "admin";

    // Clients can only create tasks for their own projects.
    if (currentUser.role === "user") {
      if (
        !projectRecord.client ||
        projectRecord.client.toString() !== currentUser._id.toString()
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "You can only create tasks for your own projects.",
          },
          { status: 403 }
        );
      }
    } else if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden." },
        { status: 403 }
      );
    }

    // Validate title.
    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Task title is required." },
        { status: 400 }
      );
    }

    // Validate status.
    if (
      status !== undefined &&
      status !== null &&
      !VALID_STATUSES.includes(status as TaskStatus)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid task status." },
        { status: 400 }
      );
    }

    // Validate priority.
    if (
      priority !== undefined &&
      priority !== null &&
      !VALID_PRIORITIES.includes(priority as TaskPriority)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid task priority." },
        { status: 400 }
      );
    }

    // Validate assignment type.
    if (!VALID_ASSIGNEES.includes(assignedTo as TaskAssignee)) {
      return NextResponse.json(
        { success: false, error: "Invalid task assignment." },
        { status: 400 }
      );
    }

    // Clients can only assign tasks to admins.
    if (!isAdmin && assignedTo !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Clients can only create tasks assigned to admins.",
        },
        { status: 403 }
      );
    }

    // Validate assignee ID.
    if (
      typeof assignedUser !== "string" ||
      !assignedUser ||
      !isValidObjectId(assignedUser)
    ) {
      return NextResponse.json(
        { success: false, error: "A valid assigned user is required." },
        { status: 400 }
      );
    }

    const assignedUserRecord = await User.findById(assignedUser)
      .select("_id fname lname email role")
      .lean();

    if (!assignedUserRecord) {
      return NextResponse.json(
        { success: false, error: "Assigned user not found." },
        { status: 404 }
      );
    }

    // Validate the selected assignee's role and project relationship.
    if (assignedTo === "client") {
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: "Forbidden." },
          { status: 403 }
        );
      }

      if (assignedUserRecord.role !== "user") {
        return NextResponse.json(
          {
            success: false,
            error: "Client tasks must be assigned to a client.",
          },
          { status: 400 }
        );
      }

      if (
        !projectRecord.client ||
        projectRecord.client.toString() !==
          assignedUserRecord._id.toString()
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "The assigned client does not belong to this project.",
          },
          { status: 400 }
        );
      }
    } else if (assignedTo === "admin") {
      if (assignedUserRecord.role !== "admin") {
        return NextResponse.json(
          {
            success: false,
            error: "Admin tasks must be assigned to an admin.",
          },
          { status: 400 }
        );
      }

      // Intentionally no project-association check here.
      // Any valid admin can be assigned to a task.
    }

    // Validate due date.
    let parsedDueDate: Date | null = null;

    if (dueDate !== undefined && dueDate !== null && dueDate !== "") {
      parsedDueDate = new Date(dueDate);

      if (Number.isNaN(parsedDueDate.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid due date." },
          { status: 400 }
        );
      }
    }

    // Create task.
    const task = await Task.create({
      project: projectRecord._id,
      title: title.trim(),
      description:
        typeof description === "string" ? description.trim() : "",
      status: status || "Pending",
      priority: priority || "Medium",
      assignedTo,
      assignedUser: assignedUserRecord._id,
      dueDate: parsedDueDate,
      createdBy: currentUser._id,
    });

    // If an admin is assigned to a task, notify the project client
    // that the admin is handling the task. This is independent of
    // whether the selected admin is attached to the project.
    if (
      isAdmin &&
      assignedTo === "admin" &&
      projectRecord.client
    ) {
      const clientId = projectRecord.client;

      try {
        await createActivityNotification({
          recipient: clientId,
          actor: currentUser._id,
          project: projectRecord._id,
          task: task._id,
          type: "task",
          action: "assigned",
          title: "Your project has a new task",
          description: `${assignedUserRecord.fname ?? ""} ${
            assignedUserRecord.lname ?? ""
          } is handling "${title.trim()}" for ${projectRecord.title}.`,
          href: "/client/tasks",
        });
      } catch (notificationError) {
        console.error(
          "TASK ASSIGNMENT NOTIFICATION ERROR:",
          notificationError
        );
      }

      try {
        const client = await User.findById(clientId)
          .select("fname lname email")
          .lean();

        if (client?.email) {
          const clientName =
            `${client.fname ?? ""} ${client.lname ?? ""}`.trim() ||
            "there";

          const adminName =
            `${assignedUserRecord.fname ?? ""} ${
              assignedUserRecord.lname ?? ""
            }`.trim() || "Your project administrator";

          const formattedDueDate = parsedDueDate
            ? parsedDueDate.toLocaleDateString("en-GB")
            : "";

          const escapeHtml = (value: string) =>
            value.replace(/[&<>"']/g, (character) => {
              const entities: Record<string, string> = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
              };

              return entities[character];
            });

          const html = `
            <div style="font-family:Arial,sans-serif;line-height:1.7;color:#222;max-width:600px;margin:0 auto">
              <h2 style="color:#222">A new task is underway</h2>
              <p>Hello ${escapeHtml(clientName)},</p>
              <p>An admin has been assigned to handle a task on your project.</p>
              <div style="border:1px solid #e5e5e5;border-radius:10px;padding:18px;margin:20px 0">
                <p><strong>Project:</strong> ${escapeHtml(projectRecord.title ?? "")}</p>
                <p><strong>Task:</strong> ${escapeHtml(title.trim())}</p>
                <p><strong>Assigned to:</strong> ${escapeHtml(adminName)}</p>
                <p><strong>Priority:</strong> ${escapeHtml(priority || "Medium")}</p>
                ${
                  formattedDueDate
                    ? `<p><strong>Due date:</strong> ${escapeHtml(formattedDueDate)}</p>`
                    : ""
                }
              </div>
              <p>You can view your project tasks from your client dashboard.</p>
            </div>
          `;

          await sendEmailWithRetry(
            client.email,
            `Task update for ${projectRecord.title}`,
            html
          );
        }
      } catch (emailError) {
        console.error("TASK ASSIGNMENT EMAIL ERROR:", emailError);
      }
    }

    // Return populated task.
    const populatedTask = await Task.findById(task._id)
      .populate("project", "title")
      .populate("assignedUser", "fname lname email image role")
      .populate("createdBy", "fname lname email image role")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully.",
        data: populatedTask,
        task: populatedTask,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tasks ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to create task." },
      { status: 500 }
    );
  }
}
