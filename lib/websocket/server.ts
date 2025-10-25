import type { NextApiResponse } from "next";
import { Server as IOServer, type Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db/prisma";
import { Role } from "@prisma/client";

const ADMIN_ROOM = "admin-room";
const CLIENT_ROOM = "client-room";

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: NextApiResponse["socket"] & {
    server: NextApiResponse["socket"]["server"] & {
      io?: IOServer;
    };
  };
}

interface TokenPayload {
  id: string;
  role: Role;
  email?: string;
  name?: string;
}

declare module "socket.io" {
  interface Socket {
    data: {
      user?: TokenPayload;
    };
  }
}

const registerEventHandlers = (socket: Socket) => {
  const user = socket.data.user;
  if (!user) return;

  if ([Role.ADMIN, Role.MANAGER].includes(user.role)) {
    socket.join(ADMIN_ROOM);
  }
  socket.join(CLIENT_ROOM);

  socket.broadcast.emit("user:joined", {
    userId: user.id,
    name: user.name,
    role: user.role
  });

  socket.on("content:update", async (payload) => {
    socket.to(CLIENT_ROOM).emit("content:update", payload);
    if (user.role !== Role.USER) {
      socket.to(ADMIN_ROOM).emit("admin:action", {
        actor: user,
        action: "content:update",
        payload
      });
    }
  });

  socket.on("notification:new", async (payload) => {
    socket.to(CLIENT_ROOM).emit("notification:new", payload);
  });

  socket.on("analytics:update", (payload) => {
    socket.to(ADMIN_ROOM).emit("analytics:update", payload);
  });

  socket.on("admin:action", (payload) => {
    socket.to(ADMIN_ROOM).emit("admin:action", payload);
  });

  socket.on("disconnect", () => {
    if (user.role !== Role.USER) {
      socket.to(ADMIN_ROOM).emit("admin:action", {
        actor: user,
        action: "admin:disconnect"
      });
    }
  });
};

const authenticateSocket = async (socket: Socket) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      throw new Error("Unauthorized");
    }
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error("Server misconfiguration: NEXTAUTH_SECRET is not set");
    }
    const decoded = jwt.verify(token, secret) as TokenPayload;
    socket.data.user = decoded;
    await prisma.activityLog.create({
      data: {
        userId: decoded.id,
        action: "socket:connected",
        details: `Socket connected with role ${decoded.role}`
      }
    });
    return true;
  } catch (error) {
    console.error("Socket authentication failed", error);
    return false;
  }
};

export const getIO = (res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/websocket",
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "*"
      }
    });

    io.use(async (socket, next) => {
      const isAuthenticated = await authenticateSocket(socket);
      if (!isAuthenticated) {
        next(new Error("Unauthorized"));
        return;
      }
      next();
    });

    io.on("connection", registerEventHandlers);

    res.socket.server.io = io;
  }
  return res.socket.server.io;
};
