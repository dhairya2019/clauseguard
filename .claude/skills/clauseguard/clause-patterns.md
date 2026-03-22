# ClauseGuard: Clause Risk Patterns Reference

> Referenced by SKILL.md for risk classification (Steps 3-4) and missing clause detection (Step 6).
> Structured for Phase 2 MCP system prompt extraction.

---

## Section 1: Risk Trigger Patterns by Clause Category

### 1. Payment Terms

| Risk | Trigger Pattern | Detection Keywords |
|------|----------------|--------------------|
| HIGH | Payment-on-completion only, no milestones | "upon completion", "final delivery", no mention of milestones or progress payments |
| HIGH | Net 90+ payment terms | "net 90", "net 120", "within 90 days", "within 120 days" |
| HIGH | No late payment penalties or interest | Absence of "late payment", "interest", "penalty" in payment section |
| HIGH | Vague or subjective acceptance criteria | "client satisfaction", "sole discretion", "deemed acceptable by client" |
| HIGH | Payment contingent on subjective criteria | "upon approval", "when client is satisfied", "at client's discretion" |
| MEDIUM | Net 60+ payment terms | "net 60", "within 60 days" |
| MEDIUM | No milestone structure for projects >30 days | Single payment clause for long-duration projects |
| MEDIUM | Penalty amounts not specified | "penalties may apply" without specific amounts or rates |
| MEDIUM | Payment in non-standard currency | Currency not in: USD, EUR, GBP, INR, AUD, CAD, JPY, CHF, SGD |
| LOW | Milestone-based payments | "milestone", "phase payment", "progress billing" |
| LOW | Net 30 or shorter payment terms | "net 30", "within 30 days", "net 15", "upon invoice" |
| LOW | Late payment interest specified | "interest at X% per month", "late fee of X%" |
| LOW | Clear deliverable acceptance criteria | "acceptance criteria defined in Exhibit", "objective criteria", "written acceptance within N days" |

### 2. IP Ownership

| Risk | Trigger Pattern | Detection Keywords |
|------|----------------|--------------------|
| HIGH | "All work product" assignment (overly broad) | "all work product", "all intellectual property", "all materials created" without limitation |
| HIGH | Pre-existing IP assignment | "including pre-existing", "all IP owned by contractor", "prior works" assigned to client |
| HIGH | No portfolio/case study carve-out | IP assignment with no mention of portfolio, case study, or display rights |
| HIGH | "Work made for hire" without adequate consideration | "work for hire", "work made for hire" with no explicit compensation clause |
| HIGH | Moral rights waiver | "waive moral rights", "waive all moral rights", "relinquish attribution" |
| MEDIUM | Broad IP assignment with limited carve-outs | Assignment of "project deliverables and related materials" with narrow license-back |
| MEDIUM | No explicit pre-existing IP protection | No mention of "pre-existing IP", "prior works", "contractor's tools" |
| MEDIUM | License-back for limited uses only | License-back restricted to "internal reference only" or similar narrow scope |
| LOW | IP assignment of project deliverables only | "deliverables created specifically for this project", "project-specific work product" |
| LOW | Pre-existing IP explicitly retained | "contractor retains all pre-existing IP", "prior works remain contractor's property" |
| LOW | Portfolio/case study license granted | "contractor may use deliverables in portfolio", "case study rights", "display rights" |

### 3. Termination

| Risk | Trigger Pattern | Detection Keywords |
|------|----------------|--------------------|
| HIGH | Unilateral termination at-will, no payment for completed work | "terminate at any time", "at will" with no payment-on-termination clause |
| HIGH | No cure period for breach | "immediate termination", "terminate without notice" for breach |
| HIGH | No kill fee or payment for in-progress work | Termination clause with no mention of payment for work done or kill fee |
| MEDIUM | Short cure period (<7 days) | "cure within 3 days", "5 business days to cure" |
| MEDIUM | Termination for convenience with minimal notice (<7 days) | "terminate for convenience with 3 days notice" |
| MEDIUM | No payment for in-progress work on convenience termination | Convenience termination with payment only for "accepted deliverables" |
| LOW | Mutual termination with reasonable notice (14-30 days) | "either party may terminate with 14 days written notice" |
| LOW | Payment for completed work on termination | "pay for all work completed through termination date" |
| LOW | Cure period for breach (14+ days) | "cure within 14 days", "30-day cure period" |

### 4. Liability & Indemnification

