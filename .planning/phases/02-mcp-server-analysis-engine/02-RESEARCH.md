# Phase 2: MCP Server + Analysis Engine - Research

**Researched:** 2026-03-22
**Domain:** MCP Server Development, Anthropic SDK Integration, System Prompt Engineering
**Confidence:** HIGH

## Summary

Phase 2 builds an npm-publishable MCP server (`clauseguard-mcp`) that exposes a single `analyze_contract` tool. The tool accepts contract text, calls the Claude API with a specialized system prompt (extracted from SKILL.md, clause-patterns.md, and india-law.md), and returns structured JSON analysis. The MCP TypeScript SDK v1.27.1 is stable and well-documented, with native Zod schema support for tool registration. The Anthropic SDK's `tool_use` + `tool_choice` pattern guarantees structured JSON output matching a defined schema. The system prompt must encode all analysis logic, risk classification rules, India-specific legal rules, and framing rules from the existing skill files into a single, cohesive prompt that produces machine-readable JSON (not markdown).

**Primary recommendation:** Use `@modelcontextprotocol/sdk@^1.27` with Zod v3.25 (not v4 -- stability over novelty), `@anthropic-ai/sdk@^0.80` with the `tool_use` + `tool_choice` pattern for guaranteed structured JSON output, and extract the analysis system prompt from SKILL.md + reference files as a TypeScript string template.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MCP-01 | Node.js MCP server with stdio transport using @modelcontextprotocol/sdk | Standard Stack: McpServer + StdioServerTransport, verified import paths |
| MCP-02 | `analyze_contract` tool with Zod input schema (contract_text, analysis_type, party_perspective) | Architecture Pattern 1: registerTool with Zod inputSchema |
| MCP-03 | Claude API integration via @anthropic-ai/sdk with structured JSON output (tool_use pattern) | Architecture Pattern 2: tool_use + tool_choice for guaranteed JSON |
| MCP-04 | Output schema: documentType, riskScore, clauses[{text, risk, explanation, suggestion}], missingClauses, disclaimer | Code Examples: output schema definition + structuredContent |
| MCP-05 | India-specific analysis rules encoded in system prompt | Architecture Pattern 3: System prompt extraction strategy |
| MCP-06 | Error handling: domain errors (isError) for business logic, McpError for protocol failures | Architecture Pattern 4: Error handling with isError vs McpError |
| MCP-07 | TypeScript build with ESM, shebang, bin field -- installable via `npx -y clauseguard-mcp` | Standard Stack: tsconfig, package.json, build pipeline |
| MCP-08 | README with install command and Claude Desktop config example | Build pipeline pattern includes README template |
| ANALYSIS-01 | Document type identification | System prompt section: document classification as first analysis step |
| ANALYSIS-02 | 6 Tier 1 clause categories | System prompt section: clause extraction taxonomy from SKILL.md Step 3 |
| ANALYSIS-03 | Three-tier risk classification with consistent criteria | System prompt section: risk levels from SKILL.md Step 4 + clause-patterns.md |
| ANALYSIS-04 | Plain English explanations for every flagged clause | System prompt framing rules: "this clause means..." pattern |
| ANALYSIS-05 | Safer alternative wording suggestions | System prompt: safer alternative templates from clause-patterns.md Section 3 |
| ANALYSIS-06 | Missing clause detection against per-document-type checklists | System prompt: missing clause checklists from clause-patterns.md Section 2 |
| ANALYSIS-07 | Overall document risk score | System prompt: aggregation formula from SKILL.md Step 4 |
| ANALYSIS-08 | India-specific rules: S.27, S.28, S.25, S.73-74, FEMA, jurisdiction | System prompt: all rules from india-law.md Sections 1-9 |
| ANALYSIS-09 | "Consult a lawyer" escalation for high-severity issues | System prompt: escalation triggers from SKILL.md |
| ANALYSIS-10 | Framing rules: always "this clause means..." never "you should..." | System prompt: framing rules from SKILL.md |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @modelcontextprotocol/sdk | ^1.27.1 | MCP server framework -- tool registration, stdio transport | Official SDK, stable v1.x, well-documented registerTool API |
| @anthropic-ai/sdk | ^0.80.0 | Claude API client -- messages.create with tool_use | Official Anthropic SDK, reads ANTHROPIC_API_KEY from env |
| zod | ^3.25 | Schema validation for MCP tool inputs | Required peer dependency of MCP SDK; v3.25+ for stability |
| typescript | ^5.5 | Type-safe development | Industry standard for MCP server development |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tsx | ^4.x | Dev-time TypeScript execution | During development only (`npm run dev`) |
| @types/node | ^20 | Node.js type definitions | TypeScript compilation |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zod v3.25 | Zod v4 | v4 is supported by MCP SDK (peer dep `^3.25 \|\| ^4.0`) but beta-era issues reported (schema descriptions not propagating, `_parse` errors). Use v3.25 for stability. |
| tool_use pattern | JSON mode / response format | tool_use + tool_choice guarantees schema-conformant output; JSON mode does not. |
| claude-sonnet-4-5 model | claude-haiku-3-5 | Sonnet gives better analysis quality. Haiku could be a fallback for cost-sensitive users. |

