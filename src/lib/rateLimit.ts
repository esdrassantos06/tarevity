import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.REDIS_URL || "",
  token: process.env.REDIS_TOKEN || "",
});

export async function rateLimiter(
  req: NextRequest,
  options: {
    limit: number; // Maximum number of requests
    window: number; // Time window in seconds
    identifier?: string; // Custom identifier (defaults to IP)
  }
) {
  const { limit, window, identifier } = options;

  // Get identifier - use IP if not provided
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "anonymous";
  const id = identifier || ip;

  // Create a unique key for this rate limit
  const key = `rate-limit:${req.nextUrl.pathname}:${id}`;

  // Get current count
  const count = (await redis.get(key)) as number || 0;

  // Check if limit is exceeded
  if (count >= limit) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: window },
      { status: 429, headers: { "Retry-After": window.toString() } }
    );
  }

  // Increment count and set expiry if it's the first request
  if (count === 0) {
    await redis.set(key, 1, { ex: window });
  } else {
    await redis.incr(key);
  }

  // Continue to the actual handler
  return null;
}
