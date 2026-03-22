import { streamText, Output } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { contractAnalysisSchema } from "@/lib/schemas";
import { buildSystemPrompt, buildUserMessage } from "@/lib/prompts";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { contractText, analysisType = "full", partyPerspective } =
    await req.json();

  if (!contractText || contractText.length < 50) {
    return Response.json(
      { error: "Contract text must be at least 50 characters" },
      { status: 400 },
    );
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-5-20250514"),
    system: buildSystemPrompt(),
    output: Output.object({ schema: contractAnalysisSchema }),
    prompt: buildUserMessage(contractText, analysisType, partyPerspective),
  });

  return result.toTextStreamResponse();
}
