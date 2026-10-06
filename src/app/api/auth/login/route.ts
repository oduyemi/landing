import { handleLogin } from "@/utils/auth";
import { dbConnect } from "@/utils/db";

export async function POST(req: Request) {
  try {
    await dbConnect();
    return handleLogin(req);
  } catch (error) {
    console.error("LOGIN ROUTE ERROR:", error);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}