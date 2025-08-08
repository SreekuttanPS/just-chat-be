import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupSocket } from "./socket.js";
import cors from "cors";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // or "*" temporarily
    methods: ["GET", "POST"],
  },
});

app.use(cors());

setupSocket(io);

app.get("/", (_, res) => {
  res.send("Chat backend running 🎉");
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🔥 Server is live at http://localhost:${PORT}`);
});
