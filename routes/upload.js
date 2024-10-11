import { Router } from "express";

import { v1 } from "uuid";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import User from "../models/user.js";

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
    return res.status(500).send({ error: error });
  }
});

export async function deleteImage(key) {
  const s3Param = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
  };
  const command = new DeleteObjectCommand(s3Param);
  try {
    const result = await s3.send(command);

    return result;
  } catch (error) {
    return error;
  }
}

export default uploadRouter;
