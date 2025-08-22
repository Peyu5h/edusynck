"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "~/hooks/useUser";
import axios from "axios";
import ChatInput from "~/components/ChatPage/Attachement/ChatInput";
import Messages from "~/components/ChatPage/Messages";
import ChatScreenLoader from "~/components/Loaders/ChatScreenLoader";
import { subscribeToClassChat } from "~/lib/pusher-client";
import { Message } from "~/lib/types";
import { useSelector } from "react-redux";

export default function TeacherChatsPage() {
  const { user, isLoading: userLoading } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const taughtClasses = useSelector(
    (state: any) => state.user.user?.taughtClasses || [],
  );

  // Use the first class as default
  const selectedClass = taughtClasses.length > 0 ? taughtClasses[0].id : "";

  // Fetch initial messages when component mounts or selected class changes
  useEffect(() => {
    async function fetchMessages() {
      if (!selectedClass) return;

      try {
        setIsLoading(true);
        const response = await axios.get<Message[]>(
          `/api/chat/messages/${selectedClass}`,
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMessages();
  }, [selectedClass]);

  // Subscribe to Pusher channel for real-time updates
  useEffect(() => {
    if (!selectedClass) return;

    // Subscribe to class chat events
    const unsubscribe = subscribeToClassChat(
      selectedClass,
      (newMessage: Message) => {
        console.log("Received new message:", newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      },
    );

    // Cleanup subscription when component unmounts or selected class changes
    return () => {
      unsubscribe();
    };
  }, [selectedClass]);

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
      selectedClass &&
      user?.id &&
      user?.name
    ) {
      const messageData: any = {
        room: selectedClass,
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
        // Send message using our API endpoint
        console.log("Sending message data:", messageData);
        await axios.post("/api/chat/send", messageData);
        console.log("Message sent successfully");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  if (userLoading || isLoading) {
    return <ChatScreenLoader />;
  }

  if (!selectedClass) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No classes assigned</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div
        ref={messagesContainerRef}
        className="scrollbar flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 pb-20"
      >
        <Messages messages={messages} currentUserId={user.id} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-2 pb-4 pt-2">
        <ChatInput onSend={sendMessage} />
      </div>
    </div>
  );
}
