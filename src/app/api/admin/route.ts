import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/user.model";
import { getCurrentUser, requireRole } from "@/utils/auth";
import { sendOnboardingMail } from "@/helper/sendOnboardingMail";


export async function GET() {
  const user = await getCurrentUser();

  console.log("USER:", user);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const roleError = requireRole(user, ["admin"]);
  if (roleError) return roleError;

  const admins = await User.find({ role: "admin" }).select("-password");

  return NextResponse.json(admins);
}


export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roleError = requireRole(currentUser, ["admin"]);
  if (roleError) return roleError;

  const { fname, lname, email, password } = await req.json();
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }
  
  const hashed = await bcrypt.hash(password, 10);

  const exists = await User.findOne({ email });
  if (exists) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  await User.create({
    fname,
    lname,
    email,
    password: hashed,
    role: "admin",
    firstLogin: true,
  });

  await sendOnboardingMail(email, password);

  return NextResponse.json({ message: "Admin created successfully" });
}