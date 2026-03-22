# Requirements: ClauseGuard

**Defined:** 2026-03-22
**Core Value:** Anyone can understand what a contract actually says and spot clauses that could hurt them

## v1 Requirements

### SKILL — Claude Code Skill

- [x] **SKILL-01**: SKILL.md with optimized frontmatter (name, description with trigger phrases, argument-hint)
- [x] **SKILL-02**: Analysis instructions covering document type identification, clause-by-clause risk flagging, plain English explanations, safer alternatives
- [x] **SKILL-03**: India-specific analysis rules: Section 27 non-compete, Section 28 legal proceedings, Section 25 consideration, jurisdiction flags, FEMA awareness
- [x] **SKILL-04**: Risk classification system with 🔴 High / 🟡 Medium / 🟢 Low indicators and clear action guidance
- [x] **SKILL-05**: Supporting reference files for clause patterns and Indian law context
- [x] **SKILL-06**: Legal disclaimer on every output ("not legal advice, consult a qualified advocate")
- [x] **SKILL-07**: "Consult a lawyer" escalation flags for high-severity issues

### HARDEN — Skill Hardening (Phase 1.1 INSERTED)

- [x] **HARDEN-01**: Expand clause-patterns.md to 50+ risky patterns with real-world examples covering payment traps, IP grabs, liability bombs, scope creep language, termination tricks, and non-compete overreach
- [ ] **HARDEN-02**: Expand india-law.md to 20+ legal provisions with real case citations (Delhi HC, Supreme Court), specific section numbers, and practical implications
- [ ] **HARDEN-03**: Create 10+ sample contract test fixtures (freelance, NDA, ToS, employment, SaaS) with known red/yellow/green clauses embedded
- [ ] **HARDEN-04**: Automated test script that runs the skill against each sample contract and validates expected risk flags appear in output
- [ ] **HARDEN-05**: Dockerfile + docker-compose.yml that builds a validation environment, runs all test contracts, and reports pass/fail
- [x] **HARDEN-06**: Add edge case patterns: multi-clause interactions, buried clauses in boilerplate, misleading headings, compound sentences hiding risk

### MCP — MCP Server

- [ ] **MCP-01**: Node.js MCP server with stdio transport using @modelcontextprotocol/sdk
- [ ] **MCP-02**: `analyze_contract` tool with Zod input schema (contract_text, analysis_type, party_perspective)
- [ ] **MCP-03**: Claude API integration via @anthropic-ai/sdk with structured JSON output (tool_use pattern)
- [ ] **MCP-04**: Output schema: documentType, riskScore, clauses[{text, risk, explanation, suggestion}], missingClauses, disclaimer
- [ ] **MCP-05**: India-specific analysis rules encoded in system prompt
- [ ] **MCP-06**: Error handling: domain errors (isError) for business logic, McpError for protocol failures
- [ ] **MCP-07**: TypeScript build with ESM, shebang, bin field — installable via `npx -y clauseguard-mcp`
- [ ] **MCP-08**: README with install command and Claude Desktop config example

### WEB — Web Application

- [ ] **WEB-01**: Next.js App Router project with Tailwind CSS and shadcn/ui components
- [ ] **WEB-02**: Landing page with hero, how-it-works, pricing, FAQ sections (SSR for SEO)
- [ ] **WEB-03**: Analysis page with contract text input (textarea) and results panel (side-by-side desktop, stacked mobile)
- [ ] **WEB-04**: Streaming AI response via Vercel AI SDK Route Handler calling Claude API
- [ ] **WEB-05**: Clause-by-clause results display with color-coded risk cards (red/yellow/green border-left)
- [ ] **WEB-06**: Risk summary dashboard (counts per risk level) above clause results
- [ ] **WEB-07**: Progressive streaming UX: skeleton loaders, fade-in clause cards, real-time summary updates
- [ ] **WEB-08**: India-specific analysis rules in system prompt (same as MCP/SKILL)
- [ ] **WEB-09**: Legal disclaimer displayed on every analysis output
- [ ] **WEB-10**: Mobile-responsive layout, professional trust-building design (muted blues, generous spacing)

### FREEM — Freemium Layer

- [ ] **FREEM-01**: Upstash Redis rate limiting (3 free analyses per user)
- [ ] **FREEM-02**: Browser fingerprinting (FingerprintJS) + IP for user identification without accounts
- [ ] **FREEM-03**: localStorage usage counter for instant UI feedback
- [ ] **FREEM-04**: 429 response with upgrade prompt when limit reached
- [ ] **FREEM-05**: Razorpay payment integration (create-order, verify, status API routes)
- [ ] **FREEM-06**: Payment verification + quota unlock in Redis
- [ ] **FREEM-07**: Usage counter component ("2 of 3 free analyses remaining")
- [ ] **FREEM-08**: Upgrade prompt modal when limit reached

### ANALYSIS — Core Analysis Engine

