import { Hono } from "hono";
import productRoutes from "./product.route";

const indexRoute = new Hono();

// test route
indexRoute.get("/", (c) => {
  return c.json({ message: "working" });
});

// routes
indexRoute.route("/products", productRoutes);

export default indexRoute;
