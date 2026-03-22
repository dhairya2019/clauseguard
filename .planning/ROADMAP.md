# Roadmap: ClauseGuard

## Overview

ClauseGuard ships in 4 phases across the v1.0 milestone: first the free Claude Code SKILL (zero infra, immediate value), then the MCP server with structured analysis engine, then the public-facing web app with streaming UI, and finally the freemium monetization layer. Each phase builds on the previous — the analysis logic designed in Phase 1 powers all subsequent phases.

## Phases

- [ ] **Phase 1: Claude Code SKILL** - Free skill with India-specific contract analysis instructions
- [ ] **Phase 2: MCP Server + Analysis Engine** - npm-publishable MCP server with Claude API-powered structured analysis
- [ ] **Phase 3: Web App Core** - Next.js streaming analysis UI with landing page
- [ ] **Phase 4: Freemium Monetization** - Rate limiting, payments, and usage tracking

## Phase Details

### Phase 1: Claude Code SKILL
**Goal**: Ship a complete Claude Code skill that analyzes contracts with India-specific legal awareness — zero infrastructure, immediate distribution
**Depends on**: Nothing (first phase)
**Requirements**: SKILL-01, SKILL-02, SKILL-03, SKILL-04, SKILL-05, SKILL-06, SKILL-07
**Success Criteria** (what must be TRUE):
  1. User can invoke `/clauseguard` in Claude Code and paste a contract for analysis
  2. Analysis identifies document type, flags clauses with 🔴/🟡/🟢 risk levels, and explains each in plain English
  3. India-specific flags fire correctly: S.27 non-compete, jurisdiction warnings, FEMA awareness
  4. Every output includes "not legal advice" disclaimer
  5. Safer alternative wording is suggested for medium/high risk clauses
**Plans**: 2 plans

Plans:
- [ ] 01-01: SKILL.md core — frontmatter, analysis instructions, risk classification system, output format
- [ ] 01-02: Supporting reference files — clause-patterns.md (risky patterns per category), india-law.md (S.27, S.28, S.25, FEMA, jurisdiction rules)

### Phase 01.1: Harden Skill — Deep Contract Knowledge, Tests, Docker Validation (INSERTED)
**Goal**: Massively expand contract analysis knowledge (10x clause patterns, real-world contract examples, edge cases), add automated test suite against sample contracts, and create Docker setup for end-to-end validation
**Depends on**: Phase 1
**Requirements**: HARDEN-01, HARDEN-02, HARDEN-03, HARDEN-04, HARDEN-05, HARDEN-06
**Success Criteria** (what must be TRUE):
  1. clause-patterns.md contains 50+ risky clause patterns across all categories (up from ~18)
  2. india-law.md covers 20+ Indian legal provisions with real case citations
  3. Test suite with 10+ sample contracts (real-world style) passes automated validation
  4. Docker container runs the skill against sample contracts and produces analysis output
  5. Each sample contract type (freelance, NDA, ToS, employment, SaaS) has at least 2 test fixtures
  6. Analysis correctly identifies known red/yellow/green clauses in test contracts
**Plans**: 3 plans

Plans:
- [ ] 01.1-01: Expand clause-patterns.md to 50+ patterns across 12 categories + edge case detection patterns
- [ ] 01.1-02: Expand india-law.md to 20+ provisions with case citations across 6 legal areas
- [ ] 01.1-03: Create 12 test fixtures, test runner script, and Docker validation setup

