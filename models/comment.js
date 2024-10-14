import mongoose, { Schema, set } from "mongoose";
import { deleteImage } from "../routes/upload.js";

const CommentSchema = new Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  content: { type: String, require: true },
  image: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  replies: { type: [mongoose.Schema.Types.ObjectId], ref: "Comment" },
  likes: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
  postTime: { type: Date, default: Date.now },
});

CommentSchema.pre("findOneAndDelete", async function (next) {
  try {
    const comment = await this.model.findOne(this.getQuery());
    if (comment.image) {
      await deleteImage(comment.image);
    }

    next();
  } catch (error) {
    next(error);
  }
});
CommentSchema.pre("deleteMany", async function (next) {
  try {
    const filter = this.getFilter();

    const comments = await this.model.find(filter);
    comments.forEach(async (comment) => {
      if (comment.image) {
        const result = await deleteImage(comment.image);
      }
    });
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Comment", CommentSchema);
