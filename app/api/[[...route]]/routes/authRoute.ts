import { Hono } from "hono";
import {
  login,
  register,
  registerTeacher,
  getCurrentUser,
} from "../controllers/authController";

const authRoutes = new Hono();

authRoutes.post("/register", register);
authRoutes.post("/register-teacher", registerTeacher);
authRoutes.post("/login", login);
authRoutes.get("/me", getCurrentUser);

export default authRoutes;
