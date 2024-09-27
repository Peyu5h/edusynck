import React from "react";

const ChatScreenLoader: React.FC = () => {
  return (
    <div className="mx-auto flex h-[83vh] w-full max-w-6xl flex-col justify-between overflow-hidden border-none bg-transparent">
      <div className="flex-1 space-y-4 p-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-bground2"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/4 animate-pulse rounded bg-bground2"></div>
              <div className="h-4 w-3/4 animate-pulse rounded bg-bground2"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4">
        <div className="h-12 w-full animate-pulse rounded-full bg-bground2"></div>
      </div>
    </div>
  );
};

export default ChatScreenLoader;
