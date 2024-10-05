import { Router } from "express";
import Room from "../models/room.js";
import { roomValidation } from "../validation.js";

const roomRouter = Router();

roomRouter.get("/", async (req, res) => {
  const userId = req.query.userId;
  try {
    const findRooms = await Room.find({ users: { $in: [userId] } })
      .populate([
        { path: "users", select: "username thumbnail isOnline" },
        { path: "lastMessage", select: "message readed" },
      ])
      .lean();
    return res.send(findRooms);
  } catch (error) {
    return res.status(500).send(error);
  }
});
roomRouter.get("/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    const findRoom = await Room.findById(_id)
      .populate({ path: "users", select: "username thumbnail isOnline" })
      .lean();
    return res.status(200).send(findRoom);
  } catch (error) {
    return res.status(500).send(error);
  }
});

roomRouter.post("/", async (req, res) => {
  const { error } = roomValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { name, users } = req.body;
  try {
    const result = await new Room({ name, users }).save();
    return res.status(201).send(result);
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default roomRouter;
