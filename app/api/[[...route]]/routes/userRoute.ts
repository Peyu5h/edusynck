import { Hono } from "hono";
import {
  getUserById,
  getUsers,
  updateUserStreak,
} from "../controllers/userController";

const userRoutes = new Hono();

userRoutes.get("/:userId", getUserById);
userRoutes.get("/", getUsers);
userRoutes.post("/streak/:userId", updateUserStreak);

export default userRoutes;
