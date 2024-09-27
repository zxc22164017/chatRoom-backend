import { Router } from "express";
import Message from "../models/message.js";

const messageRouter = Router();

messageRouter.get("/:_id", async (req, res) => {
  const roomId = req.params._id;
  const findResults = await Message.find({ room: roomId })
    .limit(20)
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
