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
    return res.status(500).send({ error: error });
  }
});

communityRouter.get("/:name", async (req, res) => {
  const { name } = req.params;
  try {
    const findCom = await Community.findOne({ name: name })
      .populate({ path: "managers", select: "username thumbnail" })
      .lean();
    if (!findCom) return res.status(404).send({ error: "community not found" });
    return res.status(200).send(findCom);
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});
communityRouter.post("/", async (req, res) => {
  const { error } = communityValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { name, description, rules, icon, banner, managers } = req.body;
  if (!managers) {
    managers = req.user._id;
  } else {
    managers.push(req.user._id);
  }
  try {
    const findCom = await Community.findOne({ name });
    if (findCom)
      return res.status(403).send({ error: "community is already existed" });
    const result = await new Community({
      name,
      description,
      managers,
      rules,
      icon,
      banner,
    }).save();
    return res.status(201).send(result);
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});
communityRouter.patch("/:_id", async (req, res) => {
  const { error } = communityValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { name, description, rules, icon, banner, managers } = req.body;
  if (managers.length === 0)
    return res
      .status(400)
      .send({ error: "must have at least one user to be manager" });

  const { _id } = req.params;
  try {
    const findCom = await Community.findById(_id);
    if (!findCom) {
      return res.status(404).send({ error: "community not found" });
    }
    if (icon) {
      findCom.icon = icon;
    }
    if (banner) {
      findCom.banner = banner;
    }
    findCom.name = name;
    findCom.description = description;
    findCom.rules = rules;
    findCom.managers = managers;
    await findCom.save();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

export default communityRouter;
