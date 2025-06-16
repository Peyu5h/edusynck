import { NextRequest, NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Don't process API routes
  if (pathname.startsWith("/api")) {
    console.log("Middleware: Skipping API route", pathname);
    return NextResponse.next();
  }

  // Don't process health or debug endpoints
  if (
    pathname === "/health" ||
    pathname === "/api/debug" ||
    pathname === "/api/ping"
  ) {
    console.log("Middleware: Skipping health/debug route", pathname);
    return NextResponse.next();
  }

  // Don't process Next.js specific routes
  if (pathname.includes("/_next/") || pathname.includes("/favicon.ico")) {
    return NextResponse.next();
  }

  // Handle auth routes
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    return NextResponse.next();
  }

  // Check for JWT token in auth header or cookie
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    request.cookies.get("token")?.value;

  // If user is not logged in, redirect to sign-in
  if (!token && !pathname.startsWith("/teacher")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // For other paths, just continue
  return NextResponse.next();
}

// Only run middleware on API routes
export const config = {
  matcher: "/api/:path*",
};
