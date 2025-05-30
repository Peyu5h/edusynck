import { Hono } from "hono";
import {
  login,
  register,
  registerTeacher,
  getCurrentUser,
  getUser,
} from "../controllers/authController";

const authRoutes = new Hono();

authRoutes.post("/register", register);
authRoutes.post("/register-teacher", registerTeacher);
authRoutes.post("/login", login);
authRoutes.get("/login", login);

authRoutes.post("/getUser", getUser);
authRoutes.get("/getUser", getUser);

authRoutes.get("/current-user", getCurrentUser);
authRoutes.post("/current-user", getCurrentUser);

export default authRoutes;
