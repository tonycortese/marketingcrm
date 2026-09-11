import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface SocketState {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketState>({ socket: null, connected: false });

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const url = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
    const s = io(url, { transports: ["websocket", "polling"] });
    socketRef.current = s;

    s.on("connect", () => {
      console.log("[WS] connesso");
      setConnected(true);
    });
    s.on("disconnect", () => {
      console.log("[WS] disconnesso");
      setConnected(false);
    });
    s.on("connect_error", (err) => {
      console.error("[WS] errore:", err.message);
      setConnected(false);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useRealtimeRefresh(event: string, onEvent: () => void) {
  const { socket } = useSocket();
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    if (!socket) return;
    const handler = () => callbackRef.current();
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [socket, event]);
}
