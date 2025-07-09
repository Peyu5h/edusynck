import { Hono } from "hono";
import {
  getMessages,
  sendMessage,
  pusherAuth,
} from "../controllers/messageController";

const messageRoutes = new Hono();

// Message routes
messageRoutes.get("/messages/:classId", getMessages);
messageRoutes.post("/send", sendMessage);

// Pusher auth endpoint
messageRoutes.post("/pusher/auth", pusherAuth);

export default messageRoutes;
