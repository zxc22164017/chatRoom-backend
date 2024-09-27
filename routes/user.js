import { Router } from "express";
import passportServices from "../services/passport.js";
import passport from "passport";
import User from "../models/user.js";
import tokenForUser from "../token/jwtToken.js";
import Room from "../models/room.js";

const requireAuth = passport.authenticate("jwt", { session: false });
const requireSignin = passport.authenticate("local", { session: false });
passportServices(passport);
const userRouter = Router();

userRouter.post("/signup", async (req, res, next) => {
  const { username, email, password, birthday, gender } = req.body;
  if (!email || !password) {
    return res.status(422).send({ error: "some infos are not provided" });
  }

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
    }).save();
    return res.status(201).send({ token: tokenForUser(newUser) });
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
});

userRouter.post("/signin", requireSignin, (req, res, next) => {
  return res.send({ token: tokenForUser(req.user) });
});
//protected routes
userRouter.use(requireAuth);

userRouter.get("/", (req, res) => {
  req.user.isOnline = true;
  return res.send(req.user);
});
userRouter.patch("/logout", async (req, res) => {
  const { _id } = req.body;
  await User.findByIdAndUpdate(_id, { isOnline: false });
  return res.status(204).send();
});

userRouter.get("/search", async (req, res) => {
  const search = req.query.search;
  try {
    const findUsers = await User.find({
      username: { $regex: search, $options: "i" },
    })
      .select("-password -email -birthday -gender -rooms ")
      .lean();

    return res.status(200).send(findUsers);
  } catch (error) {
    return res.status(500).send(error);
  }
});

userRouter.get("/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const findUser = await User.findById(_id).select("-password -rooms").lean();
    return res.status(200).send(findUser);
  } catch (error) {
    return res.status(500).send(error);
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
    if (findUser01.friends.includes(user02Id)) {
      return res.status(400).send("freind already");
    }
    if (!findRoom) {
      const newRoom = await new Room({
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
    return res.status(500).send(error);
  }
});
userRouter.delete("/friend", async (req, res) => {
  try {
    const { user01Id, user02Id } = req.body;
    const result01 = await User.findByIdAndUpdate(user01Id, {
      $pull: { friends: user02Id },
    });
    const result02 = await User.findByIdAndUpdate(user02Id, {
      $pull: { friends: user01Id },
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default userRouter;