| Risk | Trigger Pattern | Detection Keywords |
|------|----------------|--------------------|
| HIGH | Unlimited liability (no cap) | No "limitation of liability" or "liability cap" clause; "unlimited liability" |
| HIGH | Liability cap exceeding contract value | "liability not to exceed 2x", "3x the contract value" |
| HIGH | One-sided indemnification (freelancer indemnifies for everything) | "contractor shall indemnify" with no reciprocal "client shall indemnify" |
| HIGH | Indemnification for client's own negligence | "indemnify against all claims including those arising from client's actions" |
| MEDIUM | Liability cap at 1-2x contract value | "liability shall not exceed twice the fees paid" |
| MEDIUM | One-sided indemnification with limited scope | "contractor indemnifies for IP infringement only" with no mutual clause |
| MEDIUM | No mutual indemnification | Only one party has indemnification obligations |
| LOW | Liability capped at fees paid | "total liability shall not exceed fees paid under this agreement" |
| LOW | Mutual indemnification | "each party shall indemnify the other" |
| LOW | Reasonable exclusions | Excludes consequential, indirect, punitive damages for both parties |

### 5. Scope of Work

| Risk | Trigger Pattern | Detection Keywords |
|------|----------------|--------------------|
| HIGH | No defined deliverables | No exhibit, schedule, or section listing specific deliverables |
| HIGH | "Other duties as assigned" language | "other duties as assigned", "additional tasks as needed", "and other work as directed" |
| HIGH | Acceptance at sole discretion of client | "accepted at client's sole discretion", "client shall determine acceptability" |
| HIGH | No change order process | No mention of "change order", "scope change", "amendment process" for scope modifications |
| MEDIUM | Vague deliverable descriptions | Deliverables described in general terms without specifications or measurable criteria |
| MEDIUM | No formal change order process | Mentions scope changes but no written approval requirement or pricing adjustment |
| MEDIUM | Acceptance criteria partially defined | Some criteria listed but subjective elements remain ("quality standards") |
| LOW | Clear deliverables list with specifications | Specific deliverables in exhibit with acceptance criteria |
| LOW | Formal change order process with pricing | "changes require written change order", "adjusted timeline and fees" |
| LOW | Objective acceptance criteria | "acceptance based on conformance to specifications in Exhibit A" |

### 6. Non-Compete

| Risk | Trigger Pattern | Detection Keywords |
|------|----------------|--------------------|
| HIGH | Any post-termination restriction on competition | "shall not compete after termination", "for N months/years after", "following expiration" + competition restriction |
| HIGH | Geographically unrestricted non-compete | "worldwide", "globally", no geographic limitation on competition restriction |
| HIGH | Covers entire industry | "in the field of", "in the industry of", broad sector restriction |
| HIGH | Restricts working with "competitors" (undefined) | "shall not work with competitors" without naming specific companies |
| MEDIUM | During-engagement non-compete (verify scope) | "during the term", "while engaged" + competition restriction |
| MEDIUM | Non-solicitation of specific clients post-termination | "shall not solicit client's customers for N months after termination" |
| MEDIUM | Broad non-solicitation (all contacts) | "shall not solicit any person or entity" introduced during engagement |
| LOW | Confidentiality/NDA obligations only | "shall not disclose confidential information" with no competition restriction |
| LOW | Named-competitor restriction during engagement only | "shall not perform similar work for [Company X, Company Y] during the term" |

---

## Section 2: Missing Clause Checklists by Document Type

### Freelance / Independent Contractor Agreement

| Priority | Missing Clause | Why It Matters |
|----------|---------------|----------------|
| CRITICAL | Payment schedule with milestones | No payment structure means client controls when (or if) you get paid |
| CRITICAL | Scope of work with defined deliverables | Undefined scope leads to unlimited expectations and scope creep |
| CRITICAL | IP ownership with pre-existing IP carve-out | Without this, client may claim ownership of your tools, frameworks, and prior work |
| CRITICAL | Termination clause with payment for completed work | Without this, termination means losing payment for work already delivered |
| HIGH | Liability cap | Unlimited liability exposure can exceed the contract value many times over |
| HIGH | Change order process | No process means client can expand scope without additional payment |
| MEDIUM | Late payment penalties/interest | No penalty means no incentive for client to pay on time |
| MEDIUM | Confidentiality terms | Unclear confidentiality can restrict your ability to discuss your own work |
| MEDIUM | Dispute resolution / jurisdiction | Ambiguity about where and how disputes are resolved creates uncertainty |
| LOW | Force majeure | No protection for delays beyond your control (illness, natural disaster, etc.) |

### Non-Disclosure Agreement (NDA)

