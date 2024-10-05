import mongoose, { Schema } from "mongoose";

const CommunitySchema = new Schema({
  name: { type: String, require: true },
  icon: { type: String },
  banner: { type: String },
  description: { type: String, require: true },
  managers: { type: [mongoose.Schema.ObjectId], ref: "User" },
  rules: {
    type: [{ title: { type: String }, content: { type: String } }],
    default: [],
  },
});

export default mongoose.model("Community", CommunitySchema);
