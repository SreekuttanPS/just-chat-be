import { Server, Socket } from "socket.io";

import { messageStore } from "./utils/messageStore.js";
import { userStore } from "./utils/usersStore.js";
import { ClientMessage, OutgoingMessage } from "./types";
import { getDmRoomName } from "./utils/commonFuntions.js";

export function setupSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("connected: ", socket.id);
    io.emit("get_all_users", userStore.getAll());

    socket.on("register", (data: { name: string; username: string }) => {
      console.log("User registered: ", data?.username);
      userStore.add(socket.id, data?.username, data?.name);
      io.emit("get_all_users", userStore.getAll());

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

      socket.broadcast.emit("user_joined", userJoinedMessage);
    });

    // Send existing messages
    socket.emit("chat_history", messageStore.getAll());

    // Handle chat messages
    socket.on("chat_message", (data: ClientMessage) => {
      const messageWithTimestamp: OutgoingMessage = {
        ...data,
        messageType: "text",
        timestamp: new Date().toISOString(),
        messageId: crypto.randomUUID(),
      };

      messageStore.add(messageWithTimestamp);
      io.emit("chat_message", messageWithTimestamp);
    });

    // Handle direct messages
    socket.on("start_dm", ({ sender, reciever }) => {
      const roomName = getDmRoomName(sender, reciever);
      socket.join(roomName);

      // tell the recipient that a DM has started
      const targetUser = userStore.getByUsername(reciever);
      const targetSocket = io.sockets.sockets.get(targetUser?.socketId || "");
      if (targetSocket) {
        targetSocket.join(roomName);
        targetSocket.emit("dm_started", { reciever: sender, roomName });
      }

      // also tell sender, so both are in sync
      socket.emit("dm_started", { reciever, roomName });
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
        socket.broadcast.emit("user_left", userLeftMessage);
        userStore.remove(socket.id);
        io.emit("get_all_users", userStore.getAll());

        console.log(`❌ ${user.username} disconnected: ${socket.id}`);
      }
    });
  });
}
