import { Router } from "express";
import Post from "../models/post.js";
import { postValidation } from "../validation.js";

const postRouter = Router();
const limit = 5;

postRouter.get("/", async (req, res) => {
  const { page } = req.query;
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
postRouter.get("/user", async (req, res) => {
  const { userId, page } = req.query;
  console.log(userId);
  try {
    const findPosts = await Post.find({ author: userId })
      .populate({
        path: "community",
        select: "name icon ",
      })
      .limit(limit)
      .skip(limit * page)
      .lean();
    return res.status(200).send(findPosts);
  } catch (error) {
    return res.status(500).send(error);
  }
});
postRouter.get("/search", async (req, res) => {
  const { search, page } = req.query;
  try {
    const findPosts = await Post.find({
      title: { $regex: search, $options: "i" },
      content: { $regex: search, $options: "i" },
    })
      .populate({
        path: "community",
        select: "name icon ",
      })
      .limit(limit)
      .skip(limit * page)
      .lean();
    return res.status(200).send(findPosts);
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

postRouter.patch("/like/:_id", async (req, res) => {
  const { _id } = req.params;
  const user = req.user;
  try {
    const findPost = await Post.findById(_id);
    if (!findPost) return res.status(404).send({ error: "post not found" });
    const index = findPost.likes.indexOf(user._id);
    if (index !== -1) {
      findPost.likes.splice(index, 1);
      const result = await findPost.save();
      return res.status(204).send();
    }
    findPost.likes.push(user._id);
    const result = await findPost.save();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default postRouter;
