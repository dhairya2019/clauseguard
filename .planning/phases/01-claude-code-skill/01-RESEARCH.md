# Phase 1 Research: Claude Code SKILL

**Phase:** 01 - Claude Code SKILL
**Goal:** Ship a complete Claude Code skill that analyzes contracts with India-specific legal awareness -- zero infrastructure, immediate distribution
**Requirements:** SKILL-01, SKILL-02, SKILL-03, SKILL-04, SKILL-05, SKILL-06, SKILL-07
**Researched:** 2026-03-22

---

## 1. What This Phase Delivers

A set of markdown files that live at `~/.claude/skills/clauseguard/` (or in the project repo at `.claude/skills/clauseguard/`). When a user types `/clauseguard` in Claude Code and pastes a contract, Claude reads the SKILL.md instructions and performs a structured contract analysis with India-specific legal awareness. No server, no API key, no infrastructure -- Claude uses its own knowledge, guided by the skill instructions.

### Deliverables

| File | Purpose | Requirement |
|------|---------|-------------|
| `SKILL.md` | Main instructions: frontmatter, analysis workflow, output format, risk system, disclaimer | SKILL-01, SKILL-02, SKILL-04, SKILL-06 |
| `clause-patterns.md` | Reference: risky clause patterns per category (payment, IP, termination, liability, scope, non-compete) | SKILL-05 |
| `india-law.md` | Reference: Indian Contract Act S.27/S.28/S.25, FEMA rules, jurisdiction flags | SKILL-03, SKILL-05 |

---

## 2. SKILL.md Mechanics (How Claude Code Skills Work)

### File Location and Discovery

Claude Code discovers skills at:
- `~/.claude/skills/<name>/SKILL.md` -- user-global skills
- `.claude/skills/<name>/SKILL.md` -- project-scoped skills

For distribution, users clone or copy the skill directory. No install command needed.

