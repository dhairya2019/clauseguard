import { streamText, Output } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { contractAnalysisSchema } from "@/lib/schemas";
import { buildSystemPrompt, buildUserMessage } from "@/lib/prompts";
import { getUserIdentifier, checkAndIncrementUsage } from "@/lib/redis";

export const maxDuration = 60;

export async function POST(req: Request) {
  // --- Rate limit check (before reading body) ---
  let usage = { allowed: true, used: 0, limit: 3, remaining: 3, isPaid: false };
  try {
    const identifier = getUserIdentifier(req);
    usage = await checkAndIncrementUsage(identifier);
  } catch {
    // Redis not configured — skip rate limiting
  }

  if (!usage.allowed) {
    return Response.json(
      {
        error: "Free analysis limit reached",
        code: "LIMIT_REACHED",
        used: usage.used,
        limit: usage.limit,
      },
      {
        status: 429,
        headers: {
          "X-Usage-Used": String(usage.used),
          "X-Usage-Limit": String(usage.limit),
          "X-Usage-Remaining": "0",
        },
      },
    );
  }

  const { contractText, analysisType = "full", partyPerspective } =
    await req.json();

  if (!contractText || contractText.length < 50) {
    return Response.json(
      { error: "Contract text must be at least 50 characters" },
      { status: 400 },
    );
  }

  try {
    const result = streamText({
      model: anthropic("claude-sonnet-4-5-20250514"),
      system: buildSystemPrompt(),
      output: Output.object({ schema: contractAnalysisSchema }),
      prompt: buildUserMessage(contractText, analysisType, partyPerspective),
    });

    // Add usage headers to streaming response
    const response = result.toTextStreamResponse();
    response.headers.set("X-Usage-Used", String(usage.used));
    response.headers.set("X-Usage-Limit", String(usage.limit));
    response.headers.set("X-Usage-Remaining", String(usage.remaining));
    return response;
  } catch (err) {
    return Response.json(
      { error: "Analysis failed", details: String(err) },
      { status: 500 },
    );
  }
}
