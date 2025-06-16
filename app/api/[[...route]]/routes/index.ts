import { Hono } from "hono";
import userRoutes from "./userRoute";
import authRoutes from "./authRoute";
import adminRoutes from "./adminOnlyRoute";
import classRoutes from "./classRoute";
import quizRoutes from "./quizRoute";
import analyticsRoutes from "./analyticsRoute";
import messageRoutes from "./messageRoute";

const app = new Hono();

// Basic API test route
app.get("/ping", (c) => {
  return c.json({ message: "pong", time: new Date().toISOString() });
});

// Mount all subroutes
app.route("/user", userRoutes);
app.route("/auth", authRoutes);
app.route("/admin", adminRoutes);
app.route("/class", classRoutes);
app.route("/quiz", quizRoutes);
app.route("/analytics", analyticsRoutes);
app.route("/chat", messageRoutes);

// Export combined routes
export default app;
