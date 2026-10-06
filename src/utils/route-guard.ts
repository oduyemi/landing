import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

export type ProtectedRole = "user" | "admin";

export async function protectRoute(
request: NextRequest,
allowedRoles: ProtectedRole[]
) {
const token = request.cookies.get("token")?.value;

if (!token) {
return NextResponse.redirect(
new URL("/login", request.url)
);
}

try {
const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error("JWT_SECRET is not configured.");
  return NextResponse.redirect(
    new URL("/login", request.url)
  );
}

const secretKey = new TextEncoder().encode(secret);

const { payload } = await jwtVerify(token, secretKey);

if (
  typeof payload.userId !== "string" ||
  !allowedRoles.includes(payload.role as ProtectedRole)
) {
  return NextResponse.redirect(
    new URL(
      payload.role === "user" ? "/client" : "/login",
      request.url
    )
  );
}

return NextResponse.next();

} catch {
const response = NextResponse.redirect(
new URL("/login", request.url)
);

response.cookies.delete("token");

return response;
}
}
