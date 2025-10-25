"use client";

import { useEffect } from "react";
import { useWebSocketStore } from "@/lib/websocket/client";
import { Bell, WifiOff, Wifi } from "lucide-react";
import { cn } from "@/lib/utils/tw";

interface NotificationsFeedProps {
  initialNotifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: Date;
  }>;
}

const NotificationsFeed = ({ initialNotifications }: NotificationsFeedProps) => {
  const seedNotifications = useWebSocketStore((state) => state.seedNotifications);
  const notifications = useWebSocketStore((state) => state.notifications);
  const connected = useWebSocketStore((state) => state.connected);

  useEffect(() => {
    seedNotifications(initialNotifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type
    })));
  }, [initialNotifications, seedNotifications]);

  return (
    <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text">
          <Bell className="h-5 w-5 text-primary" />
          Live notifications
        </h2>
        <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs", connected ? "bg-secondary/10 text-secondary" : "bg-red-500/10 text-red-500") }>
          {connected ? (
            <>
              <Wifi className="h-3.5 w-3.5" /> Connected
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5" /> Offline
            </>
          )}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {notifications.map((notification) => (
          <article key={notification.id} className="rounded-2xl border border-border/80 bg-background p-4">
            <p className="text-sm font-semibold text-text">{notification.title}</p>
            <p className="mt-1 text-sm text-text/70">{notification.message}</p>
            <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs uppercase tracking-wide text-primary">
              {notification.type}
            </span>
          </article>
        ))}
        {notifications.length === 0 ? (
          <p className="text-sm text-text/60">No notifications yet. Updates will appear here in real-time.</p>
        ) : null}
      </div>
    </section>
  );
};

export default NotificationsFeed;
