import React from "react";
import moment from "moment";

interface Message {
  id: string;
  sender?: { id: string; name: string };
  content: string;
  timestamp: Date;
  files?: any[];
}

interface MessagesProps {
  messages: Message[];
  currentUserId: string;
}

const Messages: React.FC<MessagesProps> = ({ messages, currentUserId }) => {
  return (
    <div className="flex flex-col space-y-4">
      {messages.map((message) => {
        const isCurrentUser = message.sender?.id === currentUserId;

        return (
          <div
            key={message.id}
            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                isCurrentUser
                  ? "bg-blue text-white"
                  : "bg-secondary text-foreground"
              }`}
            >
              {!isCurrentUser && message.sender && (
                <p className="mb-1 text-xs font-bold">{message.sender.name}</p>
              )}
              <p>{message.content}</p>
              <p className="mt-1 text-right text-xs opacity-50">
                {moment(message.timestamp).format("h:mm A")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
