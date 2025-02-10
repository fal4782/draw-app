"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "../hooks/useSocket";
export function ChatRoomClient({
  messages,
  id,
}: {
  messages: { message: string }[];
  id: string;
}) {
  const { socket, loading } = useSocket();
  const [chats, setChats] = useState(messages);
  const chatInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (socket && !loading) {
      socket.send(
        JSON.stringify({
          type: "join_room",
          roomId: Number(id),
        })
      );

      function handleMessages(event: MessageEvent) {
        try {
          const parsedData = JSON.parse(event.data);
          if (parsedData.type === "chat") {
            setChats((p) => [...p, { message: parsedData.message }]);
          }
        } catch (error) {
          console.log("error:", error);
        }
      }
      socket.addEventListener("message", handleMessages);
      return () => {
        socket.removeEventListener("message", handleMessages);
      };
    }
  }, [socket, loading, chats]);

  return (
    <>
      <h1>Chat Room</h1>
      {chats.map((chat) => (
        <p>{chat.message}</p>
      ))}

      <input type="text" ref={chatInputRef} placeholder="Enter message" />
      <button
        onClick={() => {
          socket?.send(
            JSON.stringify({
              type: "chat",
              message: chatInputRef.current?.value,
              roomId: id,
            })
          );
        }}
      >
        Send Message
      </button>
    </>
  );
}
