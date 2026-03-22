# Technology Research: MCP Server & Claude Code SKILL.md

**Project:** ClauseGuard
**Domain:** MCP Server Development, Claude Code Skills, Anthropic SDK Integration
**Researched:** 2026-03-22
**Overall Confidence:** HIGH

---

## 1. Building an MCP Server with @modelcontextprotocol/sdk

**Confidence:** HIGH (official SDK docs + GitHub README)

### Installation

```bash
npm install @modelcontextprotocol/sdk zod
```

The SDK requires **Zod v4** as a peer dependency for schema validation. The current recommended approach is v1.x of the SDK (v2 is pre-alpha, not production-ready until at least Q2 2026).

### Core Server Setup (stdio transport)

```typescript
#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "clauseguard",
  version: "1.0.0",
});

// Register the analyze_contract tool
server.registerTool(
  "analyze_contract",
  {
    title: "Analyze Contract",
    description:
      "Analyze a legal contract or clause for risks, obligations, and recommendations",
    inputSchema: z.object({
      contract_text: z
        .string()
        .describe("The full text of the contract or clause to analyze"),
      analysis_type: z
        .enum(["risk", "obligations", "summary", "full"])
        .default("full")
        .describe("Type of analysis to perform"),
      party_perspective: z
        .string()
        .optional()
        .describe(
          "Which party's perspective to analyze from (e.g., 'vendor', 'client')"
        ),
    }),
  },
  async ({ contract_text, analysis_type, party_perspective }) => {
    // Call Claude API here (see Section 3)
    const result = await analyzeContract(
      contract_text,
      analysis_type,
      party_perspective
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
);

// Connect via stdio
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Key Patterns

**Tool registration** uses `server.registerTool(name, definition, handler)`:
- `name`: string identifier for the tool
- `definition`: object with `title`, `description`, and `inputSchema` (Zod schema)
- `handler`: async function receiving validated args, returns `{ content: [...] }`

**Content types** in tool results:
- `{ type: "text", text: "..." }` -- text content (primary for ClauseGuard)
- `{ type: "image", data: "base64...", mimeType: "image/png" }` -- images
- `{ type: "resource", resource: { uri, text } }` -- embedded resources

**Error handling** -- two distinct patterns:

```typescript
// Domain errors: return isError flag (LLM sees the error and can react)
async ({ contract_text }) => {
  if (!contract_text.trim()) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: "Error: contract_text is empty. Provide the contract text to analyze.",
        },
      ],
    };
  }
  // ... normal processing
};
```

```typescript
// Protocol errors: throw McpError (invalid requests, unsupported operations)
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

throw new McpError(ErrorCode.InvalidParams, "contract_text is required");
```

**Rule of thumb:** Use `isError: true` for business logic failures the LLM should handle. Throw `McpError` for protocol-level issues (malformed requests, missing capabilities).

### TypeScript Project Setup

```json
// tsconfig.json
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
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

```json
// package.json (partial)
{
  "type": "module",
  "engines": { "node": ">=18" }
}
```

The SDK uses ESM-only exports. The project **must** use `"type": "module"` in package.json and NodeNext module resolution.

### Testing & Debugging

Use the MCP Inspector for interactive debugging:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

This opens a web UI to invoke tools, inspect schemas, and view responses.

---

## 2. Claude Code SKILL.md Structure

**Confidence:** HIGH (official docs at code.claude.com/docs/en/skills + platform.claude.com best practices)

### File Location

For ClauseGuard as a distributable skill, the recommended path is:

```
~/.claude/skills/clauseguard/SKILL.md
```

Or within a project repo at `.claude/skills/clauseguard/SKILL.md`.

### Frontmatter Format (all available fields)

