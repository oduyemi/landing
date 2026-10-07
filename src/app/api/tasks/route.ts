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

function isValidObjectId(value: string) {
return mongoose.Types.ObjectId.isValid(value);
}

/**

* GET /api/tasks
*
* Admin:
* Can view all tasks.
*
* Client:
* Can only view tasks assigned to themselves.
*
* Supported query params:
*
* ?project=PROJECT_ID
* ?status=Pending
* ?priority=High
* ?assignedTo=client
* ?assignedUser=USER_ID
* ?search=homepage
* ?page=1
* ?limit=20
  */
  export async function GET(req: NextRequest) {
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

  const { searchParams } = new URL(req.url);

  const project = searchParams.get("project");
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const assignedTo = searchParams.get("assignedTo");
  const assignedUser = searchParams.get("assignedUser");
  const search = searchParams.get("search")?.trim();

  const page = Math.max(
  Number.parseInt(
  searchParams.get("page") || "1",
  10
  ),
  1
  );

  const limit = Math.min(
  Math.max(
  Number.parseInt(
  searchParams.get("limit") || "20",
  10
  ),
  1
  ),
  100
  );

  const filter: Record<string, unknown> = {};

  /**

  * Clients may only see their own tasks.
  *
  * Admins can see all tasks and may use
  * assignedUser as a filter.
    */
    if (currentUser.role === "user") {
    filter.assignedUser = currentUser._id;
    }

  if (project) {
  if (!isValidObjectId(project)) {
  return NextResponse.json(
  {
  success: false,
  error: "Invalid project ID.",
  },
  { status: 400 }
  );
  }

  /**
  * Clients can only query tasks belonging to
  * projects assigned to them.
  */
  if (currentUser.role === "user") {
  const clientProject = await Project.findOne({
  _id: project,
  client: currentUser._id,
  })
  .select("_id")
  .lean();

   if (!clientProject) {
     return NextResponse.json(
       {
         success: false,
         error: "Forbidden.",
       },
       { status: 403 }
     );
   }

  }

  filter.project = project;
  }

  if (status) {
  if (
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

  filter.status = status;
  }

  if (priority) {
  if (
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

  filter.priority = priority;
  }

  if (assignedTo) {
  if (
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
  * A client cannot override the visibility rule
  * and ask for admin tasks or another client.
  */
  if (
  currentUser.role === "user" &&
  assignedTo !== "client"
  ) {
  return NextResponse.json(
  {
  success: false,
  error: "Forbidden.",
  },
  { status: 403 }
  );
  }

  filter.assignedTo = assignedTo;
  }

  if (assignedUser) {
  if (!isValidObjectId(assignedUser)) {
  return NextResponse.json(
  {
  success: false,
  error: "Invalid assigned user ID.",
  },
  { status: 400 }
  );
  }

  /**
  * Admin can filter by any assigned user.
  *
  * Clients cannot replace their own assignedUser
  * filter with another user's ID.
  */
  if (currentUser.role === "user") {
  if (
  assignedUser !==
  currentUser._id.toString()
  ) {
  return NextResponse.json(
  {
  success: false,
  error: "Forbidden.",
  },
  { status: 403 }
  );
  }
  } else {
  filter.assignedUser = assignedUser;
  }
  }

  if (search) {
  filter.$or = [
  {
  title: {
  $regex: search,
  $options: "i",
  },
  },
  {
  description: {
  $regex: search,
  $options: "i",
  },
  },
  ];
  }

  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
  Task.find(filter)
  .populate("project", "title")
  .populate(
  "assignedUser",
  "fname lname email image role"
  )
  .populate(
  "createdBy",
  "fname lname email image role"
  )
  .sort({
  dueDate: 1,
  createdAt: -1,
  })
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
  totalPages: Math.ceil(
  total / limit
  ),
  hasNextPage:
  page * limit < total,
  hasPreviousPage: page > 1,
  },
  });
  } catch (error) {
  console.error(
  "GET /api/tasks ERROR:",
  error
  );

  return NextResponse.json(
  {
  success: false,
  error: "Unable to load tasks.",
  },
  { status: 500 }
  );
  }
  }

