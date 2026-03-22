---
phase: 03-web-app-core
plan: 02
subsystem: api
tags: [ai-sdk, streaming, zod, claude-api, route-handler, useObject, contract-analysis]

# Dependency graph
requires:
  - phase: 03-web-app-core
    plan: 01
    provides: Next.js scaffold with AI SDK + shadcn/ui dependencies installed
  - phase: 02-mcp-server
    provides: System prompt and ContractAnalysis interface to copy into web app
provides:
  - Zod schema (contractAnalysisSchema) shared by server and client
  - System prompt with India-specific legal rules adapted for Output.object()
  - Risk config map (riskConfig) for color/badge/icon mappings
  - POST /api/analyze streaming Route Handler with Claude integration
  - /analyze page with useObject hook for progressive rendering
  - ContractInput component with validation and loading state
affects: [03-03, 04-payments]

# Tech tracking
tech-stack:
  added: []
  patterns: [streamText + Output.object() for structured streaming, experimental_useObject for client-side partial object rendering, copy-not-import for cross-package code sharing]

key-files:
  created:
    - web-app/src/lib/schemas.ts
    - web-app/src/lib/prompts.ts
    - web-app/src/lib/risk-config.ts
    - web-app/src/app/api/analyze/route.ts
    - web-app/src/app/analyze/page.tsx
    - web-app/src/components/analysis/contract-input.tsx
  modified: []

key-decisions:
  - "Copied prompt/schema from MCP server rather than cross-package imports per research recommendation"
  - "Used Zod v4 syntax (z.infer type-only) compatible with web-app dependency"
  - "Used toTextStreamResponse() not toUIMessageStreamResponse() for useObject compatibility"

patterns-established:
  - "Shared schema pattern: single contractAnalysisSchema used by both Route Handler and useObject hook"
  - "Optional chaining pattern: all object.field accesses use ?. for streaming partial objects"

requirements-completed: [WEB-03, WEB-04, WEB-08]

# Metrics
duration: 4min
completed: 2026-03-22
---

# Phase 3 Plan 02: Analysis Page + Streaming API Summary

**Streaming contract analysis pipeline with Claude via AI SDK -- Zod schema, system prompt, Route Handler with Output.object(), and useObject client hook**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-22T13:15:34Z
- **Completed:** 2026-03-22T13:19:14Z
- **Tasks:** 2
- **Files created:** 6

## Accomplishments
- Shared Zod schema matching MCP server's ContractAnalysis interface, used by both server and client
- Full India-specific system prompt with 7-step analysis workflow adapted for web app
- Streaming API route using streamText + Output.object() with 50-char minimum validation
- Analysis page with side-by-side layout, progressive streaming results via useObject

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared lib files** - `90a2e52` (feat)
2. **Task 2: Build API route and analysis page** - `debf6b1` (feat)

## Files Created/Modified
- `web-app/src/lib/schemas.ts` - Zod schema for ContractAnalysis (shared server/client)
- `web-app/src/lib/prompts.ts` - System prompt and user message builder (copied from MCP server)
- `web-app/src/lib/risk-config.ts` - Risk level color/badge/icon configuration map
- `web-app/src/app/api/analyze/route.ts` - POST Route Handler with streaming Claude analysis
- `web-app/src/app/analyze/page.tsx` - Analysis page with useObject hook and minimal results
- `web-app/src/components/analysis/contract-input.tsx` - Textarea with validation and loading state

## Decisions Made
- Copied prompt/schema code from MCP server rather than cross-package imports (per research recommendation for monorepo clarity)
- Used `toTextStreamResponse()` (not `toUIMessageStreamResponse()`) since useObject requires text stream, not UI message stream
- Adapted OUTPUT FORMAT instruction from "call the contract_analysis_result tool" to "return a JSON object" for Output.object() compatibility

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required. ANTHROPIC_API_KEY should already be in web-app/.env.local from Phase 2.

## Next Phase Readiness
- Streaming pipeline end-to-end complete, ready for Plan 03-03 to build polished results UI
- ContractInput, schema, and risk-config are all importable by the results components
- Results panel in page.tsx is intentionally minimal -- Plan 03-03 replaces with ClauseCard, RiskSummary, Disclaimer

## Self-Check: PASSED

All 6 files verified present. Both task commits (90a2e52, debf6b1) verified in git log.

---
*Phase: 03-web-app-core*
*Completed: 2026-03-22*
