import { NextRequest, NextResponse } from "next/server";
import { protectRoute } from "@/utils/route-guard";

export async function proxy(request: NextRequest) {
const pathname = request.nextUrl.pathname;

if (pathname.startsWith("/admin")) {
return protectRoute(request, ["admin"]);
}

if (pathname.startsWith("/client")) {
return protectRoute(request, ["user"]);
}

return NextResponse.next();
}

export const config = {
matcher: ["/client/:path*", "/admin/:path*"],
};
