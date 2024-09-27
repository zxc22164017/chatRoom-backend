import passport from "passport";
import localLogin from "./localStrategy.js";
import jwtLogin from "./jwtStrategy.js";

export default function passportServices(passport) {
  passport.use(jwtLogin);
  passport.use(localLogin);
}
