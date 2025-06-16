import { Context, Next } from "hono";

// Enhanced CORS middleware for serverless environments
export const corsMiddleware = async (c: Context, next: Next) => {
  // Always set CORS headers regardless of method
  c.header("Access-Control-Allow-Origin", "*");
  c.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );
  c.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin",
  );
  c.header("Access-Control-Max-Age", "86400"); // 24 hours

  // Handle OPTIONS requests immediately
  if (c.req.method === "OPTIONS") {
    return new Response(null, {
      status: 204, // No content for preflight
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With, Accept, Origin",
        "Access-Control-Max-Age": "86400", // 24 hours
      },
    });
  }

  await next();

  // Ensure CORS headers are present on the response as well
  c.header("Access-Control-Allow-Origin", "*");
};
