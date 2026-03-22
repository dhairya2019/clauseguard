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
| HIGH | Pay-when-paid / pay-if-paid clauses | "payment contingent on client receiving payment", "pay-when-paid", "pay-if-paid", "upon receipt of payment from end client" |
| HIGH | Right to offset / set-off without notice | "may deduct from payments", "right to offset", "set-off", "withhold amounts owed" without prior notice requirement |
| MEDIUM | Net 60+ payment terms | "net 60", "within 60 days" |
| MEDIUM | No milestone structure for projects >30 days | Single payment clause for long-duration projects |
| MEDIUM | Penalty amounts not specified | "penalties may apply" without specific amounts or rates |
| MEDIUM | Payment in non-standard currency | Currency not in: USD, EUR, GBP, INR, AUD, CAD, JPY, CHF, SGD |
| MEDIUM | Payment only for "accepted" work with no acceptance timeline | "payment for accepted deliverables" with no deadline for acceptance decision |
| MEDIUM | Retention / holdback clauses | "retain", "holdback", "withhold 10%", "withhold 20%", "released upon project completion" |
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
| HIGH | Assignment of "ideas" and "concepts" (not just deliverables) | "ideas", "concepts", "know-how", "methodologies developed" assigned to client beyond project deliverables |
| HIGH | IP assignment survives termination with no payment obligation | "IP assignment shall survive termination" with no corresponding payment-for-work-done clause |
| MEDIUM | Broad IP assignment with limited carve-outs | Assignment of "project deliverables and related materials" with narrow license-back |
| MEDIUM | No explicit pre-existing IP protection | No mention of "pre-existing IP", "prior works", "contractor's tools" |
| MEDIUM | License-back for limited uses only | License-back restricted to "internal reference only" or similar narrow scope |
| MEDIUM | "Background IP" not defined (ambiguous pre-existing IP boundary) | IP clause references "background IP" or "pre-existing IP" without explicit definition or listing |
| MEDIUM | License-back restricted to single named project only | "license to use solely in connection with [Project Name]", "limited to the [specific] project" |
| LOW | IP assignment of project deliverables only | "deliverables created specifically for this project", "project-specific work product" |
| LOW | Pre-existing IP explicitly retained | "contractor retains all pre-existing IP", "prior works remain contractor's property" |
| LOW | Portfolio/case study license granted | "contractor may use deliverables in portfolio", "case study rights", "display rights" |

### 3. Termination

