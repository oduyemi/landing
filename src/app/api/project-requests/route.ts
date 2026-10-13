import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import ProjectRequest from "@/models/project-request.model";
import User from "@/models/user.model";
import { dbConnect } from "@/utils/db";
import { getCurrentUser, requireRole } from "@/utils/auth";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Project requests are submitted by client accounts.
    const roleError = requireRole(currentUser, ["user"]);
    if (roleError) return roleError;

    const body = await req.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";
    const type =
      typeof body.type === "string" ? body.type.trim() : "";
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";
    const assignedAdmin =
      typeof body.assignedAdmin === "string"
        ? body.assignedAdmin
        : "";

    if (!title || !type || !description || !assignedAdmin) {
      return NextResponse.json(
        {
          error:
            "Title, project type, description, and administrator are required.",
        },
        { status: 400 }
      );
    }

    if (
      title.length > 150 ||
      type.length > 100 ||
      description.length > 5000
    ) {
      return NextResponse.json(
        { error: "One or more fields exceed the allowed length." },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(assignedAdmin)) {
      return NextResponse.json(
        { error: "Invalid administrator ID." },
        { status: 400 }
      );
    }

    const admin = await User.findById(assignedAdmin).select("_id role");

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { error: "Requests can only be assigned to an administrator." },
        { status: 400 }
      );
    }

    const parseOptionalDate = (value: unknown) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }

      if (typeof value !== "string") return null;

      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    };

    const preferredStartDate = parseOptionalDate(
      body.preferredStartDate
    );
    const preferredDeadline = parseOptionalDate(
      body.preferredDeadline
    );

    if (
      preferredStartDate === null ||
      preferredDeadline === null
    ) {
      return NextResponse.json(
        { error: "A preferred date is invalid." },
        { status: 400 }
      );
    }

    if (
      preferredStartDate &&
      preferredDeadline &&
      preferredDeadline < preferredStartDate
    ) {
      return NextResponse.json(
        { error: "The preferred deadline cannot precede the start date." },
        { status: 400 }
      );
    }

    const request = await ProjectRequest.create({
      title,
      type,
      description,
      preferredStartDate,
      preferredDeadline,
      requester: currentUser._id,
      assignedAdmin: admin._id,
    });

    return NextResponse.json(
      {
        message: "Project request submitted successfully.",
        request,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE PROJECT REQUEST ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// Only administrators can retrieve the project request queue.
export async function GET() {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const roleError = requireRole(currentUser, ["admin"]);
    if (roleError) return roleError;

    const requests = await ProjectRequest.find({
      assignedAdmin: currentUser._id,
    })
      .populate("requester", "fname lname email image")
      .populate("assignedAdmin", "fname lname email")
      .populate("reviewedBy", "fname lname email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      requests,
      count: requests.length,
    });
  } catch (error) {
    console.error("GET PROJECT REQUESTS ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}