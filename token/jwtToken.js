import jwt from "jwt-simple";
export default function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user._id, iat: timestamp }, process.env.SECRET);
}