| Risk | Trigger Pattern | Detection Keywords |
|------|----------------|--------------------|
| HIGH | Unilateral termination at-will, no payment for completed work | "terminate at any time", "at will" with no payment-on-termination clause |
| HIGH | No cure period for breach | "immediate termination", "terminate without notice" for breach |
| HIGH | No kill fee or payment for in-progress work | Termination clause with no mention of payment for work done or kill fee |
| HIGH | Termination for insolvency (may be unenforceable under IBC) | "terminate upon insolvency", "bankruptcy", "winding up", "unable to pay debts" as termination trigger |
| HIGH | Forfeiture of all payments on termination for cause | "forfeit all payments", "no compensation due", "all amounts paid shall be refunded" upon cause termination |
| MEDIUM | Short cure period (<7 days) | "cure within 3 days", "5 business days to cure" |
| MEDIUM | Termination for convenience with minimal notice (<7 days) | "terminate for convenience with 3 days notice" |
| MEDIUM | No payment for in-progress work on convenience termination | Convenience termination with payment only for "accepted deliverables" |
| MEDIUM | Automatic termination on change of control | "automatically terminates upon change of control", "merger", "acquisition", "change in ownership" triggers termination |
| MEDIUM | Survival clause covering unreasonable scope of obligations | "the following sections shall survive termination" covering indemnification, non-compete, IP assignment, and liability simultaneously |
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
| HIGH | Indemnification for third-party IP claims where contractor has no control over client's use | "indemnify against IP infringement claims", "hold harmless from third-party IP" where client modifies or combines deliverables |
| HIGH | "Gross negligence" / "willful misconduct" carve-outs from liability cap | "excluding gross negligence", "except for willful misconduct", "liability cap shall not apply to" -- effectively voids the cap |
| MEDIUM | Liability cap at 1-2x contract value | "liability shall not exceed twice the fees paid" |
| MEDIUM | One-sided indemnification with limited scope | "contractor indemnifies for IP infringement only" with no mutual clause |
| MEDIUM | No mutual indemnification | Only one party has indemnification obligations |
| MEDIUM | Indemnification for regulatory fines (potentially uncapped) | "indemnify for fines", "regulatory penalties", "government sanctions", "compliance violations" |
| MEDIUM | Insurance requirements exceeding reasonable coverage for contract value | "maintain insurance of $X million", "professional indemnity insurance" where coverage far exceeds contract value |
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
| HIGH | "Reasonable requests" or "as reasonably required" language (unlimited scope) | "reasonable requests", "as reasonably required", "as may be necessary", "such other tasks as reasonably requested" |
| MEDIUM | Vague deliverable descriptions | Deliverables described in general terms without specifications or measurable criteria |
| MEDIUM | No formal change order process | Mentions scope changes but no written approval requirement or pricing adjustment |
| MEDIUM | Acceptance criteria partially defined | Some criteria listed but subjective elements remain ("quality standards") |
| MEDIUM | Acceptance by silence (deemed accepted if no response in N days) | "deemed accepted if no objection within", "silence constitutes acceptance", "failure to respond within N days" |
| MEDIUM | Warranty period for deliverables exceeding 90 days | "warranty period of 6 months", "12-month warranty", "warrant for one year" on deliverable quality |
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
| HIGH | Non-compete disguised as "exclusivity" or "dedicated resources" clause | "exclusive services", "dedicated resource", "shall devote full time", "shall not provide services to others" in non-compete context |
| MEDIUM | During-engagement non-compete (verify scope) | "during the term", "while engaged" + competition restriction |
| MEDIUM | Non-solicitation of specific clients post-termination | "shall not solicit client's customers for N months after termination" |
| MEDIUM | Broad non-solicitation (all contacts) | "shall not solicit any person or entity" introduced during engagement |
| MEDIUM | Non-compete tied to confidentiality (conflating two distinct restrictions) | "confidentiality and non-competition", "as part of confidentiality obligations, shall not compete" -- merges NDA with non-compete |
| LOW | Confidentiality/NDA obligations only | "shall not disclose confidential information" with no competition restriction |
| LOW | Named-competitor restriction during engagement only | "shall not perform similar work for [Company X, Company Y] during the term" |

### 7. Confidentiality / NDA

| Risk | Trigger Pattern | Detection Keywords |
|------|----------------|--------------------|
| HIGH | Perpetual confidentiality obligation with no sunset clause | "in perpetuity", "indefinitely", "shall survive termination without limitation", no duration specified for confidentiality |
| HIGH | Definition includes publicly available information or independently developed work | "confidential information includes all information", no exclusion for public domain or independently developed |
| HIGH | Confidentiality breach triggers liquidated damages (often disproportionate) | "liquidated damages", "predetermined damages", "penalty of $X" for confidentiality breach |
| MEDIUM | No carve-out for legally compelled disclosure | No mention of "required by law", "court order", "regulatory requirement" as permitted disclosure |
| MEDIUM | One-way NDA when both parties share information | "receiving party shall not disclose" with only one party defined as receiving party despite mutual information sharing |

### 8. Auto-Renewal & Contract Duration

| Risk | Trigger Pattern | Detection Keywords |
|------|----------------|--------------------|
| HIGH | Auto-renewal with 90+ day advance notice requirement to cancel | "auto-renew", "automatically renew" with "90 days", "120 days", "180 days" prior written notice to cancel |
| HIGH | Auto-renewal with price escalation clause (unspecified or uncapped increase) | "auto-renew at adjusted rates", "renewal price increase", "escalation" with no cap or formula specified |
| MEDIUM | Evergreen contract with no maximum duration | "shall continue until terminated", "evergreen", no end date or maximum term specified |
| MEDIUM | Lock-in period with early termination penalty | "minimum term", "lock-in", "early termination fee", "cancellation penalty", "liquidated damages for early termination" |

### 9. Assignment & Subcontracting

| Risk | Trigger Pattern | Detection Keywords |
|------|----------------|--------------------|
| HIGH | Client can assign contract to any entity without consent | "client may assign without consent", "freely assignable by client", "client may transfer this agreement" |
| HIGH | Assignment includes assignment of obligations without consent | "assign rights and obligations", "transfer all rights and duties" without requiring counterparty consent |
| MEDIUM | No-subcontracting clause for complex deliverables | "shall not subcontract", "must perform personally", "no delegation" for projects requiring team or specialist work |
| LOW | Mutual consent required for assignment | "neither party may assign without written consent", "assignment requires mutual agreement" |

