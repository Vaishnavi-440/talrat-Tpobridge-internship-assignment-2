import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
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

const PROFILE_TTL = 60; // seconds

export async function getCachedProfile(slug: string) {
  const r = getRedis();
  if (!r) return null;

  try {
    const cached = await r.get(`profile:${slug}`);
    if (cached) {
      return typeof cached === "string" ? JSON.parse(cached) : cached;
    }
    return null;
  } catch (err) {
    console.error("Cache get error:", err);
    return null;
  }
}

export async function setCachedProfile(slug: string, data: unknown) {
  const r = getRedis();
  if (!r) return;

  try {
    await r.set(`profile:${slug}`, JSON.stringify(data), { ex: PROFILE_TTL });
  } catch (err) {
    console.error("Cache set error:", err);
  }
}

export async function invalidateCachedProfile(slug: string) {
  const r = getRedis();
  if (!r) return;

  try {
    await r.del(`profile:${slug}`);
  } catch (err) {
    console.error("Cache invalidate error:", err);
  }
}