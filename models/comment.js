import mongoose, { Schema } from "mongoose";

const CommentSchema = new Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  content: { type: String, require: true },
  image: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  replies: { type: [mongoose.Schema.Types.ObjectId], ref: "Comment" },
  likes: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
  postTime: { type: Date, default: Date.now() },
});

export default mongoose.model("Comment", CommentSchema);
