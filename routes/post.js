import { Router } from "express";
import Post from "../models/post.js";
import { postValidation } from "../validation.js";
import Comment from "../models/comment.js";

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
    if (result.length === 0) {
      return res.status(404).send({ error: "no data" });
    }
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});
postRouter.get("/community", async (req, res) => {
  const { communityId, page } = req.query;
  try {
    const findPosts = await Post.find({ community: communityId })
      .populate({
        path: "community",
        select: "name icon ",
      })
      .limit(limit)
      .skip(limit * page)
      .lean();
    return res.status(200).send(findPosts);
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});
postRouter.get("/user", async (req, res) => {
  const { userId, page } = req.query;

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
    return res.status(500).send({ error: error });
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
    return res.status(500).send({ error: error });
  }
});

postRouter.get("/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    const findPost = await Post.findById(_id)
      .populate([
        {
          path: "community",
          select: "name icon description rules",
        },
        { path: "author", select: "username thumbnail" },
      ])
      .lean();
    if (!findPost) {
      return res.status(404).send({ error: "post not found" });
    }
    return res.status(200).send(findPost);
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

postRouter.post("/", async (req, res) => {
  const { error } = postValidation(req.body);

  if (error) return res.status(400).send(error.details[0].message);
  const { title, content, communityId, image } = req.body;
  try {
    const result = await new Post({
      title,
      content,
      image,
      community: communityId,
      author: req.user._id,
    }).save();
    return res.status(201).send(result);
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

postRouter.patch("/:_id", async (req, res) => {
  const { error } = postValidation(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const { _id } = req.params;
  const { title, content, image } = req.body;
  try {
    const findPost = await Post.findById(_id);
    if (!findPost) return res.status(404).send({ error: "post not found" });
    findPost.title = title;
    findPost.content = content;
    findPost.image = image;
    await findPost.save();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

postRouter.delete("/:_id", async (req, res) => {
  const { _id } = req.params;

  try {
    const result = await Post.findByIdAndDelete(_id);
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send({ error: error });
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
    return res.status(500).send({ error: error });
  }
});
postRouter.delete("/", async (req, res) => {
  const { post } = req.body;
  try {
    const result = await Post.findOneAndDelete({ _id: post._id });

    return res.status(200).send();
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

export default postRouter;
