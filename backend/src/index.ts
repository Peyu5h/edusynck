import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import routes from "./routes/index.js";
import http from "http";
import prisma from "./config/db.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(express.static("public"));
app.use(cors({ origin: "*" }));

const port: number = parseInt(process.env.PORT || "8000");

app.use("/api", routes);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join_room", async (data) => {
    socket.join(data.room);
    console.log(`User joined room: ${data.room}`);

    let chat = await prisma.chat.findFirst({
      where: { name: `Class ${data.room} Chat` },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          name: `Class ${data.room} Chat`,
          picture: "default_chat_picture_url",
          ...(data.userId && { users: { connect: { id: data.userId } } }),
        },
      });
    } else if (data.userId) {
      await prisma.chat.update({
        where: { id: chat.id },
        data: { users: { connect: { id: data.userId } } },
      });
    }
  });

  socket.on("send_message", async (data) => {
    try {
      console.log("Received message data:", JSON.stringify(data, null, 2));

      const chat = await prisma.chat.findFirst({
        where: { name: `Class ${data.room} Chat` },
      });

      if (!chat) {
        throw new Error("Chat not found");
      }

      if (!data.content && (!data.files || data.files.length === 0)) {
        throw new Error("Message content or files are required");
      }

      const newMessage = await prisma.message.create({
        data: {
          content: data.content || "",
          sender: { connect: { id: data.sender.id } },
          chat: { connect: { id: chat.id } },
          files: data.files, // This should contain the array of file objects
        },
        include: {
          sender: true,
        },
      });

      console.log("Created new message:", JSON.stringify(newMessage, null, 2));

      io.to(data.room).emit("receive_message", newMessage);
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("message_error", {
        message: "Failed to save message",
        error: error.message,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