### Frontmatter Fields That Matter

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
```

Key design decisions for frontmatter:

| Field | Value | Rationale |
|-------|-------|-----------|
| `name` | `clauseguard` | Lowercase, hyphen-free, max 64 chars |
| `description` | Long, keyword-rich, third-person | The description is the primary trigger mechanism. Claude undertriggers by default; explicit "Use when..." language and keyword variants improve activation from ~20% to 50-90% |
| `argument-hint` | `[file-path-or-paste-text]` | Tells user they can pass a file path or paste text after `/clauseguard` |
| `allowed-tools` | `Read, Grep, Glob` | Lets Claude read contract files from disk without asking permission |
| `user-invocable` | `true` (default) | Shows in `/` menu |
| `disable-model-invocation` | `false` (default) | Allows Claude to auto-trigger when user discusses contracts |

### $ARGUMENTS Variable

Whatever the user types after `/clauseguard` gets injected as `$ARGUMENTS`. The skill must handle two cases:
1. `$ARGUMENTS` is a file path -- use `Read` tool to load the file
2. `$ARGUMENTS` is pasted contract text -- use directly

### Supporting File References

SKILL.md can reference sibling files: `[clause-patterns.md](clause-patterns.md)`. Claude reads these on demand (progressive disclosure). Rules:
- Keep SKILL.md under 500 lines
- Only one level of file references (SKILL.md -> reference files, never deeper)
- Claude reads SKILL.md first, supporting files only when the analysis needs them

---

## 3. Analysis Workflow Design

The SKILL.md body must define a step-by-step analysis workflow. Based on the feature research, the correct flow is:

```
Step 1: Input handling ($ARGUMENTS -- file or text)
Step 2: Document type identification (freelance, NDA, ToS, etc.)
Step 3: Clause-by-clause extraction and categorization
Step 4: Risk classification per clause (RED/YELLOW/GREEN)
Step 5: India-specific rule checks (S.27, S.28, S.25, FEMA, jurisdiction)
Step 6: Missing clause detection (against per-document-type checklist)
Step 7: Overall risk assessment
Step 8: Output assembly (structured markdown with disclaimer)
```

**Critical insight from feature research:** Everything flows from document type identification. Get this wrong and downstream analysis degrades. Step 2 must be explicit and prioritized.

### Document Types to Support (Phase 1)

| Document Type | Target User | Key Focus Areas |
|---------------|-------------|-----------------|
| Freelance / Independent Contractor Agreement | Freelancers | Payment, IP, scope, termination, liability, non-compete |
| Non-Disclosure Agreement (NDA) | Freelancers, founders | Confidential info definition, duration, scope, penalties |
| Terms of Service / Terms of Use | General public, founders | Liability limits, arbitration, data usage, auto-renewal |

### Clause Categories (Tier 1 -- Must Have at Launch)

| Category | Why Critical | HIGH Risk Triggers |
|----------|-------------|-------------------|
| Payment Terms | Cash flow survival for freelancers | Payment-on-completion only, Net 90+, no late penalties, vague acceptance criteria |
| IP Ownership | Unknowing IP assignment including pre-existing work | "All work product" (too broad), pre-existing IP assignment, no portfolio carve-out |
| Termination | Unilateral termination without payment for completed work | At-will with no payment for work done, no cure period, no kill fee |
| Liability & Indemnification | Unlimited liability can bankrupt a freelancer | No cap, cap exceeding contract value, one-sided indemnification |
| Scope of Work | Vague scope causes scope creep and disputes | No defined deliverables, no change order process, "other duties as assigned" |
| Non-Compete | Post-termination non-competes prevent working in field | Any post-termination restriction (void under S.27 in India) |

---

## 4. Risk Classification System

### Three-Tier Model

| Level | Indicator | Meaning | User Action |
|-------|-----------|---------|-------------|
| HIGH | Red circle | Serious harm potential. One-sided, unusual, or potentially unenforceable. | Get a lawyer. Negotiate hard or walk away. |
| MEDIUM | Yellow circle | Negotiable and somewhat unfavorable. Common but improvable. | Negotiate for better terms. Acceptable if other terms compensate. |
| LOW | Green circle | Standard, balanced, or favorable. Industry-normal. | Acceptable. No action needed. |

### Classification Logic (for system prompt)

```
For each clause:
1. Identify clause category (from Tier 1 taxonomy)
2. Check HIGH-risk trigger patterns -> if match, RED
3. Check MEDIUM-risk patterns -> if match, YELLOW
4. Default to LOW/GREEN
5. Apply India-specific modifiers:
   - Non-compete post-termination -> always RED (S.27)
   - Foreign exclusive jurisdiction, no arbitration -> RED
   - FEMA non-compliance risk -> add warning
   - IP assignment without consideration -> RED (S.25)
   - Restriction on legal proceedings -> RED (S.28)
