import { NextRequest, NextResponse } from "next/server";
import { login } from "../../[[...route]]/controllers/authController";
import { Context } from "hono";

export async function POST(request: NextRequest) {
  try {
    // Create a mock Hono context
    const body = await request.json();
    const c = {
      req: {
        method: "POST",
        json: () => Promise.resolve(body),
        query: () => null,
      },
      json: (data: any, status = 200) => {
        return NextResponse.json(data, { status });
      },
      text: (text: string) => {
        return new NextResponse(text);
      },
      header: () => {},
    } as unknown as Context;

    return login(c);
  } catch (error) {
    console.error("Direct login route error:", error);
    return NextResponse.json(
      {
        error: "Login failed",
        message: error instanceof Error ? error.message : "Unknown error",
        serverTime: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
