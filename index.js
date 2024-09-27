import "dotenv/config.js";
import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import cors from "cors";
import userRouter from "./routes/user.js";
import morgan from "morgan";
import passport from "passport";
import passportServices from "./services/passport.js";
import roomRouter from "./routes/room.js";
import { Server } from "socket.io";
import messageRouter from "./routes/chat.js";
import socket from "./services/socket.js";
const requireAuth = passport.authenticate("jwt", { session: false });

passportServices(passport);
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:5173" } });
app.use(morgan("combined"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRouter);
app.use(requireAuth);
app.use("/room", roomRouter);
app.use("/chat", messageRouter);

socket(io);
mongoose
  .connect(process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/chatDB")
  .then(() => {
    console.log("connect to chatDB");
  });

server.listen(8080, () => {
  console.log("server is listening on port 8080");
});
