import { Router } from "express";
import Post from "../models/post.js";
import { postValidation } from "../validation.js";

const postRouter = Router();

postRouter.get("/", async (req, res) => {
  const { page } = req.query;
  const limit = 5;
  try {
    const result = await Post.find()
      .populate({ path: "community", select: "name icon" })
      .limit(limit)
      .skip(page * limit)
      .lean();
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(error);
  }
});

postRouter.get("/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    const findPost = await Post.findById(_id)
      .populate([
        {
          path: "community",
          select: "name icon description",
        },
        { path: "author", select: "username thumbnail" },
      ])
      .lean();
    if (!findPost) {
      return res.status(404).send({ error: "post not found" });
    }
    return res.status(200).send(findPost);
  } catch (error) {
    return res.status(500).send(error);
  }
});

postRouter.post("/", async (req, res) => {
  const { error } = postValidation(req.body);

  if (error) return res.status(400).send(error.details[0].message);
  const { title, content, communityId } = req.body;
  try {
    const result = await new Post({
      title,
      content,
      community: communityId,
      author: req.user._id,
    }).save();
    return res.status(201).send(result);
  } catch (error) {
    return res.status(500).send(error);
  }
});

postRouter.patch("/:_id", (req, res) => {});

postRouter.delete("/:_id", async (req, res) => {
  const { _id } = req.params;

  try {
    const result = await Post.findByIdAndDelete(_id);
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default postRouter;