### Phase 2: MCP Server + Analysis Engine
**Goal**: Build an npm-publishable MCP server that calls Claude API with a specialized system prompt and returns structured JSON analysis
**Depends on**: Phase 1
**Requirements**: MCP-01, MCP-02, MCP-03, MCP-04, MCP-05, MCP-06, MCP-07, MCP-08, ANALYSIS-01, ANALYSIS-02, ANALYSIS-03, ANALYSIS-04, ANALYSIS-05, ANALYSIS-06, ANALYSIS-07, ANALYSIS-08, ANALYSIS-09, ANALYSIS-10
**Success Criteria** (what must be TRUE):
  1. `npx -y clauseguard-mcp` starts the MCP server successfully
  2. `analyze_contract` tool accepts contract text and returns structured JSON with documentType, riskScore, clauses array, missingClauses, and disclaimer
  3. Each clause in output has: text, risk level, plain English explanation, and safer alternative suggestion
  4. India-specific rules (S.27, FEMA, jurisdiction) produce correct flags when tested against sample contracts
  5. MCP Inspector can invoke the tool and display results
  6. `claude mcp add clauseguard -- npx -y clauseguard-mcp` works for Claude Code users
**Plans**: 3 plans

Plans:
- [ ] 02-01: Project scaffold — package.json, tsconfig, TypeScript types, system prompts module
- [ ] 02-02: MCP server — tool registration, Claude API integration (tool_use structured output), error handling
- [ ] 02-03: Build pipeline + README — ESM build, shebang, bin field, install instructions, Claude Desktop config example

### Phase 3: Web App Core
**Goal**: Ship a Next.js web app where anyone can paste a contract and get streaming clause-by-clause analysis with a professional UI
**Depends on**: Phase 2 (reuses system prompts and analysis logic)
**Requirements**: WEB-01, WEB-02, WEB-03, WEB-04, WEB-05, WEB-06, WEB-07, WEB-08, WEB-09, WEB-10
**Success Criteria** (what must be TRUE):
  1. Landing page loads with hero, how-it-works, pricing, and FAQ sections
  2. User can paste contract text and click "Analyze" to get streaming results
  3. Clause cards appear progressively with color-coded risk indicators (red/yellow/green)
  4. Risk summary dashboard shows counts per risk level
  5. Layout is responsive — side-by-side on desktop, stacked on mobile
  6. Legal disclaimer appears on every analysis output
  7. Page loads under 3 seconds on 3G connection (lightweight, no heavy assets)
**Plans**: 3 plans

Plans:
- [ ] 03-01: Next.js scaffold + landing page — project setup, shadcn/ui, Tailwind, hero section, how-it-works, pricing, FAQ
- [ ] 03-02: Analysis page + streaming — contract input, API route with Vercel AI SDK, streaming Claude response, clause parsing
- [ ] 03-03: Results UI — clause cards, risk summary dashboard, skeleton loaders, disclaimer, responsive layout

### Phase 4: Freemium Monetization
**Goal**: Add usage tracking, rate limiting, and Razorpay payments so the web app generates revenue
**Depends on**: Phase 3
**Requirements**: FREEM-01, FREEM-02, FREEM-03, FREEM-04, FREEM-05, FREEM-06, FREEM-07, FREEM-08
**Success Criteria** (what must be TRUE):
  1. New users get 3 free analyses, tracked by IP + fingerprint in Upstash Redis
  2. Usage counter shows "X of 3 free analyses remaining" in the header
  3. After 3 free analyses, API returns 429 and upgrade modal appears
  4. User can pay via Razorpay (UPI, cards, net banking) and quota unlocks immediately
  5. Payment verification uses HMAC signature validation
  6. Paid users can analyze unlimited contracts (or N based on pricing tier)
**Plans**: 2 plans

Plans:
- [ ] 04-01: Rate limiting + fingerprinting — Upstash Redis setup, FingerprintJS integration, usage counter component, 429 handling
- [ ] 04-02: Razorpay payments — order creation, hosted checkout modal, payment verification, quota unlock, upgrade prompt UI

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Claude Code SKILL | 0/2 | Not started | - |
| 2. MCP Server + Analysis Engine | 0/3 | Not started | - |
| 3. Web App Core | 0/3 | Not started | - |
| 4. Freemium Monetization | 0/2 | Not started | - |
