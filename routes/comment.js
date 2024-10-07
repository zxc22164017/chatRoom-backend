import { Router } from "express";
import { commentValidation } from "../validation.js";
import Comment from "../models/comment.js";
import Post from "../models/post.js";

const commentRouter = Router();

commentRouter.get("/:postId", async (req, res) => {
  const { postId } = req.params;
  const { page } = req.query;
  const limit = 10;
  try {
    const result = await Comment.find({ post: postId })
      .populate({ path: "author", select: "username thumbnail" })
      .limit(limit)
      .skip(limit * page)
      .lean();
    return res.status(200).send(result);
  } catch (error) {}
});

commentRouter.post("/:postId", async (req, res) => {
  const { postId } = req.params;
  const { error } = commentValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { content } = req.body;
  const author = req.user;
  try {
    const findPost = await Post.findById(postId);
    if (!findPost) {
      return res.status(404).send({ error: "post not found" });
    }
    const result = await new Comment({
      post: postId,
      content: content,
      author: author._id,
    }).save();
    findPost.comments.push(result._id);
    await findPost.save();
    return res.status(200).send(result);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

commentRouter.patch("/like/:_id", async (req, res) => {
  const { _id } = req.params;
  const user = req.user;
  try {
    const findComment = await Comment.findById(_id);
    if (!findComment)
      return res.status(404).send({ error: "comment not found" });
    const index = findComment.likes.indexOf(user._id);
    if (index !== -1) {
      findComment.likes.splice(index, 1);
      await findComment.save();
      return res.status(204).send();
    }
    findComment.likes.push(user._id);
    await findComment.save();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default commentRouter;
