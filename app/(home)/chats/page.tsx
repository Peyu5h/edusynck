"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "~/components/ui/button";
import InputField from "~/components/InputBox";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { useUser } from "~/hooks/useUser";
import { IoIosSend } from "react-icons/io";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

export default function ChatsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  useEffect(() => {
    if (!user || !user.classId) return;

    const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);
    console.log(
      "Attempting to connect to:",
      process.env.NEXT_PUBLIC_BACKEND_URL,
    );
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
      newSocket.emit("join_room", { room: user.classId });
    });

    newSocket.on("receive_message", (data) => {
      console.log("Received message:", data);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          sender: data.sender,
          content: data.message,
          timestamp: new Date(),
        },
      ]);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const username = user?.name || "You";

  const sendMessage = () => {
    if (inputMessage.trim() && socket && user?.classId) {
      const messageData = {
        room: user.classId,
        message: inputMessage,
        sender: username,
      };
      console.log("Sending message:", messageData);
      socket.emit("send_message", messageData);
      setInputMessage("");
    }
  };

  if (!user || !user.classId) {
    return <div>Loading or user not found...</div>;
  }

  return (
    <Card className="mx-auto w-full max-w-5xl border-none bg-transparent">
      <CardHeader>
        {/* <h2 className="text-xl font-thin">ClassID: {user.classId}</h2> */}
      </CardHeader>
      <CardContent>
        <div
          ref={messagesContainerRef}
          className="scrollbar h-[62vh] overflow-y-auto pr-4"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.sender === username ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-start ${message.sender === username ? "flex-row-reverse" : "flex-row"}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${message.sender}`}
                  />
                </Avatar>
                <div
                  className={`mx-2 ${message.sender === username ? "text-right" : "text-left"}`}
                >
                  <p className="text-xs font-thin">{message.sender}</p>
                  <div
                    className={`mt-1 rounded-lg p-2 ${message.sender === username ? "bg-orange text-white" : "bg-secondary"}`}
                  >
                    {message.content}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center space-x-2">
          <InputField
            id="message"
            label=""
            className="w-full"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            sendMessage={sendMessage}
            onBlur={() => {}}
          />
          <Button
            className="h-12 rounded-full bg-secondary text-white hover:bg-orange"
            onClick={sendMessage}
          >
            <IoIosSend />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
