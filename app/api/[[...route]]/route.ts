import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import indexRoute from "./routes";

const app = new Hono();

// Better logging for debugging
app.use("*", async (c, next) => {
  const method = c.req.method;
  const url = c.req.url;
  console.log(`[${method}] ${url}`);

  try {
    await next();
  } catch (err) {
    console.error(`Error handling ${method} ${url}:`, err);
    return c.json(
      {
        error: "Internal server error",
        message: err instanceof Error ? err.message : "Unknown error occurred",
      },
      500,
    );
  }
});

// CORS setup
app.use(
  "*",
  cors({
    origin: "*",
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS", "DELETE", "PUT", "PATCH"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600, // 10 minutes
  }),
);

// Options pre-flight handler for CORS
app.options("*", (c) => {
  return new Response(null, { status: 204 });
});

// Mount API routes
app.route("/api", indexRoute);

export type AppType = typeof app;

// Export all HTTP methods that Vercel needs
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
export const HEAD = handle(app);