### 10. Force Majeure

| Risk | Trigger Pattern | Detection Keywords |
|------|----------------|--------------------|
| MEDIUM | No force majeure clause in long-term contract (>6 months) | Absence of "force majeure", "act of God", "beyond reasonable control" in contracts with term exceeding 6 months |
| MEDIUM | Force majeure only protects one party | "client shall be excused" or "contractor shall be excused" without reciprocal protection for the other party |
| MEDIUM | Force majeure definition excludes pandemic/epidemic/government action | "force majeure" clause that does not list "pandemic", "epidemic", "government order", "quarantine", "lockdown" |

### 11. Data Protection & Privacy

| Risk | Trigger Pattern | Detection Keywords |
|------|----------------|--------------------|
| HIGH | No data processing obligations defined when handling personal data | Contract involves personal data handling with no "data processing", "data protection", "privacy" obligations specified |
| HIGH | Contractor liable for client's data practices / data breaches | "contractor shall be liable for any data breach", "indemnify for data incidents" regardless of fault |
| MEDIUM | No breach notification timeline specified | "notify of data breach" with no specific timeframe ("within 24 hours", "within 72 hours", "promptly") |
| MEDIUM | Cross-border data transfer without compliance mechanism | "data may be transferred", "process data in any jurisdiction" with no mention of "adequacy decision", "standard contractual clauses", "DPDP Act", "GDPR" compliance |

### 12. Warranties & Representations

| Risk | Trigger Pattern | Detection Keywords |
|------|----------------|--------------------|
| HIGH | Unlimited warranty period ("in perpetuity") | "warrant in perpetuity", "permanent warranty", "unlimited warranty period", no warranty expiration date |
| HIGH | Warranty of fitness for purpose (vs. workmanlike effort) | "fit for a particular purpose", "fitness for purpose", "suitable for client's intended use" -- higher standard than workmanlike effort |
| MEDIUM | Warranty that work does not infringe any IP (impossible to guarantee absolutely) | "warrants non-infringement of any intellectual property", "guarantees no IP infringement worldwide" -- absolute guarantee |
| MEDIUM | Representation of "exclusive" skills or qualifications not actually required | "represents exclusive expertise", "uniquely qualified", "sole specialist" -- creates heightened duty of care |

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

### Employment Contract

| Priority | Missing Clause | Why It Matters |
|----------|---------------|----------------|
| CRITICAL | Compensation and benefits defined | Without explicit compensation terms, disputes over pay structure and benefits are inevitable |
| CRITICAL | Notice period (mutual) | No notice period means either party can end employment abruptly with no transition time |
| HIGH | IP ownership clause distinguishing employment work from personal projects | Without this distinction, employer may claim ownership of personal side projects and inventions |
| HIGH | Non-compete scope limited to during-engagement | Post-termination non-competes are unenforceable under Indian Contract Act S.27 but still create legal hassle |
| MEDIUM | Probation terms and evaluation criteria | Undefined probation creates uncertainty about confirmation timeline and performance expectations |
| MEDIUM | Leave policy reference | No leave terms or policy reference means entitlements are ambiguous |
| LOW | Relocation/remote work terms | Unclear location terms create disputes if work arrangement changes |

### SaaS Agreement

| Priority | Missing Clause | Why It Matters |
|----------|---------------|----------------|
| CRITICAL | Service Level Agreement (SLA) with uptime guarantee | No SLA means no recourse when service goes down -- no uptime commitment, no remedies |
| CRITICAL | Data ownership and portability | Without data ownership clarity, vendor may claim rights to your data or restrict export |
| HIGH | Termination rights and data export timeline | No export timeline means vendor can delete your data immediately upon termination |
| HIGH | Limitation of liability | Uncapped liability exposure for service-related issues and outages |
| MEDIUM | Support response times | No defined support SLA means no obligation to respond to issues within any timeframe |
| MEDIUM | Security and compliance certifications | No security commitments means no accountability for data protection practices |
| LOW | Integration and API access terms | Unclear API terms can limit your ability to integrate or build on the service |

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

### Confidentiality / NDA

