import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// ============================================================
// Redis client — lazy init (only when env vars present)
// ============================================================

function getRedis(): Redis | null {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    console.warn("[RateLimit] Upstash not configured — rate limiting disabled");
    return null;
  }
  return Redis.fromEnv();
}

// ============================================================
// Rate limiter instances (per route category)
// ============================================================

// Payments — 10 requests/minute per IP
export function getPaymentLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    prefix: "rl:payments",
  });
}

// Auth — 5 requests/minute per IP
export function getAuthLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    prefix: "rl:auth",
  });
}

// Downloads — 20 requests/minute per user
export function getDownloadLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    prefix: "rl:downloads",
  });
}

// General API — 60 requests/minute per IP
export function getGeneralLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    prefix: "rl:general",
  });
}

// ============================================================
// Helper: get client IP from Vercel headers
// ============================================================

export function getIpFromHeaders(): string {
  const headersList = headers();
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headersList.get("x-real-ip") ?? "anonymous";
}

// ============================================================
// Helper: apply rate limit, return 429 response if exceeded
// ============================================================

export async function applyRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<NextResponse | null> {
  if (!limiter) return null; // Rate limiting disabled — pass through

  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: "Too many requests",
        code: "RATE_LIMITED",
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }

  return null; // Passed
}
