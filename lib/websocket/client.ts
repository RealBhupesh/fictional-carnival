"use client";

import { io, type Socket } from "socket.io-client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: string;
}

interface WebSocketState {
  socket: Socket | null;
  connected: boolean;
  notifications: NotificationPayload[];
  connect: (token: string) => void;
  disconnect: () => void;
  addNotification: (notification: NotificationPayload) => void;
  seedNotifications: (notifications: NotificationPayload[]) => void;
}

const SOCKET_PATH = "/api/websocket";

export const useWebSocketStore = create<WebSocketState>()(
  persist(
    (set, get) => ({
      socket: null,
      connected: false,
      notifications: [],
      connect: (token: string) => {
        if (get().socket?.connected) return;
        const socket = io(process.env.NEXT_PUBLIC_APP_URL || window.location.origin, {
          path: SOCKET_PATH,
          autoConnect: false,
          transports: ["websocket"],
          auth: {
            token
          }
        });

        socket.on("connect", () => {
          set({ connected: true });
        });

        socket.on("disconnect", () => {
          set({ connected: false, socket: null });
        });

        socket.on("notification:new", (notification: NotificationPayload) => {
          set({ notifications: [notification, ...get().notifications].slice(0, 50) });
        });

        socket.on("content:update", (payload) => {
          document.dispatchEvent(new CustomEvent("content:update", { detail: payload }));
        });

        socket.connect();
        set({ socket });
      },
      disconnect: () => {
        const current = get().socket;
        current?.disconnect();
        set({ socket: null, connected: false });
      },
      addNotification: (notification) => {
        set({ notifications: [notification, ...get().notifications].slice(0, 50) });
      },
      seedNotifications: (notifications) => {
        set({ notifications });
      }
    }),
    {
      name: "websocket-store"
    }
  )
);
