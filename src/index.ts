import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupSocket } from "./socket.js";
import cors from "cors";
import "dotenv/config";

const PORT = process.env.PORT || 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

app.use(cors());

setupSocket(io);

app.get("/", (_, res) => {
  res.send("Chat backend running 🎉");
});

server.listen(PORT, () => {
  console.log(`🔥 Server is live`);
});
