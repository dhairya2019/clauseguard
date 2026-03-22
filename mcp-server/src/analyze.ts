/**
 * Claude API integration for contract analysis.
 *
 * Uses the tool_use pattern with tool_choice to guarantee structured JSON
 * output matching the ContractAnalysis interface. The Claude model is forced
 * to call the `contract_analysis_result` tool, and the structured input is
 * extracted directly from the tool_use block.
 *
 * IMPORTANT: No console.log() — stdout is reserved for MCP stdio transport.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  ContractAnalysis,
  CONTRACT_ANALYSIS_SCHEMA,
} from "./schemas/contract.js";
import { buildSystemPrompt, buildUserMessage } from "./prompts/system-prompt.js";

const TOOL_NAME = "contract_analysis_result";

/**
 * Analyze a contract using the Claude API with structured output.
 *
 * @param contractText - Full text of the contract to analyze
 * @param analysisType - Type of analysis: "full", "risk", or "summary"
 * @param partyPerspective - Optional perspective (e.g. "freelancer", "client")
 * @returns Structured contract analysis result
 * @throws Error if Claude does not produce a tool_use block
 */
export async function analyzeContract(
  contractText: string,
  analysisType: string,
  partyPerspective?: string,
): Promise<ContractAnalysis> {
  const anthropic = new Anthropic();

  const model = process.env.CLAUSEGUARD_MODEL || "claude-sonnet-4-5-20250514";

  const message = await anthropic.messages.create({
    model,
    max_tokens: 8192,
    system: buildSystemPrompt(),
    messages: [
      {
        role: "user",
        content: buildUserMessage(contractText, analysisType, partyPerspective),
      },
    ],
    tools: [
      {
        name: TOOL_NAME,
        description: "Structured contract analysis output",
        input_schema:
          CONTRACT_ANALYSIS_SCHEMA as unknown as Anthropic.Messages.Tool.InputSchema,
      },
    ],
    tool_choice: { type: "tool" as const, name: TOOL_NAME },
  });

  const toolUseBlock = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );

  if (!toolUseBlock) {
    throw new Error("Claude did not produce structured output");
  }

  return toolUseBlock.input as ContractAnalysis;
}
