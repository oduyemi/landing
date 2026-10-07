import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/user.model";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_FNAME = process.env.ADMIN_FNAME;
const ADMIN_LNAME = process.env.ADMIN_LNAME;

async function seedAdmin() {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not defined. Check your .env.local file."
    );
  }

  if (!ADMIN_EMAIL) {
    throw new Error(
      "ADMIN_EMAIL is not defined. Check your .env.local file."
    );
  }

  if (!ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_PASSWORD is not defined. Check your .env.local file."
    );
  }

  if (ADMIN_PASSWORD.length < 8) {
    throw new Error(
      "ADMIN_PASSWORD must be at least 8 characters long."
    );
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();

  console.log("Connecting to MongoDB...");

  await mongoose.connect(MONGODB_URI);

  console.log("Connected to MongoDB.");

  try {
    const existingAdmin = await User.findOne({
      email,
    });

    if (existingAdmin) {
      if (existingAdmin.role !== "admin") {
        throw new Error(
          `An account already exists for ${email}, but it is not an administrator.`
        );
      }

      console.log(`Admin already exists: ${email}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const admin = await User.create({
      fname: ADMIN_FNAME?.trim() || "Admin",
      lname: ADMIN_LNAME?.trim() || "User",
      email,
      password: hashedPassword,
      role: "admin",
      firstLogin: false,
    });

    console.log("");
    console.log("=================================");
    console.log("Administrator created successfully");
    console.log("=================================");
    console.log(`ID:    ${admin._id}`);
    console.log(`Name:  ${admin.fname} ${admin.lname}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role:  ${admin.role}`);
    console.log("=================================");
    console.log("");
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

seedAdmin().catch((error) => {
  console.error("ADMIN SEED ERROR:", error);
  process.exit(1);
});