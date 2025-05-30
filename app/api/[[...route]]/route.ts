import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import indexRoute from "./routes";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS", "DELETE", "PUT"],
    exposeHeaders: ["Content-Length"],
  }),
);

const routes = app.route("/api", indexRoute);

export type AppType = typeof routes;

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
