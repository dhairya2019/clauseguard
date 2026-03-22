# Feature Landscape

**Domain:** Contract analysis and risk classification for Indian freelancers, founders, and general public
**Researched:** 2026-03-22

## Table Stakes

Features users expect from any contract analysis tool. Missing any of these makes the product feel incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Clause-by-clause breakdown | Every competitor does this (Compare-X, goHeather, Jenova). Users want granular analysis, not just a summary. | Medium | Core output unit. Each clause gets: category, risk level, explanation, suggestion. |
| Risk flagging with color coding | Industry standard is red/yellow/green heatmap. Users immediately understand traffic-light risk signals. | Medium | Three tiers: High (red), Medium (yellow), Low (green). Must be consistent and defensible. |
| Plain English explanations | The entire value proposition. "What does this clause actually mean?" is the question users come with. | Low | This is what LLMs excel at. The prompt engineering is straightforward. |
| Overall document risk score | Users want a quick "should I be worried?" signal before reading clause details. | Low | Aggregate from clause-level scores. Simple: count of red/yellow/green clauses + overall assessment. |
| Document type identification | Users often don't know what kind of contract they're looking at. Identifying type sets context for analysis. | Low | Classify into: freelance agreement, NDA, employment contract, vendor agreement, SaaS agreement, terms of service, legal notice, other. |
| Safer alternative suggestions | "What should this say instead?" is the natural follow-up to "this clause is risky." | Medium | Suggest balanced rewording. Must not cross into legal advice -- frame as "standard market language." |
| Missing clause detection | Gap analysis: what protections SHOULD be in this contract but aren't? | Medium | Compare against checklist per document type. Missing payment terms in freelance contract = red flag. |
| "Consult a lawyer" flags | For clauses too complex or consequential for AI analysis alone. Builds trust by knowing its limits. | Low | Trigger on: jurisdiction-specific enforceability, tax implications, regulatory compliance, very high financial exposure. |

## Clause Categories to Analyze

These are the contract clause types the system must recognize and assess, ordered by importance to the target audience.

### Tier 1: Critical for Freelancers and Founders (must have at launch)

