# ClauseGuard

## What This Is

ClauseGuard is a contract and legal clause analyzer that helps Indian freelancers, founders, and everyday people understand contracts without needing a lawyer. It comes in three forms: a free Claude Code SKILL.md for Claude users, a freemium web app for the general public, and an MCP server for developers. Users paste any contract, clause, terms of service, or legal notice and get a plain-English breakdown with risk flags and safer alternatives.

## Core Value

Anyone can understand what a contract actually says and spot the clauses that could hurt them — without legal jargon, without ₹5000/hour fees.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Claude Code SKILL.md that analyzes pasted contracts directly (free, uses user's own Claude)
- [ ] MCP server with `analyze_contract(text)` tool for Claude Code developers
- [ ] Next.js freemium web app where public users paste contracts for analysis
- [ ] Shared analysis engine: document type identification, clause-by-clause risk flagging (🔴/🟡/🟢), plain English explanations, safer alternative wording, "consult a lawyer" flags
- [ ] India-specific legal analysis: jurisdiction checks, INR currency, FEMA implications, Indian Contract Act considerations
- [ ] Freemium model: first N analyses free, then paid
- [ ] Structured output: JSON from MCP, markdown from SKILL, rich UI from web app
- [ ] README with one-line install commands for MCP and SKILL

### Out of Scope

- Document storage or history — stateless, per-request analysis
- User accounts for SKILL/MCP — web app only
- Legal advice — always frame as explanation, never recommendation
- Multi-language contract support — English only for v1
- PDF/image upload — text paste only for v1
- Mobile app — web-first

## Context

- Target audience is primarily Indian: freelancers signing foreign client contracts, founders reviewing vendor/SaaS agreements, anyone who gets a legal notice and panics
- The SKILL.md is the free distribution channel — users bring their own Claude account
- The web app is the monetization channel — owner provides ANTHROPIC_API_KEY and charges users
- MCP server targets developers who use Claude Code and want programmatic access
- Tone: expert but human, like a lawyer friend who explains things without billing you
- Must always include disclaimer: not legal advice, consult a real lawyer for important decisions

## Constraints

- **Tech stack**: Node.js, Next.js, Tailwind CSS, @anthropic-ai/sdk, @modelcontextprotocol/sdk
- **API costs**: Web app uses owner's API key (server-side), SKILL uses user's own Claude
- **Stateless**: No database needed for analysis — each request is independent
- **Legal**: Must never frame output as legal advice; always use "this clause means..." not "you should..."
- **India focus**: Default jurisdiction analysis, FEMA awareness, INR currency checks

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Two-channel distribution (free SKILL + paid web app) | Maximizes reach: Claude users get it free, general public pays | — Pending |
| Freemium model for web app | First N free analyses drive adoption, then convert to paid | — Pending |
| Next.js for web app | Full-stack React, server actions for API calls, good DX | — Pending |
| Stateless architecture | No database needed, simpler infra, lower costs | — Pending |
| India-first legal analysis | Core audience is Indian, differentiation from generic tools | — Pending |

---
*Last updated: 2026-03-22 after initial project definition*