**Installation:**
```bash
npm install @modelcontextprotocol/sdk@^1.27 @anthropic-ai/sdk@^0.80 zod@^3.25
npm install -D typescript@^5.5 tsx@^4 @types/node@^20
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── index.ts              # Entry point: shebang + McpServer setup + registerTool
├── analyze.ts            # Claude API integration -- tool_use structured output
├── prompts/
│   └── system-prompt.ts  # System prompt extracted from SKILL.md + reference files
├── schemas/
│   └── contract.ts       # Zod schemas for input + TypeScript types for output
└── errors.ts             # Error handling utilities (isError vs McpError)
dist/                     # Compiled output (git-ignored)
package.json
tsconfig.json
README.md
```

### Pattern 1: MCP Tool Registration with Zod inputSchema

**What:** Register the `analyze_contract` tool using `server.registerTool()` with Zod schemas for input validation and optional outputSchema.
**When to use:** Always -- this is the standard MCP tool registration pattern.

```typescript
// Source: MCP TypeScript SDK docs/server.md (verified 2026-03-22)
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "clauseguard",
  version: "1.0.0",
});

server.registerTool(
  "analyze_contract",
  {
    title: "Analyze Contract",
    description: "Analyze a legal contract for risks, unfavorable terms, missing protections, and obligations. Returns structured JSON with clause-by-clause risk assessment, India-specific legal flags, and safer alternative suggestions.",
    inputSchema: z.object({
      contract_text: z.string().min(50).describe("The full text of the contract to analyze"),
      analysis_type: z.enum(["full", "risk", "summary"]).default("full").describe("Type of analysis"),
      party_perspective: z.string().optional().describe("Which party's perspective to analyze from"),
    }),
    outputSchema: z.object({
      documentType: z.string(),
      riskScore: z.enum(["high", "medium", "low"]),
      clauses: z.array(z.object({
        text: z.string(),
        risk: z.enum(["high", "medium", "low"]),
        explanation: z.string(),
        suggestion: z.string(),
      })),
      missingClauses: z.array(z.object({
        name: z.string(),
        importance: z.string(),
        note: z.string(),
      })),
      disclaimer: z.string(),
    }),
  },
  async ({ contract_text, analysis_type, party_perspective }) => {
    const result = await analyzeContract(contract_text, analysis_type, party_perspective);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

**Key details:**
- Import paths use `.js` extensions: `@modelcontextprotocol/sdk/server/mcp.js` and `@modelcontextprotocol/sdk/server/stdio.js`
- `registerTool` takes 3 args: name (string), definition (object with title/description/inputSchema/outputSchema), handler (async function)
- Handler receives validated args directly (destructured), returns `{ content, structuredContent }`
- `outputSchema` is optional but recommended -- enables typed `structuredContent` in the response
- `content` is always an array of content blocks (text, image, or resource)

### Pattern 2: Claude API tool_use + tool_choice for Guaranteed Structured JSON

**What:** Define a "result" tool with the desired output schema, force Claude to use it via `tool_choice`, and extract structured data from the `tool_use` block.
**When to use:** Whenever you need guaranteed structured JSON from Claude (the core of our analysis engine).

```typescript
// Source: Anthropic structured outputs docs (verified 2026-03-22)
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env