```

### Overall Document Risk

```
RED document:   2+ HIGH-risk clauses, OR 1 HIGH in payment/liability/IP
YELLOW document: 1 HIGH (non-critical) OR 3+ MEDIUM
GREEN document:  No HIGH, fewer than 3 MEDIUM
```

---

## 5. India-Specific Rules to Encode

These are the rules that differentiate ClauseGuard from generic contract tools. They must be encoded in the india-law.md reference file.

### Indian Contract Act 1872

| Section | Rule | Flag Behavior |
|---------|------|---------------|
| S.27 | Post-termination non-compete is void | RED -- "Void under S.27. Delhi HC reaffirmed in 2025 (Varun Tyagi v. Daffodil Software). Unenforceable in India." |
| S.28 | Restriction on legal proceedings is void | RED -- "Void under S.28. Clauses waiving right to sue or forcing exclusive foreign jurisdiction with no Indian option." |
| S.25 | Agreement without consideration is void | RED -- "IP assignment without stated consideration may be void under S.25." |
| S.73-74 | Penalties must be reasonable | YELLOW -- "Disproportionate penalties (>2x contract value) can be reduced by Indian courts under S.73-74." |
| S.29 | Void for uncertainty | YELLOW -- "Vague scope may render obligations unenforceable under S.29." |

#### Non-Compete Nuances (S.27)

The skill must distinguish these scenarios:

| Scenario | Enforceability | Flag |
|----------|---------------|------|
| Post-termination non-compete | Void | RED |
| During-engagement non-compete | Generally enforceable | YELLOW (verify scope) |
| Non-solicitation (specific clients) | Uncertain, partially enforceable | YELLOW |
| Confidentiality / NDA obligations | Enforceable (not restraint of trade) | GREEN |
| Sale-of-business non-compete | Enforceable (only S.27 exception) | GREEN (verify reasonableness) |

### FEMA (Foreign Exchange Management Act)

Relevant when Indian party works with foreign clients.

| Rule | Detection Pattern | Flag |
|------|-------------------|------|
| Payment must flow through AD Category-I banks | Payment via crypto, informal channels | RED |
| Freely convertible currency required | Non-standard currency | YELLOW |
| 15-month repatriation deadline | Payment terms >12 months | YELLOW |
| Purpose codes mandatory | No clear service description | INFO |

### Jurisdiction Flags

| Pattern | Flag |
|---------|------|
| Foreign governing law + exclusive foreign courts + no arbitration | RED -- "No practical recourse for Indian party" |
| No jurisdiction or arbitration clause at all | YELLOW -- "Creates uncertainty. Defaults to CPC S.16-20." |
| Foreign arbitration seat (Singapore, London, etc.) | YELLOW -- "Expensive for Indian party. Negotiate Indian seat." |
| Indian governing law + Indian arbitration seat | GREEN -- "Optimal for Indian party" |

---

## 6. Output Format Design

The SKILL output is markdown (rendered in Claude Code terminal). The format must be scannable and actionable.

### Structure

```
## Contract Summary
- Type: [identified type]
- Parties: [party A, party B]
- Key dates: [effective, termination, renewal]

## Risk Overview
| Risk Level | Count |
|------------|-------|
| RED High   | N     |
| YELLOW Med | N     |
| GREEN Low  | N     |
Overall: [RED/YELLOW/GREEN] -- [one-sentence summary]

## Clause Analysis

### [Clause N]: [Title]
- **Risk:** [emoji] [HIGH/MEDIUM/LOW]
- **What it says:** [plain English summary]
- **Why it matters:** [explanation of impact]
- **India note:** [if applicable -- S.27, FEMA, jurisdiction]
- **Safer alternative:** [suggested rewording]

[Repeat for each clause]

## Missing Protections
- [Missing clause] -- [why it matters]

## Recommended Actions
1. [Prioritized action items]
2. [...]

