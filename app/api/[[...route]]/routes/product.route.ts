import { Hono } from "hono";
import {
  getProducts,
  getProductByName,
  createProduct,
} from "../controllers/product.controller";

const productRoutes = new Hono();

productRoutes.get("/", getProducts);
productRoutes.get("/:name", getProductByName);

// protected route
// productRoutes.post("/add", authMiddleware, createProduct);

export default productRoutes;
