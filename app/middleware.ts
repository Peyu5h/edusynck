import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const publicRoutes = ["/sign-in", "/sign-up", "/api/auth"];

const teacherRoutePrefix = "/teacher";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  const userRole = token.role as string;
  const isTeacher = userRole === "CLASS_TEACHER" || userRole === "ADMIN";
  const isStudent = userRole === "STUDENT";

  if (isTeacher) {
    if (
      !pathname.startsWith(teacherRoutePrefix) &&
      !pathname.startsWith("/api")
    ) {
      return NextResponse.redirect(new URL("/teacher/dashboard", request.url));
    }
  }

  if (isStudent) {
    if (pathname.startsWith(teacherRoutePrefix)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
