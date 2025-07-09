import { Context } from "hono";
import { prisma } from "~/lib/prisma";
import Pusher from "pusher";
import { getChannelName } from "~/lib/pusher-client";

const pusher = new Pusher({
  appId: process.env.NEXT_PUBLIC_PUSHER_APPID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.NEXT_PUBLIC_PUSHER_SECRET!,
  cluster: "ap2",
  useTLS: true,
});

export const getMessages = async (c: Context) => {
  const classId = c.req.param("classId");

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
      await prisma.chat.create({
        data: {
          name: `Class ${classId} Chat`,
          picture: "default_chat_picture_url",
        },
      });
      return c.json([]);
    }

    return c.json(chat.messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return c.json({ message: "Failed to fetch messages" }, 500);
  }
};

export const sendMessage = async (c: Context) => {
  try {
    const { room, content, sender, files } = await c.req.json();

    if (!room || !sender || (!content && (!files || files.length === 0))) {
      return c.json(
        { message: "Room, sender, and content or files are required" },
        400,
      );
    }

    let chat = await prisma.chat.findFirst({
      where: { name: `Class ${room} Chat` },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          name: `Class ${room} Chat`,
          picture: "default_chat_picture_url",
          users: { connect: { id: sender.id } },
        },
      });
    } else {
      await prisma.chat.update({
        where: { id: chat.id },
        data: { users: { connect: { id: sender.id } } },
      });
    }

    const newMessage = await prisma.message.create({
      data: {
        content: content || "",
        sender: { connect: { id: sender.id } },
        chat: { connect: { id: chat.id } },
        files: files || [],
      },
      include: {
        sender: true,
      },
    });

    const channelName = getChannelName(room);

    await pusher.trigger(channelName, "new-message", newMessage);

    return c.json({
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return c.json(
      {
        message: "Failed to send message",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};

export const pusherAuth = async (c: Context) => {
  try {
    const formData = await c.req.formData();
    const socketId = formData.get("socket_id")?.toString();
    const channel = formData.get("channel_name")?.toString();

    if (!socketId || !channel) {
      return c.json(
        { message: "Socket ID and channel name are required" },
        400,
      );
    }

    const auth = pusher.authorizeChannel(socketId, channel);

    return c.json(auth);
  } catch (error) {
    console.error("Error authorizing Pusher channel:", error);
    return c.json(
      {
        message: "Failed to authorize channel",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};
