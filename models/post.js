import mongoose, { mongo, Schema } from "mongoose";

const PostSchema = new Schema({
  title: { type: String, require: true },
  content: { type: String, require: true },
  image: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  community: { type: mongoose.Schema.ObjectId, ref: "Community" },
  likes: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
  comments: { type: [String], default: [] },
  postTime: { type: Date, default: Date.now() },
  modifiedTime: { type: Date },
});

export default mongoose.model("Post", PostSchema);
