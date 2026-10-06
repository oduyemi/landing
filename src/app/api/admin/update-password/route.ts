import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/utils/auth";


export async function PATCH(req: Request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const { newPassword } = await req.json();
  
    const hashed = await bcrypt.hash(newPassword, 10);
  
    currentUser.password = hashed;
    currentUser.firstLogin = false;
    currentUser.lastLogin = new Date();
  
    await currentUser.save();
  
    return NextResponse.json({ message: "Password updated" });
  }