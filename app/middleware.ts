import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/sign-in", "/sign-up", "/api/auth"];

const teacherRoutePrefix = "/teacher";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("Middleware: Checking path:", pathname);

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );
  if (isPublicRoute) {
    console.log("Middleware: Public route, allowing access");
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const userCookie = request.cookies.get("user")?.value;

  if (!token && !userCookie) {
    console.log("Middleware: No authentication found, redirecting to sign-in");
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  console.log("Middleware: Authentication found, allowing access");
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
