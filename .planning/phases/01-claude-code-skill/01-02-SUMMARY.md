---
phase: 01-claude-code-skill
plan: 02
subsystem: skill
tags: [contract-analysis, india-law, clause-patterns, fema, non-compete, risk-classification]

# Dependency graph
requires:
  - phase: 01-claude-code-skill (plan 01)
    provides: SKILL.md main instructions that reference these files
provides:
  - Risky clause patterns per category (6 Tier 1 categories) with HIGH/MEDIUM/LOW triggers
  - Missing clause checklists for 3 Phase 1 document types
  - Safer alternative wording templates for all 6 categories
  - Indian Contract Act rule tables (S.27, S.28, S.25, S.73-74, S.29)
  - Non-compete nuance analysis with 5-scenario distinction
  - FEMA payment compliance rules
  - Jurisdiction preference hierarchy
  - India risk modifier override rules
affects: [02-mcp-server, skill-testing]

# Tech tracking
tech-stack:
  added: []
  patterns: [structured-table-reference-files, if-then-detection-logic, progressive-disclosure]

key-files:
  created:
    - .claude/skills/clauseguard/clause-patterns.md
    - .claude/skills/clauseguard/india-law.md
  modified: []

key-decisions:
  - "Structured all rules as tables with Detection Keywords column for consistent pattern matching across Claude models"
  - "Included pseudocode detection logic blocks in india-law.md for Phase 2 MCP system prompt extraction"
  - "Used 5-scenario nuance table for S.27 non-compete to prevent false positives on during-engagement and confidentiality clauses"

patterns-established:
  - "Reference file format: structured tables with Risk/Trigger/Detection columns for clause analysis"
  - "India law encoding: IF/THEN pseudocode blocks for rule application logic"
  - "Risk modifier pattern: override rules that apply on top of base classification"

requirements-completed: [SKILL-03, SKILL-05]

# Metrics
duration: 4min
completed: 2026-03-22
---

# Phase 1 Plan 2: Reference Files Summary

**Clause risk patterns for 6 categories with India-specific legal rules (S.27 non-compete, FEMA, jurisdiction) encoded as structured lookup tables**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-22T01:43:08Z
- **Completed:** 2026-03-22T01:47:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created clause-patterns.md with HIGH/MEDIUM/LOW risk triggers for all 6 Tier 1 clause categories (Payment, IP, Termination, Liability, Scope, Non-Compete)
- Created missing clause checklists for all 3 Phase 1 document types (Freelance Agreement, NDA, Terms of Service) with CRITICAL/HIGH/MEDIUM/LOW severity
- Created safer alternative templates using "standard market language" framing for all 6 categories
- Created india-law.md with Indian Contract Act key sections (S.27, S.28, S.25, S.73-74, S.29) as rule tables
- Built 5-scenario non-compete nuance table distinguishing post-termination (void), during-engagement (enforceable), non-solicitation (uncertain), confidentiality (enforceable), and sale-of-business (exception)
- Encoded 4 FEMA rules with detection patterns covering payment channels, currency, 15-month timeline, and purpose codes
- Created 4-tier jurisdiction preference hierarchy from dangerous (exclusive foreign courts) to optimal (Indian arbitration)
- Added 8 India risk modifier override rules as quick reference

## Task Commits

Each task was committed atomically:

1. **Task 1: Create clause-patterns.md** - `eb7eb8c` (feat)
2. **Task 2: Create india-law.md** - `e3228bd` (feat)

## Files Created/Modified
- `.claude/skills/clauseguard/clause-patterns.md` - Risk trigger patterns, missing clause checklists, safer alternative templates
- `.claude/skills/clauseguard/india-law.md` - Indian Contract Act rules, FEMA compliance, jurisdiction hierarchy, risk modifiers

## Decisions Made
- Structured all rules as tables with Detection Keywords column for consistent pattern matching across Claude models (Haiku through Opus)
- Included pseudocode detection logic blocks in india-law.md to make rules extractable for Phase 2 MCP system prompt encoding
- Used 5-scenario nuance table for S.27 non-compete to prevent false positives on during-engagement and confidentiality clauses
- Kept both files under their target line counts (clause-patterns: ~180 lines, india-law: ~150 lines)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Both reference files are complete and ready for SKILL.md to reference
- Content is structured for Phase 2 MCP system prompt extraction (IF/THEN logic blocks)
- India-specific rules are the key differentiator -- S.27 non-compete analysis with 5 scenarios, FEMA compliance, and jurisdiction hierarchy

---
*Phase: 01-claude-code-skill*
*Completed: 2026-03-22*
