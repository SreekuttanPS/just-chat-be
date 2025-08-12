import { Server, Socket } from "socket.io";

import { messageStore } from "./utils/messageStore.js";
import { userStore } from "./utils/usersStore.js";
import { IncomingMessage, OutgoingMessage } from "./types";

export function setupSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    socket.on("register", (username: string) => {
      console.log("register: ", username);
      userStore.add(socket.id, username);

      // Broadcast user joined
      socket.broadcast.emit("user joined", {
        username,
        message: `${username} joined the chat`,
        timestamp: new Date().toISOString(),
      });
    });

    // Send existing messages
    socket.emit("chat history", messageStore.getAll());

    // Handle chat messages
    socket.on("chat message", (data: IncomingMessage) => {
      console.log("message received: ", data);
      const messageWithTimestamp: OutgoingMessage = {
        ...data,
        timestamp: new Date().toISOString(),
      };

      messageStore.add(messageWithTimestamp);
      io.emit("chat message", messageWithTimestamp);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      const user = userStore.getBySocket(socket.id);
      if (user) {
        userStore.remove(socket.id);

        // Broadcast user left
        socket.broadcast.emit("user left", {
          username: user.username,
          message: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
        });

        console.log(`❌ ${user.username} disconnected: ${socket.id}`);
      }
    });
  });
}

/* 
// socket.ts
import { Server, Socket } from "socket.io";

interface UserSocketMap {
  [userId: string]: string; // userId -> socketId
}

const userSocketMap: UserSocketMap = {};

export function setupSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("✅ User connected:", socket.id);

    // When a user logs in (send userId from client)
    socket.on("register_user", (userId: string) => {
      userSocketMap[userId] = socket.id;
      console.log(`📌 Registered ${userId} -> ${socket.id}`);
    });

    // Start private chat
    socket.on("start_private_chat", ({ fromUserId, toUserId }) => {
      const targetSocketId = userSocketMap[toUserId];
      if (!targetSocketId) return;

      // Create consistent room ID
      const roomId = [fromUserId, toUserId].sort().join("_");
      socket.join(roomId);
      io.to(targetSocketId).socketsJoin(roomId);

      console.log(`💬 Private room created: ${roomId}`);
      io.to(roomId).emit("private_chat_started", { roomId });
    });

    // Send private message
    socket.on("private_message", ({ roomId, message, senderId }) => {
      io.to(roomId).emit("private_message", {
        senderId,
        message,
        timestamp: Date.now(),
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      for (const [userId, sockId] of Object.entries(userSocketMap)) {
        if (sockId === socket.id) delete userSocketMap[userId];
      }
      console.log("❌ User disconnected:", socket.id);
    });
  });
}

*/