```yaml
---
name: clauseguard                    # max 64 chars, lowercase/numbers/hyphens only
description: >-                       # max 1024 chars, third person, specific
  Analyzes legal contracts and clauses for risks, unfavorable terms,
  missing protections, and obligations. Use when reviewing contracts,
  NDAs, SaaS agreements, employment contracts, or when the user asks
  about contract risks, clause analysis, or legal review.
argument-hint: "[contract-file-or-text]"  # shown in autocomplete
disable-model-invocation: false       # false = Claude can auto-trigger
user-invocable: true                  # true = shows in / menu
allowed-tools: Read, Grep, Glob      # tools allowed without permission
# context: fork                       # uncomment to run in subagent
# agent: Explore                      # subagent type if context: fork
# model: claude-sonnet-4-5            # override model
# effort: high                        # low/medium/high/max
---
```

### Description Optimization (Critical for Trigger Rate)

The description field is the **primary mechanism** for Claude deciding whether to invoke the skill. Key rules:

1. **Write in third person** -- "Analyzes contracts..." not "I analyze..." or "You can use..."
2. **Include trigger phrases** -- "Use when reviewing contracts, NDAs, SaaS agreements..."
3. **Be slightly pushy** -- Claude undertriggers by default; explicit "USE WHEN" language helps
4. **Include keyword variants** -- "contract risks, clause analysis, legal review, unfavorable terms"

Properly optimized descriptions improve activation from ~20% to 50-90%.

### SKILL.md Body Content

```yaml
---
name: clauseguard
description: >-
  Analyzes legal contracts and clauses for risks, unfavorable terms,
  missing protections, and obligations. Use when reviewing contracts,
  NDAs, SaaS agreements, employment contracts, or when the user asks
  about contract risks, clause analysis, or legal review.
argument-hint: "[file-path-or-paste-text]"
allowed-tools: Read, Grep, Glob
---

# ClauseGuard: Contract & Clause Analyzer

When analyzing a contract or legal clause, follow this process:

## Step 1: Identify the document

If $ARGUMENTS is a file path, read the file. If it is pasted text, use it directly.

## Step 2: Classify the contract type

Identify: NDA, SaaS/subscription, employment, consulting, vendor/supplier,
licensing, partnership, lease, or general services agreement.

## Step 3: Analyze for risks

For each clause, evaluate:

1. **Unfavorable terms** -- terms that disproportionately favor one party
2. **Missing protections** -- standard clauses that are absent
   - Limitation of liability
   - Indemnification
   - Termination rights
   - IP ownership clarity
   - Data protection / privacy
   - Force majeure
   - Dispute resolution
3. **Ambiguous language** -- terms that could be interpreted multiple ways
4. **Unusual provisions** -- non-standard terms that warrant attention
5. **Compliance gaps** -- potential regulatory issues (GDPR, etc.)

## Step 4: Output format

Present findings as:

### Contract Summary
- Type: [contract type]
- Parties: [identified parties]
- Key dates: [effective, termination, renewal]

### Risk Assessment
For each risk found:
- **Clause**: [quote or reference]
- **Risk Level**: HIGH / MEDIUM / LOW
- **Issue**: [what is problematic]
- **Recommendation**: [specific suggested change]

### Missing Protections
List standard clauses not present with why they matter.

### Overall Risk Score
Rate 1-10 with justification.

## Additional resources

- For clause-specific patterns, see [clause-patterns.md](clause-patterns.md)
- For jurisdiction-specific notes, see [jurisdictions.md](jurisdictions.md)
```

### Key Best Practices from Official Docs

1. **Keep SKILL.md under 500 lines** -- move detailed reference to supporting files
2. **One level of file references** -- SKILL.md -> reference files, never deeper nesting
3. **Use $ARGUMENTS** for dynamic input -- gets replaced with user input after `/clauseguard`
4. **Progressive disclosure** -- Claude reads SKILL.md first, supporting files only when needed
5. **Test with multiple models** -- Haiku needs more guidance than Opus

### Skill Directory Structure

```
clauseguard/
  SKILL.md                    # Main instructions (required, <500 lines)
  clause-patterns.md          # Common risky clause patterns by contract type
  jurisdictions.md            # US/EU/UK specific considerations
  examples/
    nda-analysis-example.md   # Example analysis output
  scripts/
    validate-format.sh        # Optional validation script
```