async function analyzeContract(
  contractText: string,
  analysisType: string,
  partyPerspective?: string,
): Promise<ContractAnalysis> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 8192,
    system: SYSTEM_PROMPT, // the full analysis system prompt
    messages: [
      {
        role: "user",
        content: buildUserMessage(contractText, analysisType, partyPerspective),
      },
    ],
    tools: [
      {
        name: "contract_analysis_result",
        description: "Structured contract analysis output",
        strict: true, // guarantees schema conformance
        input_schema: CONTRACT_ANALYSIS_SCHEMA, // JSON Schema object
      },
    ],
    tool_choice: { type: "tool", name: "contract_analysis_result" },
  });

  const toolUseBlock = message.content.find((block) => block.type === "tool_use");
  if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
    throw new Error("Claude did not produce structured output");
  }

  return toolUseBlock.input as ContractAnalysis;
}
```

**Key details:**
- `strict: true` on the tool definition guarantees the output matches the schema exactly
- `tool_choice: { type: "tool", name: "contract_analysis_result" }` forces Claude to call this tool (no text preamble)
- The "tool" is not a real tool -- it is a schema-enforcement mechanism. Claude fills `toolUseBlock.input` with structured data matching `input_schema`
- `input_schema` must be a JSON Schema object (not Zod). Use `zod-to-json-schema` or manually define it
- `max_tokens: 8192` -- contracts can be long, analysis can be detailed. 4096 may be too short for complex contracts

### Pattern 3: System Prompt Extraction from SKILL.md + Reference Files

**What:** Convert the markdown-based analysis instructions into a JSON-output-focused system prompt.
**When to use:** When building the system prompt for the Claude API call.

The existing SKILL.md (319 lines) + clause-patterns.md (379 lines) + india-law.md (289 lines) total ~987 lines of analysis instructions. These must be condensed into a system prompt that:

1. Instructs Claude to output structured JSON (not markdown)
2. Preserves all risk classification logic from clause-patterns.md Section 1
3. Preserves all India-specific rules from india-law.md Sections 1-9
4. Preserves framing rules (explain, never advise)
5. Preserves the 8-step workflow but adapted for JSON output
6. Includes the disclaimer text verbatim

**Extraction strategy:**

```
System prompt structure:
├── Role + output format instructions (JSON schema description)
├── Step 1: Document type identification (from SKILL.md Step 2)
├── Step 2: Clause extraction taxonomy (from SKILL.md Step 3)
├── Step 3: Risk classification rules (from SKILL.md Step 4 + clause-patterns.md Section 1)
├── Step 4: India-specific rules (from india-law.md Sections 1-9, using IF/THEN blocks)
├── Step 5: Missing clause checklists (from clause-patterns.md Section 2)
├── Step 6: Edge case detection (from clause-patterns.md Section 4)
├── Step 7: Safer alternative templates (from clause-patterns.md Section 3)
├── Step 8: Overall risk aggregation + escalation rules
├── Framing rules (from SKILL.md)
└── Disclaimer text (verbatim from SKILL.md)
```

**Key difference from SKILL.md:** The system prompt must instruct Claude to return analysis as the `contract_analysis_result` tool input, not as markdown. The 8-step workflow becomes implicit (Claude follows the logic internally) rather than explicit output sections.

**Estimated system prompt size:** ~4000-6000 tokens. This is well within Claude's context window but should be tested for quality vs. conciseness tradeoffs.

### Pattern 4: Error Handling -- isError vs McpError

**What:** Two distinct error channels for different failure modes.
**When to use:** Always implement both.

```typescript
// Source: MCP SDK docs + community best practices
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

