import { clearHash } from "../services/cache.js";

export const cleanHashMiddleware = (type) => {
  return async (req, res, next) => {
    console.log("clean cache");
    let clearId;

    if (type === "room") {
      clearId = req.user._id;
    }
    await next();
    clearHash(clearId);
  };
};
