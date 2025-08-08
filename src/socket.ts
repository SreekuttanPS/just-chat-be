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
