import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    _redis = Redis.fromEnv();
  }
  return _redis;
}

const FREE_LIMIT = 3;
const USAGE_PREFIX = "usage:";
const PAID_PREFIX = "paid:";

/**
 * Extract a compound identifier from the request.
 * Format: {ip}:{fingerprint} or {ip}:nofp if no fingerprint header.
 */
export function getUserIdentifier(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const fingerprint = req.headers.get("x-fingerprint") || "nofp";
  return `${ip}:${fingerprint}`;
}

/**
 * Atomically increment usage and check against limit.
 * INCR first (atomic), then check. If over limit, DECR back.
 */
export async function checkAndIncrementUsage(identifier: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  isPaid: boolean;
}> {
  const paidKey = `${PAID_PREFIX}${identifier}`;
  const usageKey = `${USAGE_PREFIX}${identifier}`;

  // Check if user is paid first
  const isPaid = await getRedis().get<boolean>(paidKey);
  if (isPaid) {
    return { allowed: true, used: 0, limit: Infinity, remaining: Infinity, isPaid: true };
  }

  // Increment and check free usage (atomic INCR)
  const used = await getRedis().incr(usageKey);

  if (used > FREE_LIMIT) {
    // Decrement back since we shouldn't count this blocked attempt
    await getRedis().decr(usageKey);
    return { allowed: false, used: FREE_LIMIT, limit: FREE_LIMIT, remaining: 0, isPaid: false };
  }

  return {
    allowed: true,
    used,
    limit: FREE_LIMIT,
    remaining: FREE_LIMIT - used,
    isPaid: false,
  };
}

/**
 * Read-only usage status check (no increment).
 */
export async function getUsageStatus(identifier: string): Promise<{
  used: number;
  limit: number;
  remaining: number;
  isPaid: boolean;
}> {
  const isPaid = await getRedis().get<boolean>(`${PAID_PREFIX}${identifier}`);
  if (isPaid) {
    return { used: 0, limit: Infinity, remaining: Infinity, isPaid: true };
  }
  const used = (await getRedis().get<number>(`${USAGE_PREFIX}${identifier}`)) || 0;
  return { used, limit: FREE_LIMIT, remaining: Math.max(0, FREE_LIMIT - used), isPaid: false };
}

/**
 * Mark an identifier as paid (permanent, no TTL).
 */
export async function markAsPaid(identifier: string): Promise<void> {
  await getRedis().set(`${PAID_PREFIX}${identifier}`, true);
}
