import Redis from 'ioredis';
import { MemoryRedis } from './memory-redis';

// Use a singleton pattern to avoid creating multiple connections in dev mode
const globalForRedis = global as unknown as { redis: any };

const getRedisClient = () => {
  if (process.env.REDIS_URL) {
    console.log("Initializing Redis client with URL provided.");
    const client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      showFriendlyErrorStack: true,
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err.message);
    });

    return client;
  } else {
    console.warn("REDIS_URL not set. Using in-memory store for chat streaming. Persistence will be lost on restart.");
    return new MemoryRedis() as any;
  }
};

export const redis = globalForRedis.redis || getRedisClient();

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
