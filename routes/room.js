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
    return res.status(500).send({ error: error });
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
    return res.status(500).send({ error: error });
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
    return res.status(500).send({ error: error });
  }
});
roomRouter.patch("/:_id", async (req, res) => {
  const { _id } = req.params;
  const { name, users, image } = req.body;
  if (!(name || users))
    return res.status(400).send({ error: "invalid action" });
  try {
    const findRoom = await Room.findById(_id);
    if (!findRoom) return res.status(404).send({ error: "room not found" });
    if (name) {
      findRoom.name = name;
      findRoom.thumbnail = image;
    } else if (users) {
      findRoom.users = users;
    }
    await findRoom.save();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

export default roomRouter;
