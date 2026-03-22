# Research Summary

**Project:** ClauseGuard
**Date:** 2026-03-22

## Key Findings Across All Domains

### Technology
- MCP SDK v1.x + Zod for tool registration, stdio transport
- SKILL.md uses YAML frontmatter with trigger-optimized descriptions
- Anthropic SDK tool_use + tool_choice pattern guarantees structured JSON output
- npx publishing requires shebang, bin field, ESM-only build

### Features
- 6 critical clause categories for launch: Payment, IP, Termination, Liability, Scope, Non-compete
- 3 document types cover 80%+ audience: Freelance agreements, NDAs, Terms of Service
- Three-tier risk classification (red/yellow/green) maps to user actions
- No India-focused competitor exists — clear market gap

### Architecture
- Vercel AI SDK v6 + Route Handlers for streaming
- Upstash Redis for rate limiting + payment tracking (no database needed)
- Razorpay hosted checkout for Indian payments (UPI, cards)
- FingerprintJS + IP + localStorage for "first 3 free" without accounts
- shadcn/ui component library, no dark mode for v1

### Indian Legal Concerns
- Section 27: Post-termination non-competes void in India (highest-value flag)
- FEMA: 15-month repatriation, authorized banking channels only
- Section 28: Restraint of legal proceedings void
- Legal disclaimers mandatory on every output (Advocates Act)
- DPDP Act compliance phased through May 2027, stateless architecture helps

## Architecture Decision: Shared Code Strategy
Extract analysis logic (prompts, types, schemas) into shared core:
- SKILL.md: standalone markdown with analysis instructions
- MCP Server: wraps core with tool registration
- Web App: wraps core with Next.js UI + streaming

## Critical Path
1. SKILL.md (zero infra, ships immediately)
2. MCP Server (Node.js package, npm publishable)
3. Web App core (Next.js + streaming analysis)
4. Freemium layer (rate limiting + payments)
