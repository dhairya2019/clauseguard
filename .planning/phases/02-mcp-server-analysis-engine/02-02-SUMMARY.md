---
phase: 02-mcp-server-analysis-engine
plan: 02
subsystem: mcp-server
tags: [typescript, mcp, claude-api, tool-use, stdio-transport]

requires: ["02-01"]
provides:
  - "Claude API integration with tool_use + tool_choice structured output pattern"
  - "MCP server entry point with analyze_contract tool registration"
  - "Stdio transport connection for MCP protocol communication"
  - "Domain error handling for API failures and missing structured output"
  - "Startup validation for ANTHROPIC_API_KEY"
affects: [phase-02-testing, mcp-server-runtime]

tech-stack:
  added: []
  patterns: [tool_use forced output, domain vs protocol error split, env-configurable model]

key-files:
  created:
    - mcp-server/src/analyze.ts
    - mcp-server/src/index.ts

key-decisions:
  - "CONTRACT_ANALYSIS_SCHEMA cast through `unknown` to Anthropic.Messages.Tool.InputSchema — the `as const` assertions on the schema produce readonly arrays incompatible with the SDK's mutable InputSchema type. Double cast is safe because the shape is correct at runtime."
  - "Model configurable via CLAUSEGUARD_MODEL env var, defaults to claude-sonnet-4-5-20250514 — allows switching models without code changes"
  - "max_tokens: 8192 — complex contracts with many clauses need headroom for full structured output"
  - "Error classification: API/auth errors and missing-output errors return handleDomainError (isError:true); all other errors re-thrown for MCP SDK to handle as protocol errors"
  - "ZERO console.log() — only console.error() for the missing API key message at startup"

patterns-established:
  - "analyzeContract() is a pure async function: Anthropic client created inside, no shared state"
  - "index.ts uses top-level await for server.connect(transport)"
  - "Tool handler destructures Zod-validated args directly from callback parameter"

verification:
  - "`npx tsc --noEmit` exits 0 with zero errors"
  - "`grep -r 'console.log' mcp-server/src/` returns zero actual calls (only comment mentions)"
  - "index.ts line 1 is `#!/usr/bin/env node`"
  - "All import paths use .js extensions (NodeNext resolution)"
  - "analyze.ts imports: CONTRACT_ANALYSIS_SCHEMA, ContractAnalysis, buildSystemPrompt, buildUserMessage"
  - "index.ts imports: AnalyzeContractInput, analyzeContract, handleDomainError"
  - "Tool registration uses AnalyzeContractInput as inputSchema"
  - "Claude API call uses tool_use + tool_choice with contract_analysis_result tool"

next-steps:
  - "Plan 02-03 (if exists): Integration testing, end-to-end validation with MCP inspector"
  - "Build step: `npm run build` to compile to dist/ for runtime use"
---
