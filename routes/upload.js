import { Router } from "express";

import { v1 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import User from "../models/user.js";
import Room from "../models/room.js";
import Post from "../models/post.js";
import Comment from "../models/comment.js";

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: "ap-northeast-1",
});

const uploadRouter = Router();

uploadRouter.get("/presign", async (req, res) => {
  const key = `${req.user._id}/${v1()}.jpeg`;
  const s3Param = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: "image/jpeg",
  };

  const command = new PutObjectCommand(s3Param);
  try {
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    return res.status(200).send({ key, presignedUrl });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

uploadRouter.post("/user", async (req, res) => {
  const { key, type } = req.body;
  const userId = req.user._id;
  try {
    if (type === "thumbnail") {
      const result = await User.findByIdAndUpdate(userId, { thumbnail: key });
      return res.status(200).send(result);
    } else if (type === "coverPhoto") {
      const result = await User.findByIdAndUpdate(userId, { coverPhoto: key });
      if (!result) return res.status(404).send({ error: "not found" });
      return res.status(200).send(result);
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

uploadRouter.post("/room", async (req, res) => {
  const { key, roomId } = req.body;
  try {
    const result = await Room.findByIdAndUpdate(roomId, { thumbnail: key });
    if (!result) return res.status(404).send({ error: "not found" });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(error);
  }
});
uploadRouter.post("/post", async (req, res) => {
  const { key, postId } = req.body;
  try {
    const result = await Post.findByIdAndUpdate(postId, { image: key });
    if (!result) return res.status(404).send({ error: "not found" });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(error);
  }
});
uploadRouter.post("/comment", async (req, res) => {
  const { key, commentId } = req.body;
  try {
    const result = await Comment.findByIdAndUpdate(commentId, { image: key });
    if (!result) return res.status(404).send({ error: "not found" });
    return res.status(200).send(result);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

export default uploadRouter;