| Category | Why Critical | Common Risky Patterns | India-Specific Notes |
|----------|-------------|----------------------|---------------------|
| **Payment Terms** | Cash flow is survival for freelancers. Payment traps are the #1 complaint. | Payment-on-completion only (no milestones), Net 90+ terms, no late payment penalties, vague deliverable acceptance criteria that let client delay payment indefinitely | FEMA requires realization within 15 months for foreign currency invoices. Flag contracts with no payment timeline. |
| **IP Ownership** | Freelancers unknowingly sign away all IP including pre-existing work and future derivatives. | "All work product" assignment (too broad), work-for-hire classification with no carve-outs, assignment of pre-existing IP, no license-back for portfolio use | Indian Copyright Act recognizes author as first owner. Work-for-hire requires explicit written agreement. Flag blanket IP grabs. |
| **Termination** | Unilateral termination clauses let clients fire without paying for completed work. | Client can terminate "at will" with no payment for work done, no cure period, termination for convenience with no kill fee | Flag contracts where termination = losing payment for delivered work. |
| **Liability and Indemnification** | Unlimited liability can bankrupt a freelancer. One-sided indemnification shifts all risk to the weaker party. | Unlimited liability (no cap), liability cap exceeding contract value, broad-form indemnification (freelancer indemnifies for everything including client's own negligence), no mutual indemnification | Liability caps should be proportional to contract value. Flag uncapped liability as red. |
| **Scope of Work** | Vague scope is the #1 cause of scope creep and disputes. | No defined deliverables, no change order process, "and other duties as assigned" language, acceptance criteria left to client discretion | Flag missing scope definition as red. Flag absent change order process as yellow. |
| **Non-Compete** | Post-termination non-competes can prevent freelancers from working in their field. | Non-compete lasting >6 months, geographically unrestricted, covering entire industry not just direct competitors | Section 27 of Indian Contract Act: post-termination non-competes are generally void and unenforceable in India. This is a major flag -- the clause is legally unenforceable but psychologically intimidating. |

### Tier 2: Important (add in second phase)

| Category | Why Important | Common Risky Patterns |
|----------|--------------|----------------------|
| **Confidentiality / NDA** | Overbroad confidentiality can prevent freelancer from discussing their own work. | No time limit on confidentiality, definition includes publicly available information, no carve-out for portfolio/case studies, penalties disproportionate to contract value |
| **Jurisdiction / Governing Law** | Where disputes get resolved matters enormously for cost and accessibility. | Foreign jurisdiction (Indian freelancer must litigate in Delaware), mandatory arbitration in expensive venues, waiver of right to class action | Flag foreign jurisdiction for Indian users. Note travel and legal costs. |
| **Dispute Resolution** | How conflicts are resolved determines practical enforceability. | Mandatory binding arbitration with no appeal, arbitration in foreign city, loser-pays provisions, short statute of limitations for claims |
| **Force Majeure** | Post-COVID, this is expected. Missing force majeure means liability for delays beyond control. | No force majeure clause at all, narrowly defined events (excludes pandemic, government action), only one party gets force majeure protection |

### Tier 3: Advanced (add later)

| Category | Why Relevant | Common Risky Patterns |
|----------|-------------|----------------------|
| **Non-Solicitation** | Prevents hiring each other's clients/employees. Can be overreaching. | Covers all contacts not just project-related, extends beyond reasonable time period |
| **Data Protection / Privacy** | Relevant for tech freelancers handling user data. | No data handling obligations defined, no breach notification requirements, freelancer liable for client's data practices |
| **Insurance Requirements** | Some contracts require freelancers to carry professional indemnity insurance. | Insurance requirements exceeding contract value, types of insurance unavailable in India |
| **Assignment** | Can the client transfer the contract to another entity without consent? | Unilateral assignment rights for client, no notification requirement |
| **Warranties and Representations** | What the freelancer is guaranteeing about their work. | Unlimited warranty period, warranty of fitness for purpose (vs. workmanlike effort), no limitation on warranty claims |

## Risk Classification System

### Three-Tier Risk Model

Use because it maps to intuitive decision-making: walk away, negotiate, or accept.

| Level | Signal | Meaning | User Action | Criteria |
|-------|--------|---------|-------------|----------|
| **HIGH** | Red | This clause could cause serious harm. Unusual, one-sided, or potentially unenforceable. | Get a lawyer to review before signing. Negotiate hard or walk away. | Unlimited liability, full IP grab with no carve-outs, post-termination non-compete (void in India), unilateral termination with no payment for work done, foreign jurisdiction with no alternative, payment only on "satisfaction" with no objective criteria |
| **MEDIUM** | Yellow | This clause is negotiable and somewhat unfavorable. Common but could be improved. | Negotiate for better terms. Acceptable if other terms compensate. | Payment Net 60+ (but not egregious), liability cap at 1-2x contract value, non-compete during engagement only, broad IP assignment with some carve-outs, single arbitrator in India but client-chosen |
| **LOW** | Green | Standard, balanced, or favorable clause. Industry-normal language. | Acceptable. No action needed. | Milestone-based payments, mutual termination with notice, IP assignment of project work only with portfolio license, mutual NDA with reasonable duration, Indian jurisdiction, liability capped at fees paid |

### Risk Scoring Algorithm (for system prompt)

Rather than a numeric formula, use a rule-based classification that the LLM can apply consistently:

```
For each clause:
1. Identify the clause category (from taxonomy above)
2. Check for HIGH-risk trigger patterns (if any match -> RED)
3. Check for MEDIUM-risk patterns (if any match -> YELLOW)
4. Default to LOW/GREEN if no concerning patterns found
5. Apply India-specific modifiers:
   - Non-compete post-termination -> always RED (Section 27)
   - Foreign jurisdiction -> bump up one level
   - FEMA non-compliance risk -> add warning
   - No INR pricing for Indian party -> add note
```

### Overall Document Risk Score

```
RED document:   2+ HIGH-risk clauses, OR 1 HIGH in payment/liability/IP
YELLOW document: 1 HIGH-risk clause (non-critical category) OR 3+ MEDIUM
GREEN document:  No HIGH, fewer than 3 MEDIUM
```

## Document Types to Support

Ordered by frequency of use for target audience.

### Phase 1 (Launch)

| Document Type | Target User | Key Clauses to Focus On | Frequency |
|---------------|-------------|------------------------|-----------|
| **Freelance / Independent Contractor Agreement** | Freelancers | Payment, IP, scope, termination, liability, non-compete | Very High |
| **Non-Disclosure Agreement (NDA)** | Freelancers, founders | Definition of confidential info, duration, scope, penalties, carve-outs | Very High (74.7% of freelancers sign NDAs) |
| **Terms of Service / Terms of Use** | General public, founders | Liability limitations, arbitration clauses, data usage, auto-renewal, cancellation | High |

### Phase 2

| Document Type | Target User | Key Clauses to Focus On |
|---------------|-------------|------------------------|
| **Vendor / Service Agreement** | Founders | SLAs, payment, liability, indemnification, termination, data handling |
| **SaaS Agreement / Software License** | Founders, developers | Data ownership, uptime SLAs, liability caps, auto-renewal, price escalation |
| **Employment Contract** | General public | Compensation, non-compete (flag Section 27), termination, IP assignment, benefits |

### Phase 3

| Document Type | Target User | Key Clauses to Focus On |
|---------------|-------------|------------------------|
| **Legal Notice** | General public (panic users) | What is being claimed, response deadline, required actions, consequences of non-response |
| **Partnership / Shareholder Agreement** | Founders | Equity split, vesting, decision-making, exit clauses, drag-along/tag-along |
| **Consulting Agreement** | Founders hiring consultants | Similar to freelance but from client perspective |

## Analysis Output Structure

### Per-Clause Output (the core unit)

```json
{
  "clause_number": 1,
  "clause_title": "Intellectual Property Assignment",
  "original_text": "All work product, including but not limited to...",
  "category": "ip_ownership",
  "risk_level": "high",
  "risk_summary": "This assigns ALL intellectual property to the client, including your pre-existing tools, frameworks, and future derivative works.",
  "explanation": "This means anything you create during this project -- and potentially things you created before -- becomes the client's property. You could lose the right to reuse your own code libraries or show this work in your portfolio.",
  "concerns": [
    "Assigns pre-existing IP (your tools/frameworks created before this project)",
    "No carve-out for portfolio or case study use",
    "Includes 'derivative works' which could affect future projects"
  ],
  "suggestion": "Limit IP assignment to deliverables created specifically for this project. Add: 'Contractor retains ownership of pre-existing IP and is granted a license to use deliverables in portfolio/case studies with client details removed.'",
  "india_note": "Under Indian Copyright Act, the author is the first owner of copyright. Work-for-hire requires explicit written agreement. This clause attempts a broader assignment than standard.",
  "action": "Negotiate before signing. Consider consulting a lawyer if contract value is significant."
}
```

### Full Document Output

```json
{
  "document_type": "freelance_agreement",
  "parties": {
    "party_a": "Client Name / Company",
    "party_b": "Freelancer Name"
  },
  "overall_risk": "high",
  "risk_summary": "This contract contains 3 high-risk and 2 medium-risk clauses. The IP assignment and liability terms are significantly one-sided.",
  "risk_breakdown": {
    "high": 3,
    "medium": 2,
    "low": 5
  },
  "top_concerns": [
    "Unlimited liability with no cap",
    "Blanket IP assignment including pre-existing work",
    "Payment contingent on subjective 'satisfaction'"
  ],
  "missing_clauses": [
    {
      "clause": "Force Majeure",
      "importance": "medium",
      "note": "No protection if project is delayed by circumstances beyond your control"
    },
    {
      "clause": "Late Payment Penalty",
      "importance": "high",
      "note": "No incentive for client to pay on time. Consider adding interest clause."
    }
  ],
  "clauses": [ /* array of per-clause objects */ ],
  "disclaimer": "This analysis is for informational purposes only and does not constitute legal advice. For important contracts or high-value agreements, consult a qualified legal professional."
}
```

### Output Format by Channel

| Channel | Format | Notes |
|---------|--------|-------|
| **SKILL.md (Claude Code)** | Markdown with emoji risk indicators | Uses tables and headers for readability in terminal. Red/yellow/green circles as emoji. |
| **MCP Server** | Structured JSON (schema above) | Programmatic consumption. Strict schema for parsing. |
| **Web App** | Rich HTML/React components from JSON | Color-coded cards, expandable sections, progress-bar risk visualization. |

## Differentiators

Features that set ClauseGuard apart from existing tools. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **India-specific legal context** | No competitor focuses on Indian freelancers. Section 27 analysis, FEMA flags, Indian Contract Act awareness. | Medium | This is THE differentiator. goHeather, Compare-X, Jenova are jurisdiction-agnostic or Western-focused. |
| **Freelancer-first perspective** | Most tools are built for enterprises reviewing vendor contracts. ClauseGuard analyzes FROM the freelancer's perspective. | Low | Prompt engineering choice: "Analyze this as if the user is the freelancer/weaker party." |
| **FEMA compliance flags** | Indian freelancers with foreign clients must comply with FEMA. No contract tool checks this. | Medium | Flag: payment timeline compliance (15-month realization window), currency requirements, purpose code awareness. |
| **Three-channel distribution** | Free SKILL for Claude users + MCP for developers + web app for general public. No competitor offers this breadth. | High | Unique distribution strategy. SKILL.md is zero-cost acquisition. |
| **"Panic mode" for legal notices** | When someone gets a legal notice, they need immediate understanding of: what's claimed, deadline, consequences, required response. | Low | Simple but high-value. Legal notice analysis is an underserved use case. |
| **Negotiation talking points** | Beyond "this is risky" -- provide specific language for pushing back. | Low | "You could respond with: 'We'd like to limit liability to fees paid under this agreement.'" |

## Anti-Features

Features to explicitly NOT build. These are traps.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Document storage / history** | Scope creep into a contract management platform. Requires database, auth, encryption. Massively increases complexity and liability. | Stateless per-request analysis. Users paste text, get analysis, done. |
| **Contract generation / drafting** | Legal liability nightmare. Generating contracts is practicing law. Analysis/explanation is not. | Only analyze and suggest edits to existing text. Never generate full contracts. |
| **Legal advice framing** | "You should sign this" or "Don't sign this" = legal advice = liability. | Always frame as explanation: "This clause means X" and "Standard market practice is Y." Never "you should." |
| **Multi-language support (v1)** | Massive complexity. Indian contracts are overwhelmingly in English. Hindi legal terminology is a separate research domain. | English only. Revisit after product-market fit. |
| **PDF / image upload (v1)** | OCR adds complexity, error surface, and cost. Text paste covers 90% of use cases. | Text paste only. Users can copy-paste from PDFs. Add file upload in v2. |
| **Comparison between contract versions** | Redlining/diff is a separate product category (CLM tools). Feature creep. | Analyze one document at a time. Users can analyze revised versions separately. |
| **User accounts for SKILL/MCP** | Unnecessary friction. These channels use the user's own Claude. | Only the web app needs accounts (for freemium metering). |

## Feature Dependencies

```
Document Type Identification
  -> Clause Extraction (needs doc type for context)
    -> Risk Classification (needs clause category)
      -> Plain English Explanation (needs risk context)
      -> Safer Alternative Suggestion (needs risk context)
      -> Missing Clause Detection (needs doc type + extracted clauses)
        -> Overall Risk Score (needs all clause scores + missing clauses)
          -> Final Report Assembly
```

Key insight: Everything flows from document type identification. Get this wrong and downstream analysis degrades. The system prompt must prioritize accurate document classification as the first step.

## MVP Recommendation

### Must have for launch (Phase 1):

1. **Freelance agreement analysis** -- core use case, highest frequency
2. **NDA analysis** -- second most common document type for target audience
3. **Terms of Service analysis** -- broadest appeal for general public
4. **Tier 1 clause categories** -- payment, IP, termination, liability, scope, non-compete
5. **Three-tier risk classification** -- red/yellow/green with explanations
6. **India-specific flags** -- Section 27 non-compete, FEMA payment timelines, jurisdiction warnings
7. **Missing clause detection** -- high-value, low-complexity feature
8. **Disclaimer on every output** -- legal requirement

### Defer to Phase 2:

- Vendor/SaaS/Employment contract types (needs more clause patterns)
- Tier 2 and 3 clause categories (confidentiality, dispute resolution, force majeure)
- Negotiation talking points (nice-to-have, not core)
- Legal notice "panic mode" (different analysis pattern, worth its own phase)

### Defer to Phase 3:

- File upload (PDF/DOCX)
- Partnership/shareholder agreement analysis
- Advanced clause categories (data protection, insurance, warranties)

## Competitor Landscape Summary

| Tool | Price | Strengths | Weaknesses | ClauseGuard Advantage |
|------|-------|-----------|------------|----------------------|
| **Compare-X** | Free, no signup | Fast, clause annotations, gap analysis, negotiation questions | No India focus, no jurisdiction awareness, enterprise-oriented | India-specific, freelancer-first, multi-channel |
| **goHeather** | Freemium | Jurisdiction-aware, side-aware (knows which party you are), Word/PDF support | Limited free tier (few insights), no India jurisdiction, requires file upload | Free SKILL channel, text paste simplicity, India law |
| **Jenova** | Freemium ($20-200/mo) | Experienced-attorney-level analysis, risk scoring, market standard comparison | Paid for regular use, no India focus, generic audience | Free for Claude users, India-specific, freelancer audience |
| **LegalOn** | Enterprise pricing | Pre-built playbooks, fastest ROI for legal teams | Enterprise only, expensive, not for individuals | Accessible to individuals, free tier, India market |
| **Spellbook** | Paid | Word integration, legal-specific, clause library | Lawyer-oriented, not for non-lawyers, no India focus | Plain English for non-lawyers, India context |

### Key gap in the market:
No existing tool combines (1) India-specific legal awareness, (2) freelancer-first perspective, (3) free distribution channel, and (4) plain English for non-lawyers. This is ClauseGuard's opportunity.

## Sources

- [Compare-X Free Contract Analyser](https://compare-x.ai/free-contract-analyser) -- free tool feature analysis
- [goHeather AI Contract Review](https://www.goheather.io/ai-contract-review-app) -- competitor feature set
- [Jenova Free AI for Legal and Contract Advice](https://www.jenova.ai/en/resources/free-ai-for-legal-and-contract-advice) -- competitor pricing and features
- [Hyperstart Contract Risk Assessment Checklist](https://www.hyperstart.com/blog/contract-risk-assessment-checklist/) -- risk classification framework
- [Zuva Risk Scoring](https://zuva.ai/features/risk-scoring/) -- enterprise risk scoring patterns
- [Upscale Legal: Non-Compete Clause vs Section 27](https://upscalelegal.com/non-compete-clause-vs-section-27-contract-analysis/) -- Indian non-compete enforceability
- [Silquick: Freelance Contract India](https://www.silquick.in/blog/freelance-contract-india-prevent-issues) -- Indian freelancer contract problems
- [Razorpay: Freelancer Agreement Guide](https://razorpay.com/learn/freelancer-agreement-guide/) -- Indian freelance agreement basics
- [Karboncard: FEMA Rules for Freelancers](https://www.karboncard.com/blog/fema-rules-for-freelancers-india) -- FEMA compliance for Indian freelancers
- [TaxRobo: Freelancing Income Foreign Clients](https://blog.taxrobo.in/freelancing-income-foreign-clients/) -- FEMA and tax guide
- [DevOpsSchool: Top 10 AI Contract Analysis Tools](https://www.devopsschool.com/blog/top-10-ai-contract-analysis-tools-in-2025-features-pros-cons-comparison/) -- market overview
- [Spellbook: AI Legal Contract Review](https://www.spellbook.legal/learn/ai-legal-contract-review-faster-analysis) -- enterprise tool comparison
- [Icertis: Limitation of Liability Clause Guide](https://www.icertis.com/contracting-basics/limitation-of-liability-clause/) -- liability cap patterns
- [Sirion: IP Clauses](https://www.sirion.ai/library/contract-clauses/intellectual-property-clause/) -- IP clause taxonomy