---

## 3. Using @anthropic-ai/sdk Inside an MCP Server

**Confidence:** HIGH (official SDK repo + npm)

### Installation

```bash
npm install @anthropic-ai/sdk
```

Current version: **v0.80.0** (March 2026). Requires Node.js 18+.

### Calling Claude from an MCP Tool Handler

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // reads from env by default
});

async function analyzeContract(
  contractText: string,
  analysisType: string,
  partyPerspective?: string
): Promise<ContractAnalysis> {
  const systemPrompt = `You are a legal contract analyst. Analyze the provided contract
for risks, obligations, and missing protections. Return your analysis as structured JSON.

Analysis type: ${analysisType}
${partyPerspective ? `Analyze from the perspective of: ${partyPerspective}` : ""}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Analyze this contract:\n\n${contractText}`,
      },
    ],
    system: systemPrompt,
  });

  // Extract text from response
  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return JSON.parse(textBlock.text);
}
```

### Structured Output via Tool Use (Recommended)

To guarantee structured JSON output, use Claude's tool_use with a schema that matches your desired output shape. The model is forced to produce valid JSON matching the schema.

```typescript
async function analyzeContractStructured(
  contractText: string,
  analysisType: string,
  partyPerspective?: string
): Promise<ContractAnalysis> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 4096,
    system: "You are a legal contract analyst.",
    messages: [
      {
        role: "user",
        content: `Analyze this contract (type: ${analysisType}${partyPerspective ? `, perspective: ${partyPerspective}` : ""}):\n\n${contractText}`,
      },
    ],
    tools: [
      {
        name: "contract_analysis_result",
        description: "Structured contract analysis output",
        input_schema: {
          type: "object" as const,
          properties: {
            contract_type: {
              type: "string",
              enum: [
                "nda",
                "saas",
                "employment",
                "consulting",
                "vendor",
                "licensing",
                "partnership",
                "lease",
                "services",
                "other",
              ],
            },
            parties: {
              type: "array",
              items: { type: "string" },
            },
            overall_risk_score: {
              type: "number",
              minimum: 1,
              maximum: 10,
            },
            risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  clause_reference: { type: "string" },
                  risk_level: {
                    type: "string",
                    enum: ["HIGH", "MEDIUM", "LOW"],
                  },
                  issue: { type: "string" },
                  recommendation: { type: "string" },
                },
                required: [
                  "clause_reference",
                  "risk_level",
                  "issue",
                  "recommendation",
                ],
              },
            },
            missing_protections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  clause_name: { type: "string" },
                  importance: {
                    type: "string",
                    enum: ["CRITICAL", "RECOMMENDED", "NICE_TO_HAVE"],
                  },
                  explanation: { type: "string" },
                },
                required: ["clause_name", "importance", "explanation"],
              },
            },
            summary: { type: "string" },
          },
          required: [
            "contract_type",
            "parties",
            "overall_risk_score",
            "risks",
            "missing_protections",
            "summary",
          ],
        },
      },
    ],
    tool_choice: { type: "tool", name: "contract_analysis_result" },
  });

  // Extract the tool use block
  const toolUseBlock = message.content.find(
    (block) => block.type === "tool_use"
  );
  if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
    throw new Error("No structured output from Claude");
  }

  return toolUseBlock.input as ContractAnalysis;
}
```

### Environment Variable Handling

The Anthropic SDK reads `ANTHROPIC_API_KEY` from the environment by default. For MCP servers running via stdio, the API key must be available in the process environment. Two approaches:

1. **User sets env var** before running the MCP server (simplest)
2. **Claude Desktop config** passes env vars in the server configuration:

```json
{
  "mcpServers": {
    "clauseguard": {
      "command": "npx",
      "args": ["-y", "clauseguard-mcp"],
      "env": {
        "ANTHROPIC_API_KEY": "sk-ant-..."
      }
    }
  }
}
```

### Cost Considerations

When the MCP tool calls Claude internally, each invocation costs API tokens. For the freemium model:
- **Free tier:** Could use a cheaper model (Haiku) or limit analysis depth
- **Paid tier:** Use Sonnet for comprehensive analysis
- Consider caching repeated contract patterns to reduce API calls

---

## 4. MCP Tool Input/Output Schema Best Practices

**Confidence:** HIGH (MCP specification + community best practices)

### Schema Design for analyze_contract

Use JSON Schema 2020-12 (MCP default). Key principles:

1. **Use structured constraints** -- `enum`, `minimum`, `maximum`, `pattern`, not free-text descriptions
2. **Schema as source of truth** -- if behavior changes, update schema first
3. **Keep tools atomic** -- one tool = one focused operation
4. **Make descriptions actionable** -- tell the LLM what each field does

### Recommended Input Schema (Zod -> JSON Schema)

```typescript
const analyzeContractInput = z.object({
  contract_text: z
    .string()
    .min(1)
    .describe("The full text of the contract or clause to analyze"),

  analysis_type: z
    .enum(["risk", "obligations", "summary", "full"])
    .default("full")
    .describe(
      "Type of analysis: 'risk' for risk assessment, 'obligations' for party obligations, 'summary' for overview, 'full' for comprehensive"
    ),

  party_perspective: z
    .string()
    .optional()
    .describe(
      "Which party's perspective to analyze from, e.g. 'vendor', 'client', 'employee'"
    ),

  contract_type: z
    .enum([
      "nda",
      "saas",
      "employment",
      "consulting",
      "vendor",
      "licensing",
      "other",
    ])
    .optional()
    .describe(
      "Known contract type. If omitted, will be auto-detected from content"
    ),

  jurisdiction: z
    .string()
    .optional()
    .describe(
      "Legal jurisdiction for analysis context, e.g. 'US', 'EU', 'UK'"
    ),
});
```

### Output Schema (MCP spec supports outputSchema since June 2025)

The MCP spec introduced `outputSchema` and `structuredContent` fields. If the SDK version supports it, define output schemas for typed responses:

```typescript
server.registerTool(
  "analyze_contract",
  {
    title: "Analyze Contract",
    description: "Analyze a legal contract for risks and obligations",
    inputSchema: analyzeContractInput,
    // outputSchema if supported by SDK version
  },
  async (args) => {
    const result = await analyzeContractStructured(
      args.contract_text,
      args.analysis_type,
      args.party_perspective
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
);
```

### Error Response Pattern

```typescript
// Return actionable error messages so the LLM knows what to fix
return {
  isError: true,
  content: [
    {
      type: "text",
      text: JSON.stringify({
        error: "CONTRACT_TOO_SHORT",
        message:
          "Contract text is too short for meaningful analysis (minimum 50 characters).",
        suggestion:
          "Provide the full contract text, not just a clause title.",
        received_length: contract_text.length,
      }),
    },
  ],
};
```

---

## 5. Making an MCP Server npx-Installable

**Confidence:** HIGH (npm docs + multiple MCP server publishing guides)

### Package.json Configuration

```json
{
  "name": "clauseguard-mcp",
  "version": "1.0.0",
  "description": "MCP server for legal contract analysis powered by Claude",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "clauseguard-mcp": "./dist/index.js"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build",
    "dev": "tsx src/index.ts",
    "inspect": "npx @modelcontextprotocol/inspector node dist/index.js"
  },
  "engines": {
    "node": ">=18"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.x",
    "@anthropic-ai/sdk": "^0.80.0",
    "zod": "^3.24"
  },
  "devDependencies": {
    "typescript": "^5.5",
    "tsx": "^4.x",
    "@types/node": "^20"
  },
  "keywords": ["mcp", "contract", "legal", "claude", "ai"],
  "license": "MIT"
}
```

### Shebang Line

The entry file (`src/index.ts`) **must** start with:

```typescript
#!/usr/bin/env node
```

This tells the OS to run the file with Node.js when invoked as a binary. TypeScript compiles this through to the output file. On Unix, ensure the built file is executable:

```json
// Add to package.json scripts
"postbuild": "chmod +x dist/index.js"
```

### Build Configuration

```json
// tsconfig.json
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

### Publishing Flow

```bash
# 1. Build
npm run build

# 2. Test locally
node dist/index.js  # should start stdio server

# 3. Test with MCP inspector
npx @modelcontextprotocol/inspector node dist/index.js

# 4. Login to npm
npm login

# 5. Publish
npm publish --access public

# 6. Users run via:
npx -y clauseguard-mcp
```

### Claude Desktop Integration

Users configure in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "clauseguard": {
      "command": "npx",
      "args": ["-y", "clauseguard-mcp@latest"],
      "env": {
        "ANTHROPIC_API_KEY": "sk-ant-..."
      }
    }
  }
}
```

### Scoped Package Alternative

For organization branding, use a scoped package:

```json
{
  "name": "@clauseguard/mcp-server",
  "bin": {
    "clauseguard-mcp": "./dist/index.js"
  }
}
```

Users run: `npx -y @clauseguard/mcp-server@latest`

---

## 6. Complete Project Structure

```
clauseguard/
  src/
    index.ts              # Entry point: shebang + server setup + tool registration
    tools/
      analyze-contract.ts # Tool handler + Claude API integration
      types.ts            # TypeScript interfaces for analysis results
    prompts/
      system-prompts.ts   # System prompts for different analysis types
    utils/
      validation.ts       # Input validation helpers
  skill/
    SKILL.md              # Claude Code skill definition
    clause-patterns.md    # Reference: common risky clause patterns
    jurisdictions.md      # Reference: jurisdiction-specific notes
    examples/
      nda-analysis.md     # Example output
  dist/                   # Compiled output (git-ignored)
  package.json
  tsconfig.json
