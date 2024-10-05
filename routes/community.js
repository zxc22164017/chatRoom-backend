import { Router } from "express";
import Community from "../models/community.js";
import { communityValidation } from "../validation.js";

const communityRouter = Router();

communityRouter.get("/", async (req, res) => {
  try {
    const result = await Community.find()
      .select("-banner -description -managers ")
      .lean();
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(error);
  }
});

communityRouter.get("/:_id", async (req, res) => {});
communityRouter.post("/", async (req, res) => {
  const { error } = communityValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { name, description, rules } = req.body;
  const managers = req.user._id;
  try {
    const findCom = await Community.findOne({ name });
    if (findCom)
      return res.status(403).send({ error: "community is already existed" });
    const result = await new Community({
      name,
      description,
      managers,
      rules,
    }).save();
    return res.status(201).send(result);
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default communityRouter;
