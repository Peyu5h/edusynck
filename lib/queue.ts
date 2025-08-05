import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { prisma } from "./prisma";
import Pusher from "pusher";

// Redis connection with fallback
let redis: Redis | null = null;
let isRedisConnected = false;

try {
  redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  redis.on("connect", () => {
    console.log("Connected to Redis");
    isRedisConnected = true;
  });

  redis.on("error", (error) => {
    console.error("Redis connection error:", error);
    isRedisConnected = false;
  });

  redis.on("close", () => {
    console.log("Redis connection closed");
    isRedisConnected = false;
  });
} catch (error) {
  console.error("Failed to initialize Redis:", error);
  isRedisConnected = false;
}

// Pusher configuration
const pusher = new Pusher({
  appId: process.env.NEXT_PUBLIC_PUSHER_APPID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.NEXT_PUBLIC_PUSHER_SECRET!,
  cluster: "ap2",
  useTLS: true,
});

// Message queue
export const messageQueue = new Queue("chat-messages", {
  connection: redis!,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});

// Rate limiting queue
export const rateLimitQueue = new Queue("rate-limit", {
  connection: redis!,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 10,
  },
});

// Message status queue
export const messageStatusQueue = new Queue("message-status", {
  connection: redis!,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 10,
  },
});

// Worker for processing failed messages
const messageWorker = new Worker(
  "chat-messages",
  async (job: Job) => {
    const { room, content, sender, files } = job.data;

    try {
      // Find or create chat
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
      }

      // Create message in database
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

      // Try to send via Pusher
      const channelName = `class-${room}-chat`;
      await pusher.trigger(channelName, "new-message", newMessage);

      console.log(`Successfully processed queued message ${job.id}`);
      return newMessage;
    } catch (error) {
      console.error(`Failed to process queued message ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: redis!,
    concurrency: 5,
  },
);

// Worker for rate limiting
const rateLimitWorker = new Worker(
  "rate-limit",
  async (job: Job) => {
    const { userId } = job.data;

    // Check if user has exceeded rate limit
    const userJobs = await rateLimitQueue.getJobs(["active", "waiting"]);
    const userJobCount = userJobs.filter(
      (job) => job.data.userId === userId,
    ).length;

    if (userJobCount > 10) {
      throw new Error("Rate limit exceeded");
    }

    return { allowed: true };
  },
  {
    connection: redis!,
    concurrency: 10,
  },
);

// Worker for message status updates
const messageStatusWorker = new Worker(
  "message-status",
  async (job: Job) => {
    const { messageId, status } = job.data;

    // Update message status in database or cache
    // For now, we'll just log it
    console.log(`Message ${messageId} status: ${status}`);

    return { messageId, status };
  },
  {
    connection: redis!,
    concurrency: 10,
  },
);

// Helper functions
export const addMessageToQueue = async (messageData: any) => {
  if (!isRedisConnected || !redis) {
    console.log("Redis not connected, skipping queue operation");
    return;
  }

  try {
    await messageQueue.add("send-message", messageData, {
      delay: 0,
      priority: 1,
    });
    console.log("Message added to queue");
  } catch (error) {
    console.error("Failed to add message to queue:", error);
  }
};

export const checkRateLimit = async (userId: string): Promise<boolean> => {
  if (!isRedisConnected || !redis) {
    console.log("Redis not connected, allowing message");
    return true;
  }

  try {
    // Use Redis directly for rate limiting instead of queue
    const key = `rate:${userId}:messages`;
    const count = await redis.get(key);
    const currentCount = count ? parseInt(count) : 0;

    if (currentCount >= 10) {
      return false; // Rate limit exceeded
    }

    await redis.setex(key, 60, (currentCount + 1).toString());
    return true;
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return true; // Allow if rate limiting fails
  }
};

export const setMessageStatus = async (messageId: string, status: string) => {
  if (!isRedisConnected || !redis) {
    console.log("Redis not connected, skipping status update");
    return;
  }

  try {
    await messageStatusQueue.add(
      "update-status",
      { messageId, status },
      {
        delay: 0,
        removeOnComplete: true,
      },
    );
  } catch (error) {
    console.error("Failed to set message status:", error);
  }
};

// Cache functions using Redis directly
export const cacheChatMessages = async (classId: string, messages: any[]) => {
  if (!isRedisConnected || !redis) {
    console.log("Redis not connected, skipping cache operation");
    return false;
  }

  try {
    const key = `chat:${classId}:messages`;
    const value = JSON.stringify(messages);
    await redis.setex(key, 3600, value);
    return true;
  } catch (error) {
    console.error("Failed to cache messages:", error);
    return false;
  }
};

export const getCachedChatMessages = async (
  classId: string,
): Promise<any[] | null> => {
  if (!isRedisConnected || !redis) {
    console.log("Redis not connected, skipping cache retrieval");
    return null;
  }

  try {
    const key = `chat:${classId}:messages`;
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Failed to get cached messages:", error);
    return null;
  }
};

export const setUserOnline = async (userId: string, classId: string) => {
  if (!isRedisConnected || !redis) {
    console.log("Redis not connected, skipping online status");
    return;
  }

  try {
    const key = `user:${userId}:online`;
    await redis.setex(key, 300, classId);
  } catch (error) {
    console.error("Failed to set user online:", error);
  }
};

export const getUserOnlineStatus = async (
  userId: string,
): Promise<string | null> => {
  if (!isRedisConnected || !redis) {
    console.log("Redis not connected, skipping online status");
    return null;
  }

  try {
    const key = `user:${userId}:online`;
    return await redis.get(key);
  } catch (error) {
    console.error("Failed to get user online status:", error);
    return null;
  }
};

// Graceful shutdown
export const closeQueue = async () => {
  try {
    await messageQueue.close();
    await rateLimitQueue.close();
    await messageStatusQueue.close();
    await messageWorker.close();
    await rateLimitWorker.close();
    await messageStatusWorker.close();
    if (redis) {
      await redis.quit();
    }
  } catch (error) {
    console.error("Error closing queue:", error);
  }
};

// Error handling
messageWorker.on("error", (error) => {
  console.error("Message worker error:", error);
});

rateLimitWorker.on("error", (error) => {
  console.error("Rate limit worker error:", error);
});

messageStatusWorker.on("error", (error) => {
  console.error("Message status worker error:", error);
});

console.log("BullMQ queue system initialized");