---
> This analysis is for informational purposes only and does not
> constitute legal advice. ClauseGuard is not a law firm. For important
> contracts or high-value agreements, consult a qualified advocate
> enrolled with the Bar Council of India.
```

### Framing Rules (Critical for Legal Compliance)

The SKILL.md must instruct Claude to follow these rules:

**DO say:**
- "This clause means..."
- "Under Indian law, this type of clause is typically..."
- "Courts have generally held that..."
- "Consider discussing this clause with a lawyer."
- "Standard market language would be..."

**DO NOT say:**
- "You should not sign this."
- "This clause is illegal." (use "void under S.27" instead)
- "I recommend..."
- "You need to..."
- "Your legal position is..."

---

## 7. Disclaimer Requirements

### Every Output Must Include (SKILL-06)

A footer disclaimer that appears at the end of every analysis. Non-negotiable.

### Escalation Flags (SKILL-07)

For HIGH-severity issues, add inline escalation:

```
> **Consult a lawyer:** This clause involves [jurisdiction-specific
> enforceability / significant financial exposure / regulatory
> compliance]. A qualified advocate can advise on your specific
> situation.
```

Triggers for escalation:
- Any RED clause involving IP assignment of significant value
- Jurisdiction issues that affect enforceability of the entire contract
- FEMA compliance concerns with penalty risk
- Penalty clauses with disproportionate amounts
- Waiver of fundamental legal rights (S.28)

---

## 8. Key Design Decisions for Planning

### Decision 1: SKILL.md Size Budget

The SKILL.md body must stay under 500 lines. The analysis workflow, output format, risk system, and framing rules must fit. Detailed clause patterns and India-specific law rules go into supporting files.

**Estimated line allocation:**
- Frontmatter: ~15 lines
- Input handling: ~20 lines
- Document type identification: ~30 lines
- Analysis workflow: ~60 lines
- Risk classification rules: ~50 lines
- Output format template: ~60 lines
- Framing rules (do/don't): ~30 lines
- Disclaimer: ~15 lines
- References to supporting files: ~10 lines
- **Total: ~290 lines** (leaves headroom)

### Decision 2: Supporting File Scope

**clause-patterns.md** should contain:
- Per-category (6 Tier 1 categories) HIGH/MEDIUM/LOW trigger patterns
- Per-document-type (3 Phase 1 types) missing clause checklists
- Safer alternative wording templates per category
- Estimated size: 200-300 lines

**india-law.md** should contain:
- S.27 non-compete rules with nuance table
- S.28 legal proceedings restrictions
- S.25 consideration requirements
- S.73-74 penalty reasonableness
- FEMA payment rules (4 rules)
- Jurisdiction preference hierarchy
- Estimated size: 150-250 lines

### Decision 3: Emoji Risk Indicators

Use Unicode emoji for terminal compatibility:
- RED: Use text marker or bold formatting for HIGH risk
- YELLOW: Use text marker for MEDIUM risk
- GREEN: Use text marker for LOW risk

The requirements specify emoji indicators. Use these consistently in the output format template.

### Decision 4: $ARGUMENTS Handling Strategy

The skill must handle three input scenarios:
1. **File path**: `/clauseguard ./contracts/nda.txt` -- use Read tool
2. **Pasted text**: `/clauseguard` then paste in the next message -- use directly
3. **No input**: `/clauseguard` with nothing -- prompt user to paste or provide file path

### Decision 5: Model Compatibility

The skill should work across Claude models (Haiku through Opus). Per best practices, lower-capability models need more explicit guidance. The SKILL.md instructions should be precise enough for Haiku-level models:
- Explicit step numbering
- Concrete examples in clause-patterns.md
- Structured output template (not just "analyze and present")

---

## 9. Risk and Uncertainty Assessment

### What We Know Well (HIGH confidence)

| Topic | Confidence | Source |
|-------|-----------|--------|
| SKILL.md frontmatter format | HIGH | Official Claude Code docs |
| $ARGUMENTS variable behavior | HIGH | Official Claude Code docs |
| Supporting file reference pattern | HIGH | Official Claude Code docs |
| Indian Contract Act S.27 (non-compete void) | HIGH | Statute + 2025 Delhi HC judgment |
| Indian Contract Act S.28 (legal proceedings) | HIGH | Well-established statute |
| FEMA payment channel rules | HIGH | RBI regulations, multiple sources |
| Three-tier risk classification | HIGH | Industry standard pattern |

### What Has Moderate Uncertainty (MEDIUM confidence)

| Topic | Uncertainty | Mitigation |
|-------|------------|------------|
| Description optimization for trigger rate | Varies by model version | Test with multiple trigger phrases, iterate |
| Clause pattern completeness | May miss edge cases | Start with well-documented patterns, expand based on user feedback |
| Penalty/damages thresholds (S.73-74) | "Reasonable" is subjective | Use 2x contract value as heuristic, flag for lawyer review |
| FEMA currency list completeness | RBI updates periodically | Stick to major freely convertible currencies, flag others as "verify" |

### What We Do Not Know

| Gap | Impact | Action |
|-----|--------|--------|
| Actual trigger rate for the skill description | Affects usability | Test after shipping, iterate on description wording |
| How well Claude identifies Indian-law-specific issues without examples | Affects quality of India flags | Include concrete examples in india-law.md |
| Whether 500-line budget is tight for the analysis workflow | Affects maintainability | Draft first, measure, move content to supporting files if needed |
| User distribution path (how users discover and install the skill) | Affects adoption | Out of scope for Phase 1 build, but README should include clear install instructions |

---

## 10. Requirement Traceability

| Requirement | What It Asks | Where It Gets Addressed | Key Considerations |
|-------------|-------------|------------------------|-------------------|
| **SKILL-01** | SKILL.md with optimized frontmatter (name, description, argument-hint) | SKILL.md frontmatter | Description must include trigger phrases for contract/clause/NDA/legal review keywords. Third-person voice. |
| **SKILL-02** | Analysis instructions: doc type ID, clause-by-clause flagging, plain English, safer alternatives | SKILL.md body (Steps 2-6) + clause-patterns.md | The step-by-step workflow is the core of the skill. Must be explicit enough for Haiku. |
| **SKILL-03** | India-specific rules: S.27, S.28, S.25, jurisdiction, FEMA | india-law.md + SKILL.md Step 5 | SKILL.md references india-law.md. Step 5 tells Claude when to consult it. |
| **SKILL-04** | Risk classification with emoji indicators + action guidance | SKILL.md risk system + output format | Three-tier RED/YELLOW/GREEN. Each level maps to a user action (walk away / negotiate / accept). |
| **SKILL-05** | Supporting reference files for patterns and Indian law | clause-patterns.md + india-law.md | Two files. One level of reference from SKILL.md. |
| **SKILL-06** | Legal disclaimer on every output | SKILL.md output format template | Footer disclaimer. Non-negotiable. "Not legal advice, consult a qualified advocate." |
| **SKILL-07** | "Consult a lawyer" escalation for high-severity | SKILL.md escalation rules | Inline callout before RED clauses involving enforceability, significant financial exposure, or regulatory compliance. |

---

## 11. Dependencies and Interfaces

### Phase 1 Has Zero External Dependencies
- No API keys needed
- No server infrastructure
- No npm packages
- No build step
- Just markdown files

### What Phase 2 Reuses From Phase 1

Phase 2 (MCP Server) will encode the same analysis logic into a system prompt for the Claude API. The content from Phase 1's SKILL.md, clause-patterns.md, and india-law.md becomes the foundation for the MCP server's system prompt. Design Phase 1 content with this reuse in mind:
- Clause category taxonomy should be structured (not prose)
- Risk trigger patterns should be expressed as clear rules
- India-specific rules should be encodable (IF/THEN format in india-law.md)

---

## 12. Testing Strategy

Since this is a prompt-based skill with no code, testing means verifying output quality against sample inputs.

### Test Scenarios

| Scenario | Input | Expected Behavior |
|----------|-------|-------------------|
| Freelance agreement with non-compete | Contract with post-termination non-compete clause | RED flag citing S.27, suggests removal |
| NDA with reasonable terms | Standard mutual NDA, 2-year term, Indian jurisdiction | Mostly GREEN, perhaps YELLOW on specific clauses |
| ToS with arbitration waiver | Terms requiring waiver of right to sue | RED flag citing S.28 |
| Contract with no payment terms | Freelance agreement missing payment schedule | RED flag for missing clause |
| Foreign jurisdiction, no Indian option | Delaware exclusive jurisdiction, no arbitration | RED flag for jurisdiction |
| File path input | `/clauseguard ./test-contract.txt` | Reads file, analyzes content |
| Empty input | `/clauseguard` with no arguments | Prompts user to paste contract or provide file path |

### Quality Criteria

1. Document type correctly identified for all 3 Phase 1 types
2. All Tier 1 clause categories detected when present
3. India-specific flags fire correctly (S.27, S.28, jurisdiction, FEMA)
4. No output omits the disclaimer
5. Explanations use plain English (no unexplained legal jargon)
6. Safer alternatives are framed as "standard market language" not "legal advice"
7. Escalation flags appear for HIGH-severity issues

---

*Research completed: 2026-03-22*
*Ready for planning phase*
