import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema({
  username: { type: String, require: true },
  password: { type: String, require: true },
  email: { type: String, require: true, unique: true, lowercase: true },
  birthday: { type: Date, require: true },
  createDate: { type: Date, default: Date.now },
  gender: { type: String, enum: ["male", "female"] },
  friends: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
  thumbnail: { type: String },
  coverPhoto: { type: String },
  info: { type: String },
  isOnline: { type: Boolean, default: false },
});

//save and encrypt

UserSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    //this =>document in mongoDB
    let hashValue = await bcrypt.hash(this.password, 10);

    this.password = hashValue;
  }
  next();
});

UserSchema.methods.comparePassword = async function (password, callback) {
  try {
    const result = await bcrypt.compare(password, this.password);
    console.log(result);
    return callback(null, result);
  } catch (error) {
    return callback(error);
  }
};

export default mongoose.model("User", UserSchema);