/**

* POST /api/tasks
*
* Admin creates a task for a client.
* Client creates a task for an admin.
*
* createdBy is ALWAYS taken from the authenticated
* user and is never trusted from the request body.
  */
  export async function POST(req: NextRequest) {
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

  if (
  !project ||
  typeof project !== "string" ||
  !isValidObjectId(project)
  ) {
  return NextResponse.json(
  {
  success: false,
  error: "A valid project is required.",
  },
  { status: 400 }
  );
  }

  const projectRecord =
  await Project.findById(project)
  .select("_id client title")
  .lean();

  if (!projectRecord) {
  return NextResponse.json(
  {
  success: false,
  error: "Project not found.",
  },
  { status: 404 }
  );
  }

    if (
    currentUser.role === "user" &&
    projectRecord.client.toString() !==
    currentUser._id.toString()
    ) {
    return NextResponse.json(
    {
    success: false,
    error:
    "You can only create tasks for your own projects.",
    },
    { status: 403 }
    );
    }

  /*

  * ---
  * TITLE
  * ---

  */

  if (
  !title ||
  typeof title !== "string" ||
  !title.trim()
  ) {
  return NextResponse.json(
  {
  success: false,
  error: "Task title is required.",
  },
  { status: 400 }
  );
  }

  /*

  * ---
  * STATUS
  * ---

  */

  if (
  status &&
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

  /*

  * ---
  * PRIORITY
  * ---

  */

  if (
  priority &&
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

  /*

  * ---
  * ASSIGNMENT
  * ---
  *
  * The direction is determined by the creator's role.
  *
  * Admin  → client
  * Client → admin
    */

  const expectedAssignee: TaskAssignee =
  currentUser.role === "admin"
  ? "client"
  : "admin";

  if (
  assignedTo !== expectedAssignee
  ) {
  return NextResponse.json(
  {
  success: false,
  error:
  currentUser.role === "admin"
  ? "Admins can only create tasks assigned to clients."
  : "Clients can only create tasks assigned to admins.",
  },
  { status: 403 }
  );
  }

  /*

  * ---
  * ASSIGNED USER
  * ---

  */

  if (
  !assignedUser ||
  typeof assignedUser !== "string" ||
  !isValidObjectId(assignedUser)
  ) {
  return NextResponse.json(
  {
  success: false,
  error:
  "A valid assigned user is required.",
  },
  { status: 400 }
  );
  }

  const assignedUserRecord =
  await User.findById(assignedUser)
  .select("_id fname lname email role")
  .lean();

  if (!assignedUserRecord) {
  return NextResponse.json(
  {
  success: false,
  error: "Assigned user not found.",
  },
  { status: 404 }
  );
  }

  /*

  * Make sure the assigned user's actual role
  * matches assignedTo.
    */
    if (
    currentUser.role === "admin" &&
    assignedUserRecord.role !== "user"
    ) {
    return NextResponse.json(
    {
    success: false,
    error:
    "Admin tasks must be assigned to a client.",
    },
    { status: 400 }
    );
    }

  if (
  currentUser.role === "user" &&
  assignedUserRecord.role !== "admin"
  ) {
  return NextResponse.json(
  {
  success: false,
  error:
  "Client tasks must be assigned to an admin.",
  },
  { status: 400 }
  );
  }

  /*

  * When an admin assigns a task to a client,
  * ensure that client actually belongs to this project.
    */
    if (
    currentUser.role === "admin" &&
    assignedUserRecord.role === "user"
    ) {
    if (
    projectRecord.client.toString() !==
    assignedUserRecord._id.toString()
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

  /*

  * ---
  * DUE DATE
  * ---

  */

  let parsedDueDate: Date | null = null;

  if (dueDate) {
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

  /*

  * ---
  * CREATE
  * ---

  */

  const task = await Task.create({
  project: projectRecord._id,

  title: title.trim(),

  description:
  typeof description === "string"
  ? description.trim()
  : "",

  status:
  status || "Pending",

  priority:
  priority || "Medium",

  assignedTo,

  assignedUser:
  assignedUserRecord._id,

  dueDate: parsedDueDate,

  createdBy: currentUser._id,
  });

  /*

  * Return populated task.
    */

  const populatedTask =
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

  return NextResponse.json(
  {
  success: true,
  message:
  "Task created successfully.",
  data: populatedTask,
  task: populatedTask,
  },
  { status: 201 }
  );
  } catch (error) {
  console.error(
  "POST /api/tasks ERROR:",
  error
  );

  return NextResponse.json(
  {
  success: false,
  error: "Unable to create task.",
  },
  { status: 500 }
  );
  }
  }