```

---

## 7. Integration Pattern: All Three Delivery Modes

### Mode 1: SKILL.md (Free)
- Zero infrastructure -- just markdown files
- Claude uses its own knowledge for analysis
- No API costs, no server needed
- Limited by Claude's general knowledge (no custom prompts or structured output)

### Mode 2: MCP Server (Freemium)
- Runs locally via `npx clauseguard-mcp`
- Calls Claude API with specialized prompts for deeper analysis
- Structured JSON output via tool_use pattern
- User provides their own ANTHROPIC_API_KEY

### Mode 3: Next.js Web App (Freemium)
- Server-side API routes call Claude
- Managed API key (you pay, recoup via subscription)
- UI for drag-and-drop contract upload
- History, saved analyses, team features

### Shared Code Strategy

The analysis logic (prompts, output schemas, TypeScript types) should be shared between the MCP server and the Next.js app. Extract into a shared package or a `packages/core` directory in a monorepo:

```
packages/
  core/           # Shared types, prompts, schemas
  mcp-server/     # MCP server wrapping core
  web/            # Next.js app importing core
  skill/          # SKILL.md files (standalone)
```

---

## Sources

### Official Documentation
- [MCP TypeScript SDK - GitHub](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP TypeScript SDK - Server Docs](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md)
- [MCP Specification (2025-11-25)](https://modelcontextprotocol.io/specification/2025-11-25/basic)
- [MCP Tools Concepts](https://modelcontextprotocol.info/docs/concepts/tools/)
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [Anthropic Skills Repository](https://github.com/anthropics/skills)

### Community & Tutorials
- [Publish MCP Server to NPM](https://www.aihero.dev/publish-your-mcp-server-to-npm)
- [MCP Error Handling in TypeScript](https://dev.to/yigit-konur/error-handling-in-mcp-typescript-sdk-2ol7)
- [Error Handling Best Practices for MCP](https://mcpcat.io/guides/error-handling-custom-mcp-servers/)
- [Claude Code Skills Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
- [MCP Tool Schema Guide](https://www.merge.dev/blog/mcp-tool-schema)
