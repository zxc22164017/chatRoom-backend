import { Router } from "express";
import Room from "../models/room.js";

const roomRouter = Router();

roomRouter.get("/", async (req, res) => {
  const userId = req.query.userId;
  try {
    const findRooms = await Room.find({ users: { $in: [userId] } })
      .populate([
        { path: "users", select: "username thumbnail" },
        { path: "lastMessage", select: "message readed" },
      ])
      .exec();
    return res.send(findRooms);
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default roomRouter;
