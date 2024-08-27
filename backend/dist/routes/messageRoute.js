import express from "express";
import prisma from "../config/db.js";
const router = express.Router();
router.get("/messages/:classId", async (req, res) => {
    const { classId } = req.params;
    try {
        const chat = await prisma.chat.findFirst({
            where: { name: `Class ${classId} Chat` },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                    include: {
                        sender: true,
                    },
                },
            },
        });
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        res.status(200).json(chat.messages);
    }
    catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
});
export default router;
