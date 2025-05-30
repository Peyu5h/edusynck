import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Send a simple response to verify the API is working
  return NextResponse.json({
    status: "success",
    message: "API is working",
    timestamp: new Date().toISOString(),
    info: {
      node_env: process.env.NODE_ENV,
      next_runtime: process.env.NEXT_RUNTIME || "unknown",
    },
  });
}

export async function POST(request: NextRequest) {
  // Echo back the request body in the response
  try {
    const body = await request.json();
    return NextResponse.json({
      status: "success",
      message: "POST request received",
      timestamp: new Date().toISOString(),
      requestBody: body,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Could not parse request body",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
