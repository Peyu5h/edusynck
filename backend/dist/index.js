import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import routes from "./routes/index.js";
dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
    },
});
app.use(express.json());
app.use(express.static("public"));
app.use(cors({ origin: "*" }));
const port = parseInt(process.env.PORT || "8000");
app.use("/api", routes);
io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("join_room", (data) => {
        socket.join(data.room);
        console.log(`User joined room: ${data.room}`);
    });
    socket.on("send_message", (data) => {
        console.log("Received message:", data);
        io.to(data.room).emit("receive_message", data);
    });
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
