"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { useUser } from "~/hooks/useUser";
import axios from "axios";
import { AxiosResponse } from "axios";
import ChatInput from "~/components/ChatPage/Attachement/ChatInput";
import Messages from "~/components/ChatPage/Messages";
import SubjectCardLoader from "~/components/Loaders/SubjectCardLoader";
import ChatScreenLoader from "~/components/Loaders/ChatScreenLoader";

interface Message {
  id: string;
  sender: { id: string; name: string };
  content: string;
  files?: any[];
  createdAt: string;
}

export default function ChatsPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
      if (user?.classId) {
        newSocket.emit("join_room", { room: user.classId, userId: user.id });

        axios
          .get<Message[]>(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/messages/${user.classId}`,
          )
          .then((response: AxiosResponse<Message[]>) => {
            setMessages(response.data);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("Failed to fetch old messages:", error);
            setIsLoading(false);
          });
      }
    });

    newSocket.on("receive_message", (message: Message) => {
      console.log("Received message:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?.classId, user?.id]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (message: string, files?: File[]) => {
    if (
      (message.trim() || (files && files.length > 0)) &&
      socket &&
      user?.classId &&
      user?.id &&
      user?.name
    ) {
      const messageData: any = {
        room: user.classId,
        content: message,
        sender: { id: user.id, name: user.name },
        files: [],
        createdAt: new Date().toISOString(),
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

      console.log("Sending message:", JSON.stringify(messageData, null, 2));
      socket.emit("send_message", messageData);
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
