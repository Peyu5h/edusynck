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

  // Fetch initial messages when component mounts or user changes
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

  // Subscribe to Pusher channel for real-time updates
  useEffect(() => {
    if (!user?.classId) return;

    // Subscribe to class chat events
    const unsubscribe = subscribeToClassChat(
      user.classId,
      (newMessage: Message) => {
        console.log("Received new message:", newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      },
    );

    // Cleanup subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, [user?.classId]);

  // Scroll to bottom when messages change
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

      // Process file uploads if any (maintain existing functionality)
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
        // Send message using our new API endpoint
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
    <Card className="mx-auto mt-[-60px] flex h-[84vh] w-full max-w-6xl flex-col justify-between overflow-hidden border-none bg-transparent">
      <CardContent>
        <div
          ref={messagesContainerRef}
          className="scrollbar h-[68vh] overflow-y-auto pr-4"
        >
          <Messages messages={messages} currentUserId={user.id} />
        </div>
      </CardContent>
      <CardFooter className="min-w-4xl flex w-full justify-center">
        <ChatInput onSend={sendMessage} />
      </CardFooter>
    </Card>
  );
}
