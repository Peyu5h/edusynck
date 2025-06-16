import { Context, Next } from "hono";

// Custom CORS middleware for serverless environments
export const corsMiddleware = async (c: Context, next: Next) => {
  // Access control headers for regular requests
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

  // Handle preflight OPTIONS requests immediately
  if (c.req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
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
};
