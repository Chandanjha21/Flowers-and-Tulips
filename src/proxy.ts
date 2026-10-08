import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate for admin APIs: reject requests that do not even carry an admin cookie.
 * This is only a cheap first filter; every admin handler still validates the session against the DB.
 */
export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === "/api/admin/auth/login") return NextResponse.next();
  const hasCookie = req.cookies.has("__Host-pb_admin") || req.cookies.has("pb_admin");
  if (!hasCookie) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Authentication required" } },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/admin/:path*",
};