> **Standard market language:** "Confidential Information means information disclosed by either party that is marked as confidential or would reasonably be understood to be confidential given the nature of the information and circumstances of disclosure. Confidential Information expressly excludes: (a) information publicly available through no fault of receiving party, (b) information independently developed without use of disclosing party's information, (c) information received from a third party without restriction, (d) information required to be disclosed by law or court order (with prompt notice to disclosing party). Confidentiality obligations shall remain in effect for [2-3] years following termination of this agreement."

### Auto-Renewal & Contract Duration

> **Standard market language:** "This agreement shall have an initial term of [N] months/years commencing on the Effective Date. The agreement shall automatically renew for successive [N]-month/year periods unless either party provides written notice of non-renewal at least [30] days prior to the end of the then-current term. Fees for any renewal term shall not increase by more than [X]% over the prior term without mutual written agreement."

### Data Protection & Privacy

> **Standard market language:** "Each party shall comply with all applicable data protection laws, including the Digital Personal Data Protection Act, 2023 (where applicable) and GDPR (where applicable). Where Contractor processes personal data on behalf of Client, the parties shall enter into a data processing agreement. Either party shall notify the other of any data breach involving the other party's data within 72 hours of becoming aware of such breach. Cross-border transfers of personal data shall be conducted in compliance with applicable data transfer mechanisms."

---

## Section 4: Edge Case Detection Patterns

Hidden, disguised, and compound risks that standard pattern matching may miss. Use these detection strategies alongside Section 1 patterns.

### 1. Multi-Clause Interaction Risks

Individually acceptable clauses that become dangerous in combination. When two or more of these clauses appear in the same contract, escalate the combined risk.

| Combination | Combined Risk | Detection Keywords |
|-------------|---------------|--------------------|
| Non-compete + IP assignment = cannot work in field AND client owns your tools | HIGH | "shall not compete" + "assigns all intellectual property" in same contract |
| Indemnification + no liability cap = unlimited financial exposure | HIGH | "shall indemnify" present + absence of "limitation of liability" or "liability cap" |
| Termination for convenience + no in-progress payment + IP assignment on termination = client gets everything, pays nothing | HIGH | "terminate for convenience" + no "payment for work completed" + "IP assignment survives termination" |
| Auto-renewal + price escalation + long cancellation notice = locked into increasing costs | HIGH | "automatically renew" + "adjusted rates" or "price increase" + "90 days" or "120 days" notice |
| Broad confidentiality + broad non-solicitation = disguised non-compete | MEDIUM | "all information" as confidential + "shall not solicit any person" -- effectively prevents working in the field |

**Detection guidance:** After individual clause analysis, cross-reference flagged clauses. If two or more individually MEDIUM risks appear together from this table, escalate the combined finding to HIGH.

### 2. Buried Clauses in Boilerplate

Substantive obligations hidden in sections that readers typically skip.

| Location | What Gets Buried | Detection Guidance |
|----------|------------------|--------------------|
| "Definitions" section | Exclusivity requirements defined as part of "Services" definition | Check all defined terms used in restrictive clauses -- a broad definition can weaponize an otherwise reasonable clause |
| "General Provisions" or "Miscellaneous" | Non-compete or non-solicitation obligations | Read every clause in General/Miscellaneous sections; search for "compete", "solicit", "exclusive" |
| "Confidentiality" section | IP assignment bundled with confidentiality obligations | Search Confidentiality sections for "assign", "transfer", "ownership", "work product" |
| "Representations and Warranties" | Indemnification triggers disguised as representations | Search for "indemnify", "hold harmless", "liable" within warranty sections |
| "Term" section without clear heading | Auto-renewal with cancellation requirements buried in paragraph text | Search Term sections for "renew", "auto", "cancel", "notice" even when no sub-heading mentions renewal |

**Detection guidance:** When analyzing a contract, do NOT skip sections titled "General", "Miscellaneous", "Definitions", or "Boilerplate". These sections frequently contain substantive obligations disguised as administrative clauses. Scan every section for keywords from Section 1 risk patterns regardless of the section heading.

### 3. Misleading Headings

Section headings that suggest protection or balance but contain one-sided or aggressive terms.

| Heading | What It Actually Contains | Red Flag |
|---------|--------------------------|----------|
| "Intellectual Property Protection" | Assigns all IP away from the creator | Heading implies protection OF creator's IP but content transfers it away |
| "Mutual Obligations" | Entirely one-sided terms favoring the client | Heading implies balance but obligations flow in only one direction |
| "Standard Terms" | Non-standard, aggressive clauses | "Standard" label discourages negotiation of actually unusual terms |
| "Flexible Engagement" | Locks in exclusivity or minimum hours | "Flexible" implies freedom but content restricts it |
| "Performance Standards" | Contains termination triggers for subjective underperformance | Heading suggests quality metrics but content enables at-will termination |

