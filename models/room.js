import mongoose, { Schema } from "mongoose";
import { deleteImage } from "../routes/upload.js";
import message from "./message.js";

const RoomSchema = new Schema({
  thumbnail: { type: String },
  name: { type: String, require: true },
  users: { type: [mongoose.Schema.ObjectId], ref: "User", default: [] },
  lastMessage: { type: mongoose.Schema.ObjectId, ref: "Message" },
  updateDate: { type: Date, default: Date.now },
});
RoomSchema.pre("findOneAndDelete", async function (next) {
  try {
    const room = await this.model.findOne(this.getQuery());
    if (room.thumbnail) {
      await deleteImage(room.thumbnail);
    }
    await message.deleteMany({ room: room._id });
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Room", RoomSchema);
