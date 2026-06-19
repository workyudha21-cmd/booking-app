import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple path-based middleware - auth check happens server-side in each page
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't need auth
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/pricing",
    "/features",
    "/api/auth",
    "/api/public",
  ];

  // Check if path starts with public paths
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(path + "/"));

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
