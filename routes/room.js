import { Router } from "express";
import Room from "../models/room.js";
import { roomValidation } from "../validation.js";
import { cleanHashMiddleware } from "../middelware/cleanCache.js";

const roomRouter = Router();
const TYPE = "room";
roomRouter.get("/", async (req, res) => {
  const { userId, page } = req.query;

  const limit = 9;
  try {
    const findRooms = await Room.find({ users: { $in: [userId] } })
      .populate([
        { path: "users", select: "username thumbnail isOnline" },
        { path: "lastMessage", select: "message readed" },
      ])
      .limit(limit)
      .skip(limit * page)
      .lean();
    if (page !== "0" && findRooms.length === 0) {
      return res.status(404).send({ error: "no more" });
    }
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
roomRouter.use(cleanHashMiddleware(TYPE));
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

roomRouter.delete("/:roomId", async (req, res) => {
  const { userId } = req.query;
  const { roomId } = req.params;
  try {
    const findRoom = await Room.findById(roomId);
    if (findRoom.users.length > 1) {
      const index = findRoom.users.indexOf(userId);
      if (index === -1) {
        return res.status(404).send({ error: "user not found in this room" });
      }
      findRoom.users.splice(index, 1);
      await findRoom.save();
    } else {
      await Room.findOneAndDelete({ _id: roomId });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

export default roomRouter;
