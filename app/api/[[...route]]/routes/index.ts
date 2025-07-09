import { Hono } from "hono";
import userRoutes from "./userRoute";
import authRoutes from "./authRoute";
import adminRoutes from "./adminOnlyRoute";
import classRoutes from "./classRoute";
import quizRoutes from "./quizRoute";
import analyticsRoutes from "./analyticsRoute";
import messageRoutes from "./messageRoute";

const indexRoute = new Hono();

// test route
indexRoute.get("/", (c) => {
  return c.json({ message: "working" });
});

// routes
indexRoute.route("/user", userRoutes);
indexRoute.route("/auth", authRoutes);
indexRoute.route("/admin", adminRoutes);
indexRoute.route("/class", classRoutes);
indexRoute.route("/quiz", quizRoutes);
indexRoute.route("/analytics", analyticsRoutes);
indexRoute.route("/chat", messageRoutes);

export default indexRoute;
