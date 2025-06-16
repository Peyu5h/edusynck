import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Collect request information for debugging
  const headers = Object.fromEntries(request.headers);
  const url = request.url;
  const method = request.method;
  const nextUrl = request.nextUrl;

  return NextResponse.json({
    status: "ok",
    serverTime: new Date().toISOString(),
    request: {
      url,
      method,
      nextUrl: {
        href: nextUrl.href,
        pathname: nextUrl.pathname,
        searchParams: Object.fromEntries(nextUrl.searchParams),
      },
      headers: {
        ...headers,
        // Redact any sensitive headers
        authorization: headers.authorization ? "[REDACTED]" : undefined,
        cookie: headers.cookie ? "[REDACTED]" : undefined,
      },
    },
    environment: {
      node_env: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV,
      region: process.env.VERCEL_REGION,
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
