import { Context } from "hono";
import { prisma } from "~/lib/prisma";
import { success, err, validationErr } from "../utils/response";
import { productSchema } from "../schemas/product.schema";

export const getProducts = async (c: Context) => {
  try {
    const products = await prisma.product.findMany();
    if (!products) {
      return c.json(err("No products found"), 404);
    }
    return c.json(success(products));
  } catch (error) {
    return c.json(err("Failed to fetch products"), 500);
  }
};

export const getProductByName = async (c: Context) => {
  try {
    const name = c.req.param("name");
    const product = await prisma.product.findFirst({ where: { name } });
    if (!product) {
      return c.json(err("Product not found"), 404);
    }
    return c.json(success(product));
  } catch (error) {
    return c.json(err("Failed to fetch product"), 500);
  }
};

export const createProduct = async (c: Context) => {
  try {
    const { name, price } = await c.req.json();
    const result = productSchema.safeParse({ name, price });
    if (!result.success) {
      return c.json(validationErr(result.error), 400);
    }
    const product = await prisma.product.create({ data: { name, price } });
    if (!product) {
      return c.json(err("Failed to add product"), 500);
    }
    return c.json(success(product));
  } catch (error) {
    return c.json(err("Failed to add product"), 500);
  }
};