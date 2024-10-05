import mongoose, { Schema } from "mongoose";

const RoomSchema = new Schema({
  thumbnail: { type: String },
  name: { type: String, require: true },
  users: { type: [mongoose.Schema.ObjectId], ref: "User", default: [] },
  lastMessage: { type: mongoose.Schema.ObjectId, ref: "Message" },
  updateDate: { type: Date, default: Date.now },
});

export default mongoose.model("Room", RoomSchema);
