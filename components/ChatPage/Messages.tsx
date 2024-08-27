import React from "react";
import moment from "moment";
import SeenIcon from "./svg/SeenIcon";

interface Message {
  id: string;
  sender?: { id: string; name: string };
  content: string;
  createdAt: string;
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
            className={`relative flex items-start ${isCurrentUser ? "justify-end" : "justify-start"}`}
          >
            {!isCurrentUser && message.sender && (
              <div className="mr-2 flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange">
                  <span className="text-sm font-semibold">
                    {message.sender.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            <div
              className={`max-w-[70%] ${
                isCurrentUser
                  ? "rounded-l-lg rounded-br-lg"
                  : "rounded-r-lg rounded-bl-lg"
              } px-3 pt-3 ${
                isCurrentUser
                  ? "bg-blue text-white"
                  : "bg-secondary text-foreground"
              }`}
            >
              <div
                className={`absolute top-[0px] h-4 w-3 ${
                  isCurrentUser ? "triangle-right right-[-11px] bg-blue" : null
                } `}
              ></div>
              {!isCurrentUser && message.sender && (
                <p className="mb-1 text-xs font-bold">{message.sender.name}</p>
              )}
              <p>{message.content}</p>
              <p className="mb-1 flex items-center justify-end text-right text-[10px] opacity-50">
                <div className="mt-1">
                  {moment(message.createdAt).format("h:mm A")}
                </div>
                <div className="ml-1 flex items-center justify-center">
                  {isCurrentUser && (
                    <SeenIcon className="fill-teal-200 text-[10px]" />
                  )}
                </div>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
