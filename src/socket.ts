import { Server, Socket } from "socket.io";

import { messageStore } from "./utils/messageStore.js";
import { userStore } from "./utils/usersStore.js";
import { ClientMessage, OutgoingMessage } from "./types";

export function setupSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`✅ User connected: ${socket.id}`);
    console.log("userStore.getAll(): ", userStore.getAll());
    io.emit("get all users", userStore.getAll());

    socket.on("register", (data: { name: string; username: string }) => {
      console.log("register: ", data?.username);
      userStore.add(socket.id, data?.username, data?.name);
      io.emit("get all users", userStore.getAll());

      // Broadcast user joined
      socket.broadcast.emit("user joined", {
        username: data?.username,
        message: `${data?.username} joined the chat`,
        timestamp: new Date().toISOString(),
      });
    });

    // Send existing messages
    socket.emit("chat history", messageStore.getAll());

    // Handle chat messages
    socket.on("chat message", (data: ClientMessage) => {
      console.log("message received: ", data);
      const messageWithTimestamp: OutgoingMessage = {
        ...data,
        timestamp: new Date().toISOString(),
        messageId: crypto.randomUUID(),
      };

      messageStore.add(messageWithTimestamp);
      io.emit("chat message", messageWithTimestamp);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      const user = userStore.getBySocket(socket.id);
      if (user) {
        userStore.remove(socket.id);
        io.emit("get all users", userStore.getAll());

        // Broadcast user left
        socket.broadcast.emit("user left", {
          username: user.username,
          message: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
          messageId: crypto.randomUUID(),
        });

        console.log(`❌ ${user.username} disconnected: ${socket.id}`);
      }
    });
  });
}
