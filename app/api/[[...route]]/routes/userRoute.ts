import { Hono } from "hono";
import {
  getUserById,
  getUsers,
  updateUserStreak,
  updateUser,
} from "../controllers/userController";

const userRoutes = new Hono();

userRoutes.get("/:userId", getUserById);
userRoutes.get("/", getUsers);
userRoutes.put("/:userId", updateUser);
userRoutes.post("/streak/:userId", updateUserStreak);

export default userRoutes;
