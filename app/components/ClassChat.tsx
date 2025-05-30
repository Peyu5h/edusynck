// import React, { useState, useEffect, useRef } from "react";
// import { subscribeToClassChat, getChannelName } from "../utils/pusher-client";
// import { useSession } from "next-auth/react";

// interface Message {
//   id: string;
//   content: string;
//   createdAt: string;
//   sender: {
//     id: string;
//     name: string;
//     image?: string;
//   };
//   files?: any[];
// }

// interface ClassChatProps {
//   classId: string;
// }

// export default function ClassChat({ classId }: ClassChatProps) {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const { data: session } = useSession();

//   // Fetch existing messages when component mounts
//   useEffect(() => {
//     async function fetchMessages() {
//       try {
//         setIsLoading(true);
//         const response = await fetch(`/api/chat/messages/${classId}`);

//         if (!response.ok) {
//           throw new Error("Failed to fetch messages");
//         }

//         const data = await response.json();
//         setMessages(data);
//       } catch (error) {
//         console.error("Error fetching messages:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     fetchMessages();
//   }, [classId]);

//   // Subscribe to Pusher channel for real-time updates
//   useEffect(() => {
//     if (!classId) return;

//     // Subscribe to class chat channel
//     const unsubscribe = subscribeToClassChat(classId, (newMessage: Message) => {
//       setMessages((prev) => [...prev, newMessage]);
//     });

//     // Cleanup subscription when component unmounts
//     return () => {
//       unsubscribe();
//     };
//   }, [classId]);

//   // Scroll to bottom when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!newMessage.trim() || !session?.user) return;

//     try {
//       const response = await fetch("/api/chat/send", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           room: classId,
//           content: newMessage,
//           sender: {
//             id: session.user.id,
//             name: session.user.name,
//             image: session.user.image,
//           },
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to send message");
//       }

//       // Clear input field after sending
//       setNewMessage("");
//     } catch (error) {
//       console.error("Error sending message:", error);
//     }
//   };

//   if (isLoading) {
//     return <div className="flex justify-center p-4">Loading messages...</div>;
//   }

//   return (
//     <div className="flex h-[600px] flex-col rounded-lg border">
//       <div className="border-b bg-gray-50 p-4">
//         <h2 className="text-lg font-semibold">Class Chat</h2>
//       </div>

//       {/* Messages container */}
//       <div className="flex-1 overflow-y-auto p-4">
//         {messages.length === 0 ? (
//           <div className="flex h-full items-center justify-center text-gray-500">
//             No messages yet. Be the first to send a message!
//           </div>
//         ) : (
//           messages.map((message) => (
//             <div
//               key={message.id}
//               className={`mb-4 flex ${message.sender.id === session?.user?.id ? "justify-end" : "justify-start"}`}
//             >
//               <div
//                 className={`max-w-[70%] rounded-lg p-3 ${
//                   message.sender.id === session?.user?.id
//                     ? "bg-blue-500 text-white"
//                     : "bg-gray-200 text-gray-800"
//                 }`}
//               >
//                 {message.sender.id !== session?.user?.id && (
//                   <div className="mb-1 text-sm font-semibold">
//                     {message.sender.name}
//                   </div>
//                 )}
//                 <div>{message.content}</div>
//                 <div className="mt-1 text-xs opacity-75">
//                   {new Date(message.createdAt).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Message input */}
//       <form onSubmit={handleSendMessage} className="border-t bg-white p-4">
//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             placeholder="Type a message..."
//             className="focus:ring-blue-500 flex-1 rounded-lg border px-4 py-2 focus:outline-none focus:ring-2"
//           />
//           <button
//             type="submit"
//             disabled={!newMessage.trim()}
//             className="bg-blue-500 rounded-lg px-4 py-2 text-white disabled:opacity-50"
//           >
//             Send
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }
