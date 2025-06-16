import { Hono } from "hono";
import { handle } from "hono/vercel";
import indexRoute from "./routes";
import { corsMiddleware } from "./middlewares/corsMiddleware";

export const app = new Hono();

// Debug route to show which handler processed the request
app.get("/debug-route", (c) => {
  return c.json({ handler: "route.ts", timestamp: new Date().toISOString() });
});

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
      },
      500,
    );
  }
});

// Apply CORS middleware
app.use("*", corsMiddleware);

// Mount API routes
app.route("/api", indexRoute);

// Export Next.js API route handlers
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);
export const HEAD = handle(app);
