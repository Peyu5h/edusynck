import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  price: z.number().min(0, "Price must be at least 0"),
});

export type CreateProductInput = z.infer<typeof productSchema>;