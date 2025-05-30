import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";

import indexRoute from "./routes/index";

export const maxDuration = 300;

const app = new Hono().basePath("/api");

app.use(
  "*",
  cors({
    origin: "*",
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS", "DELETE", "PUT"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
  }),
);

const routes = app.route("/", indexRoute);

export type AppType = typeof routes;

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