// DOMAIN ERRORS: business logic failures the LLM should handle
// Return isError: true in the tool response
async function handleDomainError(message: string) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }],
  };
}

// Use for:
// - Contract text too short (<50 chars)
// - Claude API returned unexpected response
// - Analysis produced no clauses (empty contract)

// PROTOCOL ERRORS: malformed requests, infrastructure failures
// Throw McpError
// Use for:
// - Missing ANTHROPIC_API_KEY
// - Invalid tool name
// - Schema validation failures (should be rare with Zod)
throw new McpError(ErrorCode.InvalidParams, "contract_text must be at least 50 characters");
throw new McpError(ErrorCode.InternalError, "ANTHROPIC_API_KEY environment variable not set");
```

### Anti-Patterns to Avoid

- **Logging to stdout:** MCP stdio transport uses stdout for protocol messages. Use `console.error()` or `server.sendLoggingMessage()` for debug output. NEVER use `console.log()`.
- **Zod v4 in production:** Despite peer dependency support, Zod v4 has reported issues with MCP SDK (schema descriptions not propagating, `_parse` errors). Use Zod v3.25.
- **JSON.parse on Claude response text:** Use the `tool_use` pattern instead. Text responses are not guaranteed to be valid JSON.
- **Hardcoding model names:** Use a constant or env var for the Claude model. Users may want to switch between Sonnet/Haiku/Opus.
- **Skipping the shebang:** Without `#!/usr/bin/env node`, `npx -y clauseguard-mcp` will fail on Unix systems.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON Schema from types | Manual JSON Schema objects | Define in Zod, convert with `zodToJsonSchema()` from `zod-to-json-schema` | Zod is already a dependency; keeps schemas DRY |
| Structured Claude output | Parse JSON from text response | `tool_use` + `tool_choice` pattern | Guaranteed schema conformance, no parsing errors |
| MCP protocol handling | Custom stdio protocol | `McpServer` + `StdioServerTransport` | Protocol is complex; SDK handles framing, JSON-RPC |
| Input validation | Manual string checks | Zod schemas in registerTool | MCP SDK validates automatically before handler is called |
| Environment variable reading | Custom env parsing | Anthropic SDK's built-in env reading | SDK reads `ANTHROPIC_API_KEY` by default |

**Key insight:** The MCP SDK and Anthropic SDK handle all the hard protocol/API plumbing. The only custom code needed is: (1) the system prompt, (2) the output schema, and (3) gluing them together in the tool handler.

## Common Pitfalls

### Pitfall 1: stdout Pollution Kills MCP stdio
**What goes wrong:** Any `console.log()` in the server code corrupts the MCP protocol stream, causing connection failures.
**Why it happens:** MCP stdio transport reads JSON-RPC messages from stdout. Any non-protocol text breaks the framing.
**How to avoid:** Use `console.error()` for all debug output. Set up a logging utility that writes to stderr only. Test with MCP Inspector to verify no stdout pollution.
**Warning signs:** "Parse error" in MCP client, connection drops, "Invalid JSON" errors.

### Pitfall 2: System Prompt Too Long Degrades Analysis Quality
**What goes wrong:** Stuffing all 987 lines of SKILL.md + reference files into the system prompt overwhelms Claude, leading to incomplete or inconsistent analysis.
**Why it happens:** Very long system prompts compete with the contract text for attention in the context window.
**How to avoid:** Condense the system prompt to essential rules and patterns. Use tables and IF/THEN pseudocode (already structured this way in reference files). Test with short and long contracts. Target 4000-6000 tokens for system prompt.
**Warning signs:** Analysis misses obvious clauses, India rules not firing, inconsistent risk classifications.

