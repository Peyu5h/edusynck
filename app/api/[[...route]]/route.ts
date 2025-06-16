import { Hono } from "hono";
import { handle } from "hono/vercel";
import indexRoute from "./routes";
import { corsMiddleware } from "./middlewares/corsMiddleware";

// Create a new Hono app instance
export const app = new Hono();

// Add CORS headers for Vercel environment
app.use("*", corsMiddleware);

// Better error handling
app.use("*", async (c, next) => {
  try {
    await next();
  } catch (err) {
    console.error("API Error:", err);
    return c.json(
      {
        error: "Internal server error",
        message: err instanceof Error ? err.message : "Unknown error occurred",
        serverTime: new Date().toISOString(),
      },
      500,
    );
  }
});

// Debug/healthcheck endpoint
app.get("/debug", (c) => {
  return c.json({
    ok: true,
    timestamp: new Date().toISOString(),
    path: c.req.path,
    env: process.env.NODE_ENV || "unknown",
  });
});

// API root documentation
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "Academia API running",
    timestamp: new Date().toISOString(),
  });
});

// Mount all routes directly (no nesting/prefixes)
app.route("/", indexRoute);

// Export handler functions
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);
export const HEAD = handle(app);
