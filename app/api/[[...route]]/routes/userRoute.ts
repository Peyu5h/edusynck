import { Hono } from "hono";
import {
  getUserById,
  getUsers,
  updateUserStreak,
} from "../controllers/userController";

const userRoutes = new Hono();

// Get user by ID
userRoutes.get("/:userId", getUserById);

// Get all users (with optional filtering)
userRoutes.get("/", getUsers);

// Update user streak
userRoutes.post("/streak/:userId", updateUserStreak);

export default userRoutes;
