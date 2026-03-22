#!/usr/bin/env node

/**
 * ClauseGuard MCP Server entry point.
 *
 * Registers the `analyze_contract` tool and connects via stdio transport.
 * The server accepts contract text and returns structured risk analysis
 * with India-specific legal awareness.
 *
 * IMPORTANT: No console.log() — stdout is reserved for MCP stdio transport.
 * Only console.error() is safe for diagnostics.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { AnalyzeContractInput } from "./schemas/contract.js";
import { analyzeContract } from "./analyze.js";
import { handleDomainError } from "./errors.js";

// ---------------------------------------------------------------------------
// Startup validation
// ---------------------------------------------------------------------------

if (!process.env.ANTHROPIC_API_KEY) {
  console.error(
    "Error: ANTHROPIC_API_KEY environment variable is required",
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Server creation
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "clauseguard",
  version: "1.0.0",
});

// ---------------------------------------------------------------------------
// Tool registration
// ---------------------------------------------------------------------------

server.registerTool(
  "analyze_contract",
  {
    title: "Analyze Contract",
    description:
      "Analyze a legal contract for risks, unfavorable terms, missing protections, and obligations with India-specific legal awareness. Returns structured JSON with clause-by-clause risk assessment.",
    inputSchema: AnalyzeContractInput,
  },
  async ({ contract_text, analysis_type, party_perspective }) => {
    try {
      const result = await analyzeContract(
        contract_text,
        analysis_type,
        party_perspective,
      );

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(result, null, 2) },
        ],
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : String(error);

      if (
        message.includes("API") ||
        message.includes("authentication") ||
        message.includes("401")
      ) {
        return handleDomainError(`Claude API error: ${message}`);
      }

      if (message.includes("did not produce structured output")) {
        return handleDomainError(
          "Analysis failed: Claude did not return structured results. Try again or simplify the contract text.",
        );
      }

      // Infrastructure / protocol errors — let MCP SDK handle
      throw error;
    }
  },
);

// ---------------------------------------------------------------------------
// Transport connection
// ---------------------------------------------------------------------------

const transport = new StdioServerTransport();
await server.connect(transport);
