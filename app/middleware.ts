import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/sign-in", "/sign-up", "/api/auth"];

const teacherRoutePrefix = "/teacher";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("Middleware: Checking path:", pathname);

  if (request.nextUrl.hostname === "edysynck.peyush.in") {
    return NextResponse.redirect(
      new URL(request.nextUrl.pathname, "https://edusynck.peyush.in"),
    );
  }

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );
  if (isPublicRoute) {
    console.log("Middleware: Public route, allowing access");
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const userCookie = request.cookies.get("user")?.value;

  // Allow access if either token or user cookie exists
  if (!token && !userCookie) {
    // Don't redirect immediately for API routes or static assets
    if (pathname.startsWith("/api/") || pathname.includes("_next")) {
      return NextResponse.next();
    }

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
