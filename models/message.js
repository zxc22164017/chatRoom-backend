import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema({
  room: { type: String, require: true },
  sender: { type: mongoose.Schema.ObjectId, ref: "User", require: true },
  message: { type: String, require: true },
  createTime: { type: Date, default: Date.now },
  readed: { type: Boolean, default: false },
});
export default mongoose.model("Message", MessageSchema);
