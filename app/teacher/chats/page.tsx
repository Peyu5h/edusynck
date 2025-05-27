"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useUser } from "~/hooks/useUser";
import axios from "axios";
import { AxiosResponse } from "axios";
import { Button } from "~/components/ui/button";
import { Video, VideoOff, MicOff, Mic, Phone, Users, Plus } from "lucide-react";
import ChatInput from "~/components/ChatPage/Attachement/ChatInput";
import Messages from "~/components/ChatPage/Messages";
import SubjectCardLoader from "~/components/Loaders/SubjectCardLoader";
import ChatScreenLoader from "~/components/Loaders/ChatScreenLoader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useSelector } from "react-redux";

interface Message {
  id: string;
  sender: { id: string; name: string };
  content: string;
  files?: any[];
  createdAt: string;
}

interface Class {
  id: string;
  name: string;
}

export default function TeacherChatsPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [videoMeetActive, setVideoMeetActive] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  const taughtClasses = useSelector(
    (state: any) => state.user.user?.taughtClasses || [],
  );

  useEffect(() => {
    if (taughtClasses.length > 0 && !selectedClass) {
      setSelectedClass(taughtClasses[0].id);
    }
  }, [taughtClasses, selectedClass]);

  useEffect(() => {
    if (!selectedClass) return;

    setIsLoading(true);
    const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
      if (selectedClass && user?.id) {
        newSocket.emit("join_room", { room: selectedClass, userId: user.id });

        axios
          .get<Message[]>(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/messages/${selectedClass}`,
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
  }, [user?.id, selectedClass]);

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
      selectedClass &&
      user?.id &&
      user?.name
    ) {
      const messageData: any = {
        room: selectedClass,
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

  const startVideoMeet = () => {
    setVideoMeetActive(true);
    // Here you would initiate the video call with a service like WebRTC or a third-party API
    console.log(`Starting video meet for class: ${selectedClass}`);
  };

  const endVideoMeet = () => {
    setVideoMeetActive(false);
    // Here you would end the video call
    console.log("Ending video meet");
  };

  if (!user) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <SubjectCardLoader key={index} />
        ))}
      </div>
    );
  }

  if (isLoading && selectedClass) {
    return <ChatScreenLoader />;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {taughtClasses.map((cls: Class) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!videoMeetActive ? (
            <Button variant="default" className="" onClick={startVideoMeet}>
              Start Video Meet
            </Button>
          ) : (
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMicMuted(!micMuted)}
              >
                {micMuted ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setVideoOff(!videoOff)}
              >
                {videoOff ? (
                  <VideoOff className="h-4 w-4" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
              </Button>
              <Button variant="destructive" size="icon" onClick={endVideoMeet}>
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Users className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {videoMeetActive && (
        <Card className="mb-6 overflow-hidden">
          <CardHeader className="bg-primary px-4 py-2">
            <CardTitle className="text-sm text-white">
              Video Meet:{" "}
              {
                taughtClasses.find((cls: Class) => cls.id === selectedClass)
                  ?.name
              }
            </CardTitle>
          </CardHeader>
          <div className="aspect-video bg-black">
            {/* Video stream would be embedded here */}
            <div className="flex h-full items-center justify-center text-white">
              {videoOff ? (
                <p>Camera is off</p>
              ) : (
                <p>Video stream would appear here</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {selectedClass ? (
        <Card className="mx-auto flex h-[65vh] w-full flex-col justify-between overflow-hidden shadow-md">
          <CardContent>
            <div
              ref={messagesContainerRef}
              className="scrollbar h-[50vh] overflow-y-auto pr-4"
            >
              <Messages messages={messages} currentUserId={user.id} />
            </div>
          </CardContent>
          <CardFooter className="min-w-4xl flex w-full justify-center">
            <ChatInput onSend={sendMessage} />
          </CardFooter>
        </Card>
      ) : (
        <Card className="mx-auto mt-8 max-w-lg p-8 text-center">
          <p className="text-muted-foreground">
            Please select a class to view the chat
          </p>
        </Card>
      )}
    </div>
  );
}
