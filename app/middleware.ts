import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that don't require authentication
const publicRoutes = ["/sign-in", "/sign-up", "/api/auth"];

// Routes that are only accessible to teachers (they must have a /teacher prefix)
const teacherRoutePrefix = "/teacher";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is a public route that doesn't require authentication
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get the token from the session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If no token exists, redirect to sign-in
  if (!token) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Get user role from token
  const userRole = token.role as string;
  const isTeacher = userRole === "CLASS_TEACHER" || userRole === "ADMIN";
  const isStudent = userRole === "STUDENT";

  // Teacher role checks
  if (isTeacher) {
    // Teachers can only access routes with /teacher prefix
    if (
      !pathname.startsWith(teacherRoutePrefix) &&
      !pathname.startsWith("/api")
    ) {
      return NextResponse.redirect(new URL("/teacher/dashboard", request.url));
    }
  }

  // Student role checks
  if (isStudent) {
    // Students cannot access teacher routes
    if (pathname.startsWith(teacherRoutePrefix)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // If all checks pass, proceed with the request
  return NextResponse.next();
}

export const config = {
  // Apply this middleware to all routes except _next, static files, and assets
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
