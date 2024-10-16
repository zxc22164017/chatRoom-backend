import { Router } from "express";
import Message from "../models/message.js";

const messageRouter = Router();

messageRouter.get("/:_id", async (req, res) => {
  const limit = 15;
  const roomId = req.params._id;
  const { page } = req.query;

  try {
    const findResults = await Message.find({ room: roomId })
      .limit(limit)
      .skip(page * limit)
      .populate({ path: "sender", select: "username thumbnail" })
      .sort({ _id: -1 })
      .lean();
    if (findResults.length === 0 && page !== "0") {
      return res.status(404).send({ error: "no more data" });
    }
    findResults.reverse();
    const updatedFindResults = findResults.map((findResult) => {
      return { ...findResult, readed: true };
    });
    return res.status(200).send(updatedFindResults);
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

export default messageRouter;
