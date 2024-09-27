import LocalStrategy from "passport-local";
import User from "../models/user.js";

const localOptions = {
  usernameField: "email",
};
//create local strategy
const localLogin = new LocalStrategy(
  localOptions,
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false);
      user.comparePassword(password, (e, isMatch) => {
        if (e) return done(e);
        if (!isMatch) return done(null, false);

        return done(null, user);
      });
    } catch (error) {
      return done(error);
    }
  }
);

export default localLogin;
