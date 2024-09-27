import { Strategy, ExtractJwt } from "passport-jwt";
import User from "../models/user.js";
import passport from "passport";
const JwtStrategy = Strategy;

//setup option for jwt strategy
const secret = process.env.SECRET;
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken("authorization"),
  secretOrKey: secret,
};

//create jwt strategy
const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
  //see if the user ID in the payload exist in out database
  //if it does,call "done" with that
  //otherwise, call done without a user object
  try {
    const user = await User.findById(payload.sub);

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
});

export default jwtLogin;