### Pitfall 3: Zod v4 Compatibility Issues
**What goes wrong:** MCP SDK v1.27.1 lists `zod: "^3.25 || ^4.0"` as peer dependency. Zod v4 has reported issues: schema descriptions not propagating to tool definitions, `_parse is not a function` errors.
**Why it happens:** Zod v4 changed internal APIs. While the MCP SDK added compatibility, edge cases remain.
**How to avoid:** Pin to `zod@^3.25` (specifically 3.25.x which bridges v3 and v4 APIs). Only upgrade to v4 after verifying with MCP Inspector.
**Warning signs:** Tool schemas missing descriptions in MCP Inspector, runtime `_parse` errors.

### Pitfall 4: max_tokens Too Low for Complex Contracts
**What goes wrong:** Claude truncates analysis of long contracts, missing clauses or producing incomplete JSON.
**Why it happens:** `max_tokens: 4096` is often the default in examples, but a complex contract with 15+ clauses can produce 6000+ tokens of structured analysis.
**How to avoid:** Set `max_tokens: 8192` or higher. The tool_use pattern will not produce invalid JSON on truncation (it will produce a shorter response), but clauses may be omitted.
**Warning signs:** Analysis contains fewer clauses than expected, missing `missingClauses` array.

### Pitfall 5: Missing chmod +x on Built File
**What goes wrong:** `npx -y clauseguard-mcp` fails on Unix/macOS with "Permission denied" even though the shebang is present.
**Why it happens:** TypeScript compiler does not set executable permissions on output files.
**How to avoid:** Add `"postbuild": "chmod +x dist/index.js"` to package.json scripts.
**Warning signs:** Works on Windows but fails on macOS/Linux.

### Pitfall 6: API Key Not Available in MCP Stdio Context
**What goes wrong:** Server starts but Claude API calls fail with "authentication error" because `ANTHROPIC_API_KEY` is not in the process environment.
**Why it happens:** MCP servers spawned by Claude Desktop or `npx` inherit the parent process environment. If the key is set in a shell profile but the MCP host spawns from a different context, the key may be missing.
**How to avoid:** (1) Document that users must set the env var or pass it in Claude Desktop config. (2) Check for the key at server startup and return a clear McpError if missing. (3) Support the `env` field in Claude Desktop config.
**Warning signs:** "401 Unauthorized" errors, "Missing API key" errors.

## Code Examples

### Complete JSON Schema for Contract Analysis Output

This schema is used in the Claude API `tool_use` pattern. Define in TypeScript, convert to JSON Schema:

