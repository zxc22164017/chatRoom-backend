import { Router } from "express";
import passportServices from "../services/passport.js";
import passport from "passport";
import User from "../models/user.js";
import tokenForUser from "../token/jwtToken.js";
import Room from "../models/room.js";
import {
  registerValidation,
  patchValidation,
  forgetPasswordValidation,
} from "../validation.js";

const requireAuth = passport.authenticate("jwt", { session: false });
const requireSignin = passport.authenticate("local", { session: false });
passportServices(passport);
const userRouter = Router();
const limit = 5;

userRouter.post("/signup", async (req, res, next) => {
  const { username, email, password, birthday, gender, thumbnail, coverPhoto } =
    req.body;
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const existUser = await User.findOne({ email }).exec();

    if (existUser) {
      return res.status(422).send({ error: "email is existed" });
    }

    const newUser = await new User({
      username,
      email,
      password,
      birthday,
      gender,
      thumbnail,
      coverPhoto,
    }).save();
    return res.status(201).send({ token: tokenForUser(newUser) });
  } catch (e) {
    return res.status(500).send({ error: error });
  }
});

userRouter.post("/signin", requireSignin, (req, res) => {
  return res.send({ token: tokenForUser(req.user) });
});
userRouter.patch("/forget", async (req, res) => {
  const { error } = forgetPasswordValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { email, password } = req.body;
  try {
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      return res.status(404).send({ error: "wrong email" });
    }
    findUser.password = password;
    await findUser.save();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});
//protected routes
userRouter.use(requireAuth);

userRouter.get("/", async (req, res) => {
  const result = await User.findByIdAndUpdate(req.user._id, { isOnline: true });

  // const userToSend = { ...req.user._doc, isOnline: true };

  return res.status(201).send(result);
});
userRouter.patch("/logout", async (req, res) => {
  const { _id } = req.body;
  await User.findByIdAndUpdate(_id, { isOnline: false });
  return res.status(204).send();
});

userRouter.get("/search", async (req, res) => {
  const { search, page } = req.query;
  try {
    const findUsers = await User.find({
      username: { $regex: search, $options: "i" },
    })
      .select("-password -email -birthday -gender -rooms ")
      .limit(limit)
      .skip(limit * page)
      .lean();

    return res.status(200).send(findUsers);
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

userRouter.get("/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const findUser = await User.findById(_id).select("-password -rooms").lean();
    return res.status(200).send(findUser);
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

userRouter.patch("/friend", async (req, res) => {
  try {
    const { user01Id, user02Id } = req.body;
    const findUser01 = await User.findById(user01Id);
    const findUser02 = await User.findById(user02Id);
    const findRoom = await Room.findOne({
      users: { $all: [user01Id, user02Id] },
    });
    if (!(findUser01 && findUser02)) {
      return res.status(404).send("user id not found");
    }
    const user01Index = findUser01.friends.indexOf(user02Id);
    const user02Index = findUser02.friends.indexOf(user01Id);
    if (user01Index !== -1 && user02Index !== -1) {
      findUser01.friends.splice(user01Index, 1);
      findUser02.friends.splice(user02Index, 1);

      await findUser01.save();
      await findUser02.save();
      return res.status(204).send();
    }
    if (!findRoom) {
      const newRoom = new Room({
        users: [user01Id, user02Id],
      });
      await newRoom.save();
    }
    findUser01.friends.push(user02Id);
    findUser02.friends.push(user01Id);

    await findUser01.save();
    await findUser02.save();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

userRouter.patch("/:_id", async (req, res) => {
  const { error } = patchValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const {
    username,
    email,
    password,
    patchPassword,
    birthday,
    gender,
    info,
    thumbnail,
    coverPhoto,
  } = req.body;
  const { _id } = req.params;

  try {
    const user = await User.findById(_id);
    const isMatch = await user.comparePassword(password, (e, isMatch) => {
      if (e) return false;
      if (!isMatch) return false;

      return true;
    });
    if (!isMatch)
      return res.status(403).send({ error: "password is not correct" });
    user.username = username;
    user.email = email;
    user.birthday = birthday;
    user.gender = gender;
    user.info = info;
    user.thumbnail = thumbnail;
    user.coverPhoto = coverPhoto;
    if (patchPassword !== "") {
      user.password = patchPassword;
    }
    await user.save();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

export default userRouter;
