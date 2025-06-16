import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import indexRoute from "./routes";

const app = new Hono();

// Add logging middleware to help debug route issues
app.use("*", async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`);
  await next();
});

app.use(
  "*",
  cors({
    origin: "*",
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS", "DELETE", "PUT", "PATCH"],
    exposeHeaders: ["Content-Length"],
  }),
);

app.route("/api", indexRoute);

export type AppType = typeof app;

// Make sure all methods are properly handled and exported
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app); // Added PATCH method
export const DELETE = handle(app);
export const OPTIONS = handle(app);