```typescript
// Source: derived from FEATURES.md output structure + REQUIREMENTS.md
import { z } from "zod";

// Input schema (for MCP registerTool)
export const AnalyzeContractInput = z.object({
  contract_text: z.string().min(50).describe("Full text of the contract to analyze"),
  analysis_type: z.enum(["full", "risk", "summary"]).default("full")
    .describe("'full' = comprehensive, 'risk' = risks only, 'summary' = high-level overview"),
  party_perspective: z.string().optional()
    .describe("Perspective for analysis: 'freelancer', 'client', 'employee', 'vendor'"),
});

// Output type (for Claude tool_use input_schema -- must be JSON Schema, not Zod)
export const CONTRACT_ANALYSIS_SCHEMA = {
  type: "object" as const,
  properties: {
    documentType: {
      type: "string",
      enum: ["freelance_agreement", "nda", "terms_of_service", "employment", "saas", "vendor", "other"],
    },
    parties: {
      type: "object",
      properties: {
        party_a: { type: "string" },
        party_b: { type: "string" },
      },
      required: ["party_a", "party_b"],
    },
    riskScore: {
      type: "string",
      enum: ["high", "medium", "low"],
    },
    riskSummary: { type: "string" },
    riskBreakdown: {
      type: "object",
      properties: {
        high: { type: "number" },
        medium: { type: "number" },
        low: { type: "number" },
      },
      required: ["high", "medium", "low"],
    },
    clauses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          clauseNumber: { type: "number" },
          title: { type: "string" },
          category: {
            type: "string",
            enum: ["payment_terms", "ip_ownership", "termination", "liability_indemnification", "scope_of_work", "non_compete", "confidentiality", "other"],
          },
          originalText: { type: "string" },
          risk: { type: "string", enum: ["high", "medium", "low"] },
          explanation: { type: "string" },
          concerns: { type: "array", items: { type: "string" } },
          suggestion: { type: "string" },
          indiaNote: { type: "string" },
          escalation: { type: "boolean" },
        },
        required: ["clauseNumber", "title", "category", "risk", "explanation", "suggestion"],
      },
    },
    missingClauses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          importance: { type: "string", enum: ["critical", "high", "medium", "low"] },
          note: { type: "string" },
        },
        required: ["name", "importance", "note"],
      },
    },
    escalationFlags: {
      type: "array",
      items: { type: "string" },
    },
    disclaimer: { type: "string" },
  },
  required: ["documentType", "riskScore", "riskSummary", "riskBreakdown", "clauses", "missingClauses", "disclaimer"],
  additionalProperties: false,
} as const;

// TypeScript type derived from schema
export interface ContractAnalysis {
  documentType: string;
  parties?: { party_a: string; party_b: string };
  riskScore: "high" | "medium" | "low";
  riskSummary: string;
  riskBreakdown: { high: number; medium: number; low: number };
  clauses: Array<{
    clauseNumber: number;
    title: string;
    category: string;
    originalText?: string;
    risk: "high" | "medium" | "low";
    explanation: string;
    concerns?: string[];
    suggestion: string;
    indiaNote?: string;
    escalation?: boolean;
  }>;
  missingClauses: Array<{
    name: string;
    importance: string;
    note: string;
  }>;
  escalationFlags?: string[];
  disclaimer: string;
}
```

### Server Entry Point Pattern

