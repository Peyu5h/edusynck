import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import indexRoute from "./routes/index";

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

// Custom config for Vercel with longer timeouts
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Larger payload support
    },
    responseLimit: "10mb", // Larger response support
  },
  maxDuration: 300, // Set maximum duration to 5 minutes (in seconds)
};

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
