import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(20, "Name can't be this long"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password can't be this long"),
  classNumber: z.string().max(10, "Class number can't be this long"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(6, "Password can't be this short")
    .max(20, "Password can't be this long"),
});

export const teacherRegisterSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(20, "Name can't be this long"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password can't be this long"),
  classNumber: z.string().max(10, "Class number can't be this long"),
  role: z.literal("CLASS_TEACHER").default("CLASS_TEACHER"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TeacherRegisterInput = z.infer<typeof teacherRegisterSchema>;