**Detection guidance:** Always read clause content regardless of heading. If a heading suggests mutual/standard/protective language but the content is one-sided/aggressive, flag the mismatch as a risk indicator. Heading-content mismatch is itself a YELLOW flag.

### 4. Compound Sentences Hiding Risk

Multiple obligations or restrictions joined in a single sentence, where the secondary risk is obscured by the primary clause.

| Example Pattern | Hidden Risk | Detection Keywords |
|-----------------|-------------|--------------------|
| "assigns all IP AND agrees not to compete" | Two distinct restrictions (IP + non-compete) buried in one sentence | "and agrees", "and shall not", "and further" joining distinct obligations |
| "upon completion AND acceptance at sole discretion" | Payment trap: completion alone is insufficient, subjective acceptance gate added | "and acceptance", "and approval", "and written confirmation" after payment trigger |
| "includes all materials, tools, ideas, concepts, and methodologies" | Scope creep through list expansion -- each item broadens the assignment | "including but not limited to", "including all", comma-separated lists of 4+ IP-related nouns |
| "may terminate for cause, including but not limited to" | Open-ended termination triggers -- "including but not limited to" makes the list non-exhaustive | "including but not limited to", "including without limitation", "such as" in termination-for-cause definitions |

**Detection guidance:** Break compound sentences at AND/OR/including/as well as conjunctions. Analyze each clause fragment independently for risk. A sentence with 3+ conjunctions joining distinct obligations should be flagged for closer review.

### 5. Defined Term Manipulation

Definitions that make otherwise reasonable clauses unreasonable by expanding the scope of key terms.

| Defined Term | Overbroad Definition | Risk |
|--------------|----------------------|------|
| "Confidential Information" | Defined to include publicly available data or independently developed work | Makes confidentiality clause impossible to comply with; any disclosure is a breach |
| "Deliverables" | Defined to include future work not yet scoped or agreed upon | Enables unlimited scope expansion without change orders |
| "Compensation" | Defined to exclude certain types of work (e.g., revisions, meetings, travel) | Creates unpaid labor obligations for work that should be compensated |
| "Termination for Cause" | Defined so broadly that any minor issue qualifies (e.g., "failure to meet any expectation") | Converts termination-for-cause into de facto at-will termination |
| "Competing Business" | Defined to cover the entire industry rather than specific named competitors | Transforms a narrow non-compete into an industry-wide restriction |

**Detection guidance:** Check the Definitions section for every term used in restrictive clauses (non-compete, confidentiality, IP assignment, termination for cause). An unreasonable definition can make an otherwise reasonable clause dangerous. Flag any definition that uses "all", "any", "including but not limited to" without meaningful boundaries.

### 6. Cross-Reference Traps

Clauses that reference other sections, exhibits, or external documents that modify or override the clause's apparent meaning.

| Pattern | Risk | Detection Keywords |
|---------|------|--------------------|
| "Subject to Section 12" where Section 12 has aggressive carve-outs | Apparent protection is nullified by the referenced section | "subject to", "except as provided in", "notwithstanding Section" -- verify referenced section |
| "As defined in Exhibit B" where Exhibit B is not provided | Undefined terms create ambiguity that favors the drafting party | "as defined in Exhibit", "per Exhibit", "see Exhibit" -- verify exhibit is attached and complete |
| "In accordance with Company Policy" where policy can change unilaterally | Terms can be modified without contract amendment or consent | "company policy", "internal policy", "as amended from time to time", "current policy" |
| "Per the rates in Schedule A" where Schedule A is blank or TBD | Payment terms are effectively undefined despite appearing specified | "per Schedule", "as set forth in Schedule", "TBD", "to be determined", "to be agreed" |

**Detection guidance:** Verify all cross-references resolve to actual, complete content. Flag any reference to missing exhibits, undefined policies, or TBD schedules as YELLOW risk. References to documents that "may be amended from time to time" without consent requirements should be flagged as HIGH risk since they allow unilateral contract modification.

---

*Reference file for ClauseGuard SKILL.md -- do not use as standalone document.*
*Designed for Phase 2 reuse: patterns are structured as IF/THEN rules for MCP system prompt encoding.*
