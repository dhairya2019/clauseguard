---
phase: 02-mcp-server-analysis-engine
plan: 01
subsystem: mcp-server
tags: [typescript, mcp, zod, json-schema, system-prompt, contract-analysis]

requires: []
provides:
  - "MCP server project scaffold with package.json, tsconfig.json, npm dependencies"
  - "Zod input schema (AnalyzeContractInput) for MCP tool registration"
  - "JSON Schema (CONTRACT_ANALYSIS_SCHEMA) for Claude tool_use structured output"
  - "ContractAnalysis TypeScript interface matching JSON Schema"
  - "Domain error utility (handleDomainError) for business logic failures"
  - "Full analysis system prompt (~5000 tokens) encoding all logic from SKILL.md + clause-patterns.md + india-law.md"
  - "buildSystemPrompt() and buildUserMessage() functions for Claude API calls"
affects: [phase-02-plan-02, mcp-server-wiring, claude-api-integration]

tech-stack:
  added: [typescript, "@modelcontextprotocol/sdk@^1.27", "@anthropic-ai/sdk@^0.80", "zod@^3.25"]
  patterns: [ESM with NodeNext, JSON Schema for tool_use, Zod for input validation]

key-files:
  created:
    - mcp-server/package.json
    - mcp-server/tsconfig.json
    - mcp-server/src/schemas/contract.ts
    - mcp-server/src/errors.ts
    - mcp-server/src/prompts/system-prompt.ts

key-decisions:
  - "Manual JSON Schema object for CONTRACT_ANALYSIS_SCHEMA rather than zod-to-json-schema conversion — avoids extra dependency and gives precise control over the tool_use schema"
  - "Zod v3.25 (not v4) for stability — v4 has reported MCP SDK compatibility issues"
  - "System prompt targets ~5000 tokens — condenses 987 lines of source into IF/THEN rules while preserving all risk classification logic, India-specific rules, and framing rules"
  - "System prompt instructs Claude to call contract_analysis_result tool (not produce markdown) — different output format from SKILL.md"
  - "All 5 S.27 non-compete scenarios encoded with case citations (Percept D'Mark, Varun Tyagi)"
  - "FEMA rules include S.13 penalty amounts (up to 3x) and 15-month repatriation deadline"
  - "Domain errors (isError: true) separated from protocol errors (McpError) per MCP SDK patterns"
  - "ZERO console.log() — only console.error() to avoid stdout pollution on MCP stdio transport"

patterns-established:
  - "All import paths use .js extensions for NodeNext module resolution"
  - "JSON Schema uses 'as const' assertions for type safety"
  - "ContractAnalysis interface mirrors JSON Schema with optional fields for non-required properties"
  - "System prompt follows structured sections: document type -> clause extraction -> risk classification -> India rules -> missing clauses -> safer alternatives -> risk aggregation -> framing -> disclaimer"

verification:
  - "`npx tsc --noEmit` exits 0 with zero errors"
  - "contract.ts exports: AnalyzeContractInput, CONTRACT_ANALYSIS_SCHEMA, ContractAnalysis"
  - "system-prompt.ts exports: buildSystemPrompt, buildUserMessage"
  - "errors.ts exports: handleDomainError"
  - "System prompt contains S.27, FEMA, non-compete, contract_analysis_result, disclaimer"
  - "package.json has bin field pointing to dist/index.js"

next-steps:
  - "Plan 02-02: Wire up MCP server entry point (index.ts) + Claude API integration (analyze.ts)"
  - "Plan 02-02 will import all modules created here: schemas, prompts, errors"
---
