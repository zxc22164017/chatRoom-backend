import mongoose from "mongoose";
import redis from "redis";

const client = redis.createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "redis-11222.c294.ap-northeast-1-2.ec2.redns.redis-cloud.com",
    port: 11222,
  },
});

try {
  await client.connect();
  console.log("connect to redis");
} catch (error) {
  console.log(error);
}

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "");
  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache || !client.isReady) {
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
