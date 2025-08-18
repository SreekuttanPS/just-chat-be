import { Server, Socket } from "socket.io";

import { messageStore } from "./utils/messageStore.js";
import { userStore } from "./utils/usersStore.js";
import { ClientMessage, OutgoingMessage } from "./types";

export function setupSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    io.emit("get all users", userStore.getAll());

    socket.on("register", (data: { name: string; username: string }) => {
      console.log('User registered: ', data?.username);
      userStore.add(socket.id, data?.username, data?.name);
      io.emit("get all users", userStore.getAll());

      // User joined
      const userJoinedMessage: OutgoingMessage = {
        message: `${data?.username} joined the chat`,
        user: {
          name: data?.name,
          username: data?.username,
        },
        replyTo: null,
        messageType: "info",
        timestamp: new Date().toISOString(),
        messageId: crypto.randomUUID(),
      };

      // socket.broadcast.emit("user joined", userJoinedMessage);
      io.emit("user joined", userJoinedMessage);
    });

    // Send existing messages
    socket.emit("chat history", messageStore.getAll());

    // Handle chat messages
    socket.on("chat message", (data: ClientMessage) => {
      const messageWithTimestamp: OutgoingMessage = {
        ...data,
        messageType: "text",
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
        // User left
        const userLeftMessage: OutgoingMessage = {
          message: `${user.username} left the chat`,
          user: {
            name: user?.name,
            username: user?.username,
          },
          replyTo: null,
          messageType: "info",
          timestamp: new Date().toISOString(),
          messageId: crypto.randomUUID(),
        };
        console.log("user left: ", user?.username);
        io.emit("user left", userLeftMessage);
        // socket.broadcast.emit("user left", userLeftMessage);
        userStore.remove(socket.id);
        io.emit("get all users", userStore.getAll());

        console.log(`❌ ${user.username} disconnected: ${socket.id}`);
      }
    });
  });
}
