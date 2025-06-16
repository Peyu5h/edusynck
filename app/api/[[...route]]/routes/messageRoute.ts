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

// Pusher auth endpoint - support both POST and OPTIONS for CORS preflight
messageRoutes.post("/pusher/auth", pusherAuth);
messageRoutes.options("/pusher/auth", (c) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  c.header("Access-Control-Max-Age", "86400");
  return new Response(null, { status: 204 });
});

export default messageRoutes;
