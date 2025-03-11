// hooks/useSocket.ts
"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL = "https://socket-new.lenna.ai/webchat"; // Change to your server URL
let socket: Socket | null = null;

export function useSocket() {
  // const [socket, setSocket] = useState<Socket | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");

  useEffect(() => {
    console.log('socket', socket)
    if (!socket) {
      console.log("Creating new WebSocket instance...");
      socket = io(SOCKET_SERVER_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        extraHeaders: {
          appId: 'PdyJge'
        }
      });
  
      // setSocket(newSocket);
  
      socket.on("NewMessage", (data) => {
        setNewMessage(data);
      });

      socket.on("disconnect", () => {
        console.log("WebSocket disconnected");
        socket = null; // Cleanup
      });
    }

    return () => {
      // newSocket.disconnect();
      if (socket) {
        console.log("Disconnecting WebSocket...");
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  return { socket, newMessage };
}
