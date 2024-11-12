import mongoose from "mongoose";
import redis from "redis";

const redisUrl =
  "redis://forpersonalproject.fbxs9e.ng.0001.apne1.cache.amazonaws.com:6379"; //change when publication
const client = redis.createClient({
  url: redisUrl,
});

client
  .connect()
  .then(() => {
    console.log("connect to redis");
  })
  .catch((e) => {
    console.log(e);
    console.log("redis unable to connect");
  });
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "");
  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
      options: this.getOptions(),
    })
  );

  const cacheValue = await client.hGet(this.hashKey, key);

  if (cacheValue) {
    console.log("cache");
    return JSON.parse(cacheValue);
  }

  const result = await exec.apply(this, arguments);

  client.hSet(this.hashKey, key, JSON.stringify(result));
  client.expire(this.hashKey, 300);

  return result;
};

//export sections

export function clearHash(hashKey = "") {
  client.del(JSON.stringify(hashKey));
}

export async function notificationCache(method, hashKey, value) {
  const key = JSON.stringify(hashKey);
  let notifications = await client.hGet(key, "notification");
  notifications = notifications ? JSON.parse(notifications) : [];
  if (method === "get") {
    return notifications;
  }
  if (method === "put") {
    notifications.push(value);
    client.hSet(key, "notification", JSON.stringify(notifications));
    client.expire(key, 600);
  }
}

export { client };
