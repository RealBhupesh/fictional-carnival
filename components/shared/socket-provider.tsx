"use client";

import { useEffect, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useWebSocketStore } from "@/lib/websocket/client";

interface SocketProviderProps {
  children: ReactNode;
}

const SocketProvider = ({ children }: SocketProviderProps) => {
  const { data: session, status } = useSession();
  const connect = useWebSocketStore((state) => state.connect);
  const disconnect = useWebSocketStore((state) => state.disconnect);

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      connect(session.accessToken);
    } else if (status === "unauthenticated") {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [status, session?.accessToken, connect, disconnect]);

  return <>{children}</>;
};

export default SocketProvider;
