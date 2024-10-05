import { Router } from "express";
import Message from "../models/message.js";

const messageRouter = Router();

messageRouter.get("/:_id", async (req, res) => {
  const limit = 10;
  const roomId = req.params._id;
  const { page } = req.query;

  const findResults = await Message.find({ room: roomId })
    .limit(limit)
    .skip(page * limit)
    .populate({ path: "sender", select: "username thumbnail" })
    .sort({ _id: -1 })
    .lean();
  findResults.reverse();
  const updatedFindResults = findResults.map((findResult) => {
    return { ...findResult, readed: true };
  });
  return res.status(200).send(updatedFindResults);
});

export default messageRouter;
