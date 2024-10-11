import mongoose, { mongo, Schema } from "mongoose";
import comment from "./comment.js";
import { deleteImage } from "../routes/upload.js";

const PostSchema = new Schema({
  title: { type: String, require: true },
  content: { type: String, require: true },
  image: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  community: { type: mongoose.Schema.ObjectId, ref: "Community" },
  likes: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
  comments: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  postTime: { type: Date, default: Date.now },
});

PostSchema.pre("findOneAndDelete", async function (next) {
  try {
    const post = await this.model.findOne(this.getQuery());
    if (post.image) {
      await deleteImage(post.image);
    }
    await comment.deleteMany({ post: this._conditions._id });
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Post", PostSchema);
