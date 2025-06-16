import { Hono } from "hono";
import {
  login,
  register,
  registerTeacher,
  getCurrentUser,
  getUser,
} from "../controllers/authController";

const authRoutes = new Hono();

// User registration
authRoutes.post("/register", register);
authRoutes.post("/register-teacher", registerTeacher);

// Login routes - support both GET and POST
authRoutes.post("/login", login);
authRoutes.get("/login", login);

// User info routes - support both GET and POST
authRoutes.get("/getUser", getUser);
authRoutes.post("/getUser", getUser);

// Current user routes
authRoutes.get("/current-user", getCurrentUser);
authRoutes.post("/current-user", getCurrentUser);

export default authRoutes;
