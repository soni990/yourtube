"use client";

import { useEffect, useRef, useState } from "react";
import socket from "@/lib/socket";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface LiveChatProps {
  partyId: string;
  username: string;
}

interface Message {
  sender: string;
  text: string;
  time: string;
}

export default function LiveChat({ partyId, username }: LiveChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const receiveMessage = (data: Message) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receive-message", receiveMessage);

    return () => {
      socket.off("receive-message", receiveMessage);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const data: Message = {
      sender: username,
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("send-message", {
      partyId,
      message: data,
    });

    setMessages((prev) => [...prev, data]);

    setMessage("");
  };

  return (
    <div className="border rounded-lg p-4 mt-6">
      <h2 className="font-bold text-lg mb-3">💬 Live Chat</h2>

      <div className="h-72 overflow-y-auto border rounded p-3 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="flex justify-between items-end bg-secondary  rounded-lg p-3"
          >
            <div>
              <p className="font-semibold text-blue-600">
                {msg.sender} :{" "}
                <span className="font-normal text-muted-foreground">{msg.text}</span>
              </p>{" "}
            </div>

            <span className="text-xs text-muted-foreground ml-4 whitespace-nowrap">
              {msg.time}
            </span>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 mt-3">
        <Input
          value={message}
          placeholder="Type a message..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />

        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}