| Priority | Missing Clause | Why It Matters |
|----------|---------------|----------------|
| CRITICAL | Definition of confidential information | Without a clear definition, anything could be claimed as confidential |
| CRITICAL | Duration of confidentiality obligations | Indefinite obligations create permanent restrictions on your work |
| CRITICAL | Exclusions (public info, independently developed, etc.) | Without exclusions, you could be liable for disclosing publicly available information |
| HIGH | Return/destruction of materials on termination | Unclear obligations for handling materials after the relationship ends |
| HIGH | Permitted disclosures (legal requirement, employees) | No safe harbor for legally compelled disclosures or necessary sharing with team |
| MEDIUM | Remedies for breach | Vague remedies create uncertainty about consequences |
| MEDIUM | Jurisdiction/governing law | Ambiguity about where disputes are resolved |
| MEDIUM | Mutual vs. one-way obligations | One-way NDAs only protect one party; check if mutual protection is appropriate |

### Terms of Service / Terms of Use

| Priority | Missing Clause | Why It Matters |
|----------|---------------|----------------|
| CRITICAL | Limitation of liability | No liability limit means uncapped exposure for service-related claims |
| CRITICAL | Termination/cancellation rights | No exit mechanism traps users in unfavorable terms |
| HIGH | Dispute resolution mechanism | No process for resolving disagreements creates legal uncertainty |
| HIGH | Data usage and privacy policy reference | Users need to know how their data is collected, used, and shared |
| HIGH | Auto-renewal terms and opt-out process | Hidden auto-renewal without clear opt-out is a common consumer trap |
| MEDIUM | Modification clause (how terms can change) | No notice of changes means terms can change without user awareness |
| MEDIUM | Intellectual property rights | Unclear IP terms for user-generated content or uploaded materials |
| MEDIUM | Indemnification | One-sided indemnification shifts all risk to the user |

---

## Section 3: Safer Alternative Templates

Standard market language for each category. Frame as "what balanced contracts typically say" -- not legal advice.

### Payment Terms

> **Standard market language:** "Fees shall be paid in [N] milestone installments as defined in Exhibit A. Each milestone payment is due within 30 days of invoice. Invoices not paid within 30 days shall accrue interest at 1.5% per month (or the maximum rate permitted by law, whichever is lower). Acceptance of deliverables shall be based on conformance to the specifications in Exhibit A, with written acceptance or specific objections due within 10 business days of delivery."

### IP Ownership

> **Standard market language:** "Contractor assigns to Client all intellectual property rights in deliverables created specifically for this project, as defined in Exhibit A. Contractor retains ownership of all pre-existing intellectual property, tools, frameworks, and methodologies ('Pre-Existing IP'). To the extent Pre-Existing IP is incorporated into deliverables, Contractor grants Client a non-exclusive, perpetual, royalty-free license to use such Pre-Existing IP solely as part of the deliverables. Contractor is granted a non-exclusive license to use deliverables in portfolio and case studies with client-identifying details removed."

### Termination

> **Standard market language:** "Either party may terminate this agreement with 14 days' written notice. Either party may terminate immediately upon material breach if the breaching party fails to cure within 14 days of written notice specifying the breach. Upon termination for any reason, Client shall pay for all work completed and accepted through the termination date, plus a pro-rata share of any in-progress milestone."

### Liability & Indemnification

> **Standard market language:** "Each party's total aggregate liability under this agreement shall not exceed the total fees paid or payable under this agreement. Neither party shall be liable for indirect, incidental, consequential, special, or punitive damages. Each party shall indemnify and hold harmless the other from third-party claims arising from: (a) the indemnifying party's breach of this agreement, or (b) the indemnifying party's negligence or willful misconduct."

### Scope of Work

> **Standard market language:** "The scope of work is defined in Exhibit A, which lists all deliverables, specifications, milestones, and acceptance criteria. Any changes to the scope require a written change order signed by both parties, specifying the revised deliverables, adjusted timeline, and additional fees (if any). Work performed outside the scope without a signed change order shall not be required of Contractor and shall not be compensated."

### Non-Compete

> **Standard market language:** "During the term of this agreement, Contractor shall not perform substantially similar services for [specific named competitor(s)]. This restriction terminates upon expiration or termination of this agreement. For clarity, Contractor's confidentiality obligations under Section [X] survive termination, but no restriction on Contractor's right to compete or work in their field of expertise shall apply after termination."

---

*Reference file for ClauseGuard SKILL.md -- do not use as standalone document.*
*Designed for Phase 2 reuse: patterns are structured as IF/THEN rules for MCP system prompt encoding.*
