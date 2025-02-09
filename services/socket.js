import Room from "../models/room.js";
import Message from "../models/message.js";
import passport from "passport";
import passportServices from "./passport.js";
import User from "../models/user.js";
import { notificationCache } from "./cache.js";

export default function socket(io) {
  const requireAuth = passport.authenticate("jwt", { session: false });
  passportServices(passport);
  io.engine.use((req, res, next) => {
    const isHandShake = req._query.sid === undefined; //ensures that the middleware is only applied to the first HTTP request of the session
    if (isHandShake) {
      requireAuth(req, res, next);
    } else {
      next();
    }
  });

  io.on("connection", async (socket) => {
    const username = socket.request.user.username;
    const currentUserId = socket.request.user._id.toString();
    socket.join(currentUserId);
    console.log(`${username} is online`);
    const cacheData = await notificationCache("get", currentUserId);

    if (cacheData.length !== 0) {
      socket.emit("notification", cacheData);
    }

    socket.broadcast.emit("online", `${username} is online`);
    socket.on("join-room", async (roomId) => {
      try {
        const findRoom = await Room.findById(roomId).lean();
        if (!findRoom) {
          socket.emit("join-room", "fail to join, room doesn't exit");
        } else {
          socket.join(roomId);
          console.log("join ", roomId);
          for (const room of socket.rooms) {
            if (room !== roomId) socket.leave(room);
          }
          socket.emit(
            "join-room",
            `${socket.request.user.username} join ${findRoom.name}`
          );
        }
      } catch (error) {
        socket.emit("join-room", { message: "error", error: error });
      }
    });
    socket.on("leave-room", () => {
      console.log("leave");
      socket.join(socket.request.user._id.toString());
    });
    socket.on("sendMessage", async (roomId, message, callback) => {
      try {
        const sender = socket.request.user._id;
        console.log("send");
        const newMessageWithoutSender = await new Message({
          room: roomId,
          message: message,
          sender: sender,
          createTime: Date.now(),
        }).save();
        const newMessage = await newMessageWithoutSender.populate({
          path: "sender",
          select: "username thumbnail",
        });
        const updatedRoom = await Room.findByIdAndUpdate(roomId, {
          lastMessage: newMessage._id,
          updateDate: Date.now(),
        });
        if (!updatedRoom) {
          callback({ status: 400, message: "room doesn't exist" });
        } else {
          const usersId = updatedRoom.users;
          const notification =
            updatedRoom.name === undefined
              ? `${username} just sent a message`
              : `${username} just sent a message to ${updatedRoom.name}`;
          usersId.forEach((userId) => {
            if (userId !== socket.request.user._id) {
              const data = {
                notification,
                roomId: updatedRoom._id,
              };
              notificationCache("put", userId, data);

              socket.to(userId.toString()).emit("notification", data);
            }
          });
          socket.to(roomId).emit("recieveMessage", newMessage);
          callback({ status: 200, newMessage });
        }
      } catch (error) {
        callback({ status: 500, error: error });
      }
    });

    socket.on("disconnect", async () => {
      const userId = socket.request.user._id;
      User.findByIdAndUpdate(userId, { isOnline: false });

      console.log(`${socket.request.user.username} disconnected`);
    });
  });
}
