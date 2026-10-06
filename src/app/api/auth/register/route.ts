
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "@/models/user.model";
import { sendOnboardingMail } from "@/helper/sendOnboardingMail";
import { getCurrentUser } from "@/utils/auth";


type Role = "user" | "admin";


export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getCurrentUser();
    const body = await req.json();
    const {fname, lname, email, role}: {
      fname?: string;
      lname?: string;
      email?: string;
      role?: Role;
    } = body;

    if (
      typeof fname !== "string" ||
      typeof lname !== "string" ||
      typeof email !== "string" ||
      !fname.trim() ||
      !lname.trim() ||
      !email.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "First name, last name and email are required.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const requestedRole: Role = role ?? "user";
    if (
      requestedRole !== "user" &&
      requestedRole !== "admin"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid role. Role must be either user or admin.",
        },
        { status: 400 }
      );
    }
    const existingAccountCount = await User.countDocuments();
    const isFirstAccount = existingAccountCount === 0;
    if (isFirstAccount) {
      return NextResponse.json(
        {
          error:
            "No administrator exists. Initialize the first administrator using a secure bootstrap procedure.",
        },
        { status: 403 }
      );
    }

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "Forbidden. Only administrators can create accounts.",
        },
        { status: 403 }
      );
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const temporaryCode = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(
      temporaryCode,
      12
    );

    const newUser = await User.create({
      fname: fname.trim(),
      lname: lname.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: requestedRole,
      firstLogin: true,
    });

    let emailSent = true;
    try {
      await sendOnboardingMail(
        newUser.email,
        temporaryCode,
        newUser.role,
        newUser.fname
      );
    } catch (emailError) {
      emailSent = false;

      console.error(
        "ONBOARDING EMAIL ERROR:",
        emailError
      );
    }
    return NextResponse.json(
      {
        message: emailSent
          ? `${requestedRole === "admin" ? "Administrator" : "User"} account created successfully.`
          : "Account created, but the onboarding email could not be sent. Please retry the invitation.",

        emailSent,

        user: {
          _id: newUser._id,
          fname: newUser.fname,
          lname: newUser.lname,
          email: newUser.email,
          role: newUser.role,
          firstLogin: newUser.firstLogin,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}