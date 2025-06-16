import { Hono } from "hono";
import { handle } from "hono/vercel";
import indexRoute from "./routes";
import { corsMiddleware } from "./middlewares/corsMiddleware";

// Create a new Hono app instance
export const app = new Hono();

// Better logging for debugging
app.use("*", async (c, next) => {
  const method = c.req.method;
  const url = c.req.url;
  const path = new URL(url).pathname;
  console.log(`[${method}] ${path}`);

  try {
    await next();
  } catch (err) {
    console.error(`Error handling ${method} ${path}:`, err);
    return c.json(
      {
        error: "Internal server error",
        message: err instanceof Error ? err.message : "Unknown error occurred",
        stack:
          process.env.NODE_ENV === "development" && err instanceof Error
            ? err.stack
            : undefined,
      },
      500,
    );
  }
});

// Apply CORS middleware
app.use("*", corsMiddleware);

// API root documentation
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "Academia API is running",
    routes: {
      "/": "This API root with documentation",
      "/health": "Health check endpoint at /health",
      "/auth/*": "Authentication endpoints",
      "/user/*": "User management endpoints",
      "/class/*": "Class management endpoints",
      "/quiz/*": "Quiz management endpoints",
      "/chat/*": "Chat functionality endpoints",
    },
    timestamp: new Date().toISOString(),
    version: "1.0",
  });
});

// Health endpoint within API
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "unknown",
  });
});

// Debug route to verify which handler is processing requests
app.get("/debug", (c) => {
  return c.json({
    handler: "hono-api-route",
    timestamp: new Date().toISOString(),
    path: c.req.path,
    url: c.req.url,
  });
});

// Mount all API routes directly (no nesting)
app.route("/", indexRoute);

// Add a fallback for unmatched routes
app.all("*", (c) => {
  return c.json(
    {
      error: "Not Found",
      message: `Route ${c.req.path} not found`,
      timestamp: new Date().toISOString(),
    },
    404,
  );
});

// Export Next.js API route handlers
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);
export const HEAD = handle(app);
