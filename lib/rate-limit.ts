import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

// 10 requests per minute sliding window
export function createRateLimiter(requests = 10, windowSeconds = 60) {
  const r = getRedis();
  if (!r) return null;

  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds}s`),
    analytics: false,
  });
}

// 1 view per hour per IP per slug
export function createViewRateLimiter() {
  return createRateLimiter(1, 3600);
}

// 5 contact form submissions per 10 minutes per IP
export function createContactRateLimiter() {
  return createRateLimiter(5, 600);
}

export function getIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0].trim();
  if (real) return real.trim();
  return "127.0.0.1";
}