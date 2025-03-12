// hooks/useSocket.ts
"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL = "https://socket-new.lenna.ai/webchat"; // Change to your server URL

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, {
      extraHeaders: {
        appId: 'PdyJge'
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket;
}
