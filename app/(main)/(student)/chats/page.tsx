"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { useUser } from "~/hooks/useUser";
import axios from "axios";
import { AxiosResponse } from "axios";
import ChatInput from "~/components/ChatPage/Attachement/ChatInput";
import Messages from "~/components/ChatPage/Messages";
import SubjectCardLoader from "~/components/Loaders/SubjectCardLoader";
import ChatScreenLoader from "~/components/Loaders/ChatScreenLoader";
import { subscribeToClassChat } from "~/lib/pusher-client";

interface Message {
  id: string;
  sender: { id: string; name: string };
  content: string;
  files?: any[];
  createdAt: string;
}

export default function ChatsPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial messages
  useEffect(() => {
    async function fetchMessages() {
      if (!user?.classId) return;

      try {
        setIsLoading(true);
        const response = await axios.get<Message[]>(
          `/api/chat/messages/${user.classId}`,
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMessages();
  }, [user?.classId]);

  useEffect(() => {
    if (!user?.classId) return;

    const unsubscribe = subscribeToClassChat(
      user.classId,
      (newMessage: Message) => {
        console.log("Received new message:", newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      },
    );
    return () => {
      unsubscribe();
    };
  }, [user?.classId]);

  // auto scroll bottom
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (message: string, files?: File[]) => {
    if (
      (message.trim() || (files && files.length > 0)) &&
      user?.classId &&
      user?.id &&
      user?.name
    ) {
      const messageData: any = {
        room: user.classId,
        content: message,
        sender: { id: user.id, name: user.name },
        files: [],
      };

      if (files && files.length > 0) {
        const uploadedFiles = await Promise.all(
          files.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append(
              "upload_preset",
              process.env.NEXT_PUBLIC_CLOUDINARY_SECRET || "",
            );

            const response = await axios.post(
              "https://api.cloudinary.com/v1_1/dkysrpdi6/auto/upload",
              formData,
            );

            return {
              url: response.data.secure_url,
              type: file.type,
              name: file.name,
            };
          }),
        );

        messageData.files = uploadedFiles;
      }

      try {
        await axios.post("/api/chat/send", messageData);
        console.log("Message sent successfully");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  if (!user || !user.classId) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <SubjectCardLoader key={index} />
        ))}
      </div>
    );
  }

  if (isLoading) {
    return <ChatScreenLoader />;
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div
        ref={messagesContainerRef}
        className="scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-4"
      >
        <Messages messages={messages} currentUserId={user.id} />
      </div>
      <div className="w-full bg-transparent px-2 pb-4 pt-2">
        <ChatInput onSend={sendMessage} />
      </div>
    </div>
  );
}
