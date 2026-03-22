import { getUserIdentifier, getUsageStatus } from "@/lib/redis";

export async function GET(req: Request) {
  const identifier = getUserIdentifier(req);
  const status = await getUsageStatus(identifier);

  return Response.json({
    used: status.used,
    limit: status.limit,
    remaining: status.remaining,
    isPaid: status.isPaid,
  });
}
