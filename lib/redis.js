import { createClient } from 'redis';

const globalForRedis = globalThis;

export const redis = globalForRedis.redis || createClient({
  url: process.env.REDIS_URL,
});

redis.on('error', (err) => console.error('Redis Client Error', err));

if (!globalForRedis.redis) {
  redis.connect().catch(console.error);
  globalForRedis.redis = redis;
}