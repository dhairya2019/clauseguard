import { getUserIdentifier, getUsageStatus } from "@/lib/redis";

export async function GET(req: Request) {
  try {
    const identifier = getUserIdentifier(req);
    const status = await getUsageStatus(identifier);

    return Response.json({
      used: status.used,
      limit: status.limit,
      remaining: status.remaining,
      isPaid: status.isPaid,
    });
  } catch {
    // Redis not configured — return default free tier
    return Response.json({
      used: 0,
      limit: 3,
      remaining: 3,
      isPaid: false,
    });
  }
}
