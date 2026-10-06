import { NextResponse } from "next/server";
import Project from "@/models/project.model";
import { dbConnect } from "@/utils/db";


export async function GET() {
  try {
    await dbConnect();
    const projects = await Project.find()
      .populate("client", "fname lname image")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      projects,
      count: projects.length,
    });
  } catch (error) {
    console.error("GET GENERAL PROJECTS ERROR:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}