import { NextResponse } from "next/server";

// Simple root API handler to explain API usage and test that the route system works
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Academia API is running",
    routes: {
      "/api": "This API root with documentation",
      "/api/health": "Health check endpoint",
      "/api/auth/*": "Authentication endpoints",
      "/api/user/*": "User management endpoints",
      "/api/class/*": "Class management endpoints",
      "/api/quiz/*": "Quiz management endpoints",
      "/api/chat/*": "Chat functionality endpoints",
    },
    timestamp: new Date().toISOString(),
    version: "1.0",
  });
}

// Handle OPTIONS preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// Also export all other methods to prevent 405 errors
export async function POST() {
  return methodNotAllowed();
}

export async function PUT() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}

// Helper function for method not allowed responses
function methodNotAllowed() {
  return NextResponse.json(
    {
      error: "Method Not Allowed",
      message: "This endpoint only supports GET and OPTIONS requests",
      availableMethods: ["GET", "OPTIONS"],
    },
    { status: 405 },
  );
}
