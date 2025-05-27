import { Hono } from "hono";
import productRoutes from "./product.route";
import userRoutes from "./userRoute";
import authRoutes from "./authRoute";
import adminRoutes from "./adminOnlyRoute";
import classRoutes from "./classRoute";

const indexRoute = new Hono();

// test route
indexRoute.get("/", (c) => {
  return c.json({ message: "working" });
});

// routes
indexRoute.route("/products", productRoutes);
indexRoute.route("/user", userRoutes);
indexRoute.route("/auth", authRoutes);
indexRoute.route("/admin", adminRoutes);
indexRoute.route("/class", classRoutes);

export default indexRoute;