```typescript
#!/usr/bin/env node
// Source: MCP SDK docs/server.md (verified 2026-03-22)

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { AnalyzeContractInput } from "./schemas/contract.js";
import { analyzeContract } from "./analyze.js";

// Validate API key at startup
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Error: ANTHROPIC_API_KEY environment variable is required");
  process.exit(1);
}

const server = new McpServer({
  name: "clauseguard",
  version: "1.0.0",
});

server.registerTool(
  "analyze_contract",
  {
    title: "Analyze Contract",
    description: "Analyze a legal contract for risks, unfavorable terms, missing protections, and obligations with India-specific legal awareness. Returns structured JSON.",
    inputSchema: AnalyzeContractInput,
  },
  async ({ contract_text, analysis_type, party_perspective }) => {
    try {
      const result = await analyzeContract(contract_text, analysis_type, party_perspective);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("API")) {
        return {
          isError: true,
          content: [{ type: "text", text: `Claude API error: ${error.message}` }],
        };
      }
      throw error;
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

### package.json Template

```json
{
  "name": "clauseguard-mcp",
  "version": "1.0.0",
  "description": "MCP server for legal contract analysis with India-specific awareness, powered by Claude",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "clauseguard-mcp": "./dist/index.js"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "postbuild": "chmod +x dist/index.js",
    "dev": "tsx src/index.ts",
    "inspect": "npx @modelcontextprotocol/inspector node dist/index.js",
    "prepublishOnly": "npm run build"
  },
  "engines": { "node": ">=18" },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.27.0",
    "@anthropic-ai/sdk": "^0.80.0",
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "tsx": "^4.0.0",
    "@types/node": "^20.0.0"
  },
  "keywords": ["mcp", "contract", "legal", "claude", "ai", "india"],
  "license": "MIT"
}
```

### tsconfig.json Template

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Zod v3 only | Zod v3.25+ or v4 | MCP SDK v1.23+ | Peer dep broadened; use v3.25 for stability |
| No outputSchema | outputSchema + structuredContent | MCP spec 2025-11-25 | Tools can return typed structured data alongside text |
| JSON.parse text | tool_use + tool_choice | Anthropic SDK 2025 | Guaranteed structured output without parsing |
| `strict` not available | `strict: true` on tool definitions | Anthropic SDK 2025 | Schema conformance guaranteed by the model |
| Manual env var handling | Anthropic SDK auto-reads env | Always | SDK reads ANTHROPIC_API_KEY automatically |

**Deprecated/outdated:**
- MCP SDK v2 imports (`@modelcontextprotocol/server`): v2 is pre-alpha, do NOT use. Stick with `@modelcontextprotocol/sdk/server/mcp.js`
- `z.zod()` Zod v4 syntax: not compatible with all MCP SDK versions yet

## Open Questions

1. **System prompt size vs. quality tradeoff**
   - What we know: SKILL.md (319 lines) + clause-patterns.md (379 lines) + india-law.md (289 lines) = ~987 lines of analysis logic. All reference files are already structured as IF/THEN rules and tables for MCP extraction.
   - What's unclear: How much compression is possible without losing analysis quality? Do all 107 clause patterns need to be in the system prompt, or can we rely on Claude's training data for common patterns and only include India-specific and edge-case rules?
   - Recommendation: Start with a comprehensive system prompt (~5000 tokens). Test against Phase 1.1 test fixtures. Trim iteratively based on which patterns Claude already knows vs. which need explicit prompting.

2. **Model selection for analysis**
   - What we know: claude-sonnet-4-5 is the recommended balance of quality and cost. Haiku is cheaper but less thorough.
   - What's unclear: Whether to hardcode the model or make it configurable via env var.
   - Recommendation: Default to `claude-sonnet-4-5-20250514`. Support `CLAUSEGUARD_MODEL` env var override for users who want to use a different model.

3. **outputSchema support maturity**
   - What we know: MCP SDK v1.27.1 supports `outputSchema` in `registerTool`. The spec defines `structuredContent` in tool responses.
   - What's unclear: Whether all MCP clients (Claude Desktop, Claude Code, MCP Inspector) fully support `structuredContent`. Some clients may ignore it and only use `content`.
   - Recommendation: Always return both `content` (JSON as text) and `structuredContent` (parsed object). This ensures backward compatibility with clients that do not support structured content.

## Sources

### Primary (HIGH confidence)
- [MCP TypeScript SDK v1.27.1 - npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk) - version, peer dependencies verified via `npm view`
- [MCP TypeScript SDK - server.md](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md) - registerTool API, outputSchema, structuredContent patterns
- [Anthropic Structured Outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) - tool_use + tool_choice + strict:true pattern
- [@anthropic-ai/sdk v0.80.0](https://www.npmjs.com/package/@anthropic-ai/sdk) - version verified via `npm view`

### Secondary (MEDIUM confidence)
- [MCP SDK Zod v4 compatibility issue #925](https://github.com/modelcontextprotocol/typescript-sdk/issues/925) - Zod v4 beta support confirmed, issues documented
- [MCP SDK structuredContent issue #654](https://github.com/modelcontextprotocol/typescript-sdk/issues/654) - structuredContent behavior with errors
- [Publish MCP Server to NPM](https://www.aihero.dev/publish-your-mcp-server-to-npm) - shebang, bin field, publishing flow
- [Error Handling in MCP TypeScript SDK](https://dev.to/yigit-konur/error-handling-in-mcp-typescript-sdk-2ol7) - isError vs McpError patterns

### Tertiary (LOW confidence)
- [MCP SDK v2 development](https://github.com/modelcontextprotocol/typescript-sdk/releases) - v2 pre-alpha status, import path changes (do NOT use for production)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all versions verified via npm, APIs verified via official docs
- Architecture: HIGH - all patterns verified against official SDK documentation and Anthropic docs
- Pitfalls: HIGH - drawn from official issues, community reports, and verified SDK behavior
- System prompt extraction: MEDIUM - strategy is sound but quality depends on iterative testing with Phase 1.1 fixtures

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (30 days -- stable domain, SDKs at v1.x)