- [ ] **ANALYSIS-01**: Document type identification (freelance agreement, NDA, terms of service, vendor, SaaS, employment, legal notice)
- [ ] **ANALYSIS-02**: 6 Tier 1 clause categories: payment terms, IP ownership, termination, liability/indemnification, scope of work, non-compete
- [ ] **ANALYSIS-03**: Three-tier risk classification with consistent criteria per category
- [ ] **ANALYSIS-04**: Plain English explanations for every flagged clause (no legal jargon)
- [ ] **ANALYSIS-05**: Safer alternative wording suggestions framed as "standard market language"
- [ ] **ANALYSIS-06**: Missing clause detection against per-document-type checklists
- [ ] **ANALYSIS-07**: Overall document risk score based on clause-level aggregation
- [ ] **ANALYSIS-08**: India-specific rules: S.27 non-compete, S.28 legal proceedings, S.25 consideration, S.73-74 penalties, FEMA payment channels/currency/timeline, jurisdiction flags
- [ ] **ANALYSIS-09**: "Consult a lawyer" escalation for high-severity/complex issues
- [ ] **ANALYSIS-10**: Framing rules: always "this clause means..." never "you should..."

## v2 Requirements

### Enhanced Analysis

- **ENHANCE-01**: Tier 2 clause categories: confidentiality/NDA, jurisdiction/governing law, dispute resolution, force majeure
- **ENHANCE-02**: Tier 3 clause categories: non-solicitation, data protection, insurance, assignment, warranties
- **ENHANCE-03**: Additional document types: vendor/service agreements, SaaS agreements, employment contracts
- **ENHANCE-04**: Legal notice "panic mode" with deadline detection, required actions, consequences
- **ENHANCE-05**: India Risk Score composite metric with weighted rules
- **ENHANCE-06**: GST export compliance awareness (LUT, zero-rated, registration thresholds)
- **ENHANCE-07**: Negotiation talking points per flagged clause

### Platform

- **PLAT-01**: PDF/DOCX file upload with text extraction
- **PLAT-02**: User accounts with saved analysis history
- **PLAT-03**: Subscription plans (monthly/annual) in addition to one-time purchases
- **PLAT-04**: DPDP Act privacy notice and consent mechanism (deadline: Nov 2026)
- **PLAT-05**: Hindi legal terminology support

## Out of Scope

| Feature | Reason |
|---------|--------|
| Contract generation/drafting | Legal liability — generating contracts is practicing law |
| Document storage for SKILL/MCP | Stateless by design, unnecessary complexity |
| Dark mode | Legal professionals expect light interfaces, ships faster without |
| Multi-language contracts | English covers 95%+ of target audience |
| Contract version comparison/redlining | Separate product category (CLM tools) |
| User accounts for SKILL/MCP users | They use their own Claude, no tracking needed |
| Mobile native app | Web-first, responsive design covers mobile |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SKILL-01 | Phase 1 | Complete |
| SKILL-02 | Phase 1 | Complete |
| SKILL-03 | Phase 1 | Complete |
| SKILL-04 | Phase 1 | Complete |
| SKILL-05 | Phase 1 | Complete |
| SKILL-06 | Phase 1 | Complete |
| SKILL-07 | Phase 1 | Complete |
| HARDEN-01 | Phase 1.1 | Complete |
| HARDEN-02 | Phase 1.1 | Pending |
| HARDEN-03 | Phase 1.1 | Pending |
| HARDEN-04 | Phase 1.1 | Pending |
| HARDEN-05 | Phase 1.1 | Pending |
| HARDEN-06 | Phase 1.1 | Complete |
| MCP-01 | Phase 2 | Pending |
| MCP-02 | Phase 2 | Pending |
| MCP-03 | Phase 2 | Pending |
| MCP-04 | Phase 2 | Pending |
| MCP-05 | Phase 2 | Pending |
| MCP-06 | Phase 2 | Pending |
| MCP-07 | Phase 2 | Pending |
| MCP-08 | Phase 2 | Pending |
| ANALYSIS-01 | Phase 2 | Pending |
| ANALYSIS-02 | Phase 2 | Pending |
| ANALYSIS-03 | Phase 2 | Pending |
| ANALYSIS-04 | Phase 2 | Pending |
| ANALYSIS-05 | Phase 2 | Pending |
| ANALYSIS-06 | Phase 2 | Pending |
| ANALYSIS-07 | Phase 2 | Pending |
| ANALYSIS-08 | Phase 2 | Pending |
| ANALYSIS-09 | Phase 2 | Pending |
| ANALYSIS-10 | Phase 2 | Pending |
| WEB-01 | Phase 3 | Pending |
| WEB-02 | Phase 3 | Pending |
| WEB-03 | Phase 3 | Pending |
| WEB-04 | Phase 3 | Pending |
| WEB-05 | Phase 3 | Pending |
| WEB-06 | Phase 3 | Pending |
| WEB-07 | Phase 3 | Pending |
| WEB-08 | Phase 3 | Pending |
| WEB-09 | Phase 3 | Pending |
| WEB-10 | Phase 3 | Pending |
| FREEM-01 | Phase 4 | Pending |
| FREEM-02 | Phase 4 | Pending |
| FREEM-03 | Phase 4 | Pending |
| FREEM-04 | Phase 4 | Pending |
| FREEM-05 | Phase 4 | Pending |
| FREEM-06 | Phase 4 | Pending |
| FREEM-07 | Phase 4 | Pending |
| FREEM-08 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 49 total
- Mapped to phases: 49
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-03-22 after Phase 1.1 insertion*
