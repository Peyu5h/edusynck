import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import indexRoute from "./routes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const app = new Hono();

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

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
