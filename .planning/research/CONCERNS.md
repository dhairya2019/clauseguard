# Indian Legal Context & Compliance Concerns

**Domain:** Contract analysis tool targeting Indian users
**Researched:** 2026-03-22
**Overall confidence:** MEDIUM-HIGH (statutes are well-documented; DPDP Act enforcement is still phasing in)

---

## 1. Indian Contract Act 1872 -- Key Provisions for Analysis Logic

The Indian Contract Act 1872 is the foundational statute. ClauseGuard must encode awareness of these sections because contracts that violate them are void or voidable under Indian law, even if they look normal under US/UK law.

### Sections to Encode as Red Flag Rules

| Section | What It Says | Red Flag Trigger | Confidence |
|---------|-------------|------------------|------------|
| **S.10** | Valid contract requires free consent, lawful consideration, lawful object | Contract missing consideration on one side (e.g., "you assign all IP for no additional compensation") | HIGH |
| **S.14-18** | Free consent -- not caused by coercion, undue influence, fraud, misrepresentation | One-sided termination clauses, penalty clauses with no reciprocal right | HIGH |
| **S.23** | Consideration/object unlawful if forbidden by law, defeats any law, is fraudulent, injurious, immoral, or against public policy | Clauses requiring illegal acts, clauses that circumvent Indian tax law | HIGH |
| **S.25** | Agreement without consideration is void (with exceptions: love/affection, past voluntary service, time-barred debt) | IP assignment clauses with zero consideration; "work made for hire" without payment terms | HIGH |
| **S.27** | Agreement in restraint of trade is void | Any non-compete clause (see Section 4 below for nuances) | HIGH |
| **S.28** | Agreement in restraint of legal proceedings is void | Clauses that waive right to sue, limit statute of limitations below legal minimum, or force disputes to foreign-only courts with no Indian recourse | HIGH |
| **S.29** | Agreements void for uncertainty | Vague scope-of-work, undefined deliverables, "as needed" service terms | MEDIUM |
| **S.73-74** | Liquidated damages must be reasonable; penalty clauses are subject to court reduction | Disproportionate penalty amounts (e.g., 10x contract value for breach) | HIGH |

### Encodable Rules for Analysis Engine

```
RULE: consideration_check
IF contract contains IP assignment OR work assignment
AND no explicit payment/compensation mentioned for that assignment
THEN flag RED: "Under Indian Contract Act S.25, agreements without consideration are void. This IP assignment clause has no stated consideration."

RULE: restraint_of_trade
IF clause restricts future employment OR business activity
AND restriction applies AFTER contract/employment ends
THEN flag RED: "Under Indian Contract Act S.27, post-termination non-compete clauses are void in India."

RULE: restraint_of_legal_proceedings
IF clause limits right to sue OR shortens limitation period OR mandates exclusive foreign jurisdiction with no Indian arbitration option
THEN flag RED: "Under Indian Contract Act S.28, agreements restricting legal proceedings are void."

RULE: unreasonable_penalty
IF liquidated damages exceed 2x contract value
OR termination penalty is disproportionate to likely loss
THEN flag YELLOW: "Under S.73-74, Indian courts can reduce penalties deemed unreasonable."
```

**Source confidence:** HIGH -- these are well-established statutory provisions unchanged since 1872, with extensive case law.

**Sources:**
- [Indian Contract Act full text](https://www.indiacode.nic.in/bitstream/123456789/2187/2/A187209.pdf)
- [Section 23 on Indian Kanoon](https://indiankanoon.org/doc/1625889/)
- [Void Agreements Sections 24-30](https://lawwire.in/academic-block/bare-acts/indian-contract-act-1872/chapter-ii-contracts-voidable-contracts-and-void-agreements/void-agreements-section-24-30/)

---

## 2. FEMA (Foreign Exchange Management Act) Implications

This is critical for ClauseGuard's core audience: Indian freelancers working with foreign clients. FEMA governs how money enters and leaves India.

### Key Rules to Encode

| Rule | What It Means | Red Flag Trigger |
|------|--------------|------------------|
| **Payments must flow through AD Category-I banks** | Wire transfers via SWIFT or approved aggregators (PayPal, Wise) only | Contract specifying payment via cryptocurrency, informal channels, or non-approved platforms |
| **Freely convertible currency required** | Payment must be in USD, EUR, GBP, etc. -- not INR from abroad | Contract specifying payment in non-convertible currency or unusual payment mechanisms |
| **Purpose codes mandatory** | Every inward remittance needs an RBI purpose code (e.g., P0802 for software services) | Contract lacking clear service description that maps to a purpose code |
| **15-month repatriation deadline** | Export proceeds must be realized within 15 months (extended from 9 months in 2025) | Payment terms exceeding 12 months (flag as risky given 15-month hard limit) |
| **FIRC documentation** | Bank issues Foreign Inward Remittance Certificate as proof | Contract should not prohibit or complicate obtaining payment documentation |
| **Record retention: 5-6 years** | All foreign receipt records must be kept | Relevant for ClauseGuard's own compliance if storing any data |

### FEMA Penalties

Non-compliance is a **civil offence** under FEMA Section 13:
- Penalty up to **3x the sum involved** (if quantifiable)
- Up to **INR 2,00,000** if not quantifiable
- Additional daily penalty of **INR 5,000** for continuing contraventions

### Encodable Rules

```
RULE: fema_payment_channel
IF payment method specified
AND method is NOT (bank wire / SWIFT / PayPal / Wise / approved aggregator)
THEN flag RED: "FEMA requires payments from foreign clients to flow through RBI-authorized banking channels. Non-compliant payment methods risk penalties up to 3x the amount."

RULE: fema_currency
IF payment currency specified
AND currency is NOT freely convertible (USD, EUR, GBP, AUD, CAD, JPY, CHF, SGD)
THEN flag YELLOW: "FEMA requires foreign payments in freely convertible currencies. Verify this currency is RBI-approved."

RULE: fema_payment_timeline
IF payment terms exceed 12 months from service delivery
THEN flag YELLOW: "RBI mandates export proceeds realization within 15 months. Long payment terms risk FEMA non-compliance."

RULE: fema_crypto_payment
IF payment mentions cryptocurrency OR Bitcoin OR Ethereum OR crypto wallet
THEN flag RED: "Cryptocurrency payments from foreign clients are not recognized under FEMA. Indian freelancers must receive payments through authorized banking channels."
```

**Source confidence:** HIGH -- FEMA regulations are well-documented and enforced.

**Sources:**
- [FEMA rules for freelancers: India's 2026 Compliance Playbook](https://www.karboncard.com/blog/fema-rules-for-freelancers-india)
- [Inward Remittance RBI Guidelines Under FEMA](https://www.karboncard.com/blog/fema-guidelines-for-inward-remittance)
- [Inward Remittance Compliance India](https://razorpay.com/blog/compliance-guideline-for-inward-remittance/)
- [Realisation and Repatriation of Export Proceeds: 2026 Rules](https://razorpay.com/blog/realisation-repatriation-export-proceeds-rules/)

---

## 3. Jurisdiction Clauses -- Indian Courts & Arbitration

### Why This Matters

An Indian freelancer signing a contract with exclusive jurisdiction in "courts of Delaware" or "courts of London" is effectively waiving practical access to justice. Litigation in a foreign country is prohibitively expensive and logistically impossible for most Indian freelancers.

### Key Principles

1. **Seat of arbitration determines jurisdiction.** If seat is in India, Indian courts supervise. If seat is abroad, foreign courts supervise.
2. **Delhi and Mumbai** are the preferred seats for commercial arbitration in India -- they have specialized commercial courts and experienced judges.
3. **Bangalore** is also acceptable but less established for arbitration jurisprudence.
4. **Indian Arbitration and Conciliation Act 1996** governs domestic arbitration. Part I applies when seat is in India.
5. **An arbitration clause is independent** of the main contract -- even if the contract is void, the arbitration clause survives.

### Recommended Court Hierarchy for Indian Freelancers

| Preference | Jurisdiction Clause | Why |
|-----------|-------------------|-----|
| Best | "Courts of [Delhi/Mumbai], India" with Indian arbitration | Full Indian legal protection, established commercial courts |
| Acceptable | Indian arbitration with foreign governing law | At least disputes resolve in India, even if foreign substantive law applies |
| Risky | Foreign arbitration (Singapore, London) | Expensive for Indian party, but at least structured |
| Dangerous | Exclusive foreign court jurisdiction, no arbitration | Indian freelancer effectively has no practical recourse |

### Encodable Rules

```
RULE: jurisdiction_foreign_exclusive
IF governing law is NOT Indian
AND jurisdiction clause specifies exclusive foreign courts
AND no Indian arbitration option exists
THEN flag RED: "This contract gives exclusive jurisdiction to foreign courts with no Indian arbitration option. An Indian party would have no practical legal recourse -- foreign litigation is prohibitively expensive."

RULE: jurisdiction_no_clause
IF contract has no jurisdiction clause AND no arbitration clause
THEN flag YELLOW: "No jurisdiction or arbitration clause found. Under CPC Sections 16-20, jurisdiction defaults to where the cause of action arose, which creates uncertainty."

RULE: jurisdiction_foreign_arbitration
IF arbitration seat is outside India (Singapore, London, New York, etc.)
THEN flag YELLOW: "Arbitration seat is outside India. While structured, this means Indian courts cannot directly supervise the proceedings. Consider negotiating Indian seat."

RULE: jurisdiction_indian_seat
IF arbitration seat is in India (Delhi, Mumbai, Bangalore, etc.)
THEN flag GREEN: "Indian arbitration seat ensures Indian courts can supervise proceedings under the Arbitration and Conciliation Act, 1996."

RULE: section_28_limitation_waiver
IF clause shortens limitation period OR waives right to legal proceedings
THEN flag RED: "Under Indian Contract Act S.28, agreements restricting legal proceedings or shortening limitation periods are void."
```

**Source confidence:** HIGH for principles, MEDIUM for specific court recommendations.

**Sources:**
- [Delhi HC: Arbitration Clause Prevails Over Exclusive Jurisdiction Clause](https://www.livelaw.in/high-court/delhi-high-court/exclusive-jurisdiction-clause-subject-to-arbitration-clause-arbitration-clause-prevails-court-at-designated-seat-retains-jurisdiction-delhi-hc-293396)
- [Supreme Court Observer: Indian Courts Jurisdiction](https://www.scobserver.in/supreme-court-observer-law-reports-scolr/indian-courts-have-jurisdiction-where-arbitration-agreement-is-governed-by-indian-law/)
- [International Arbitration: India (ICLG)](https://iclg.com/practice-areas/international-arbitration-laws-and-regulations/india)

---

## 4. Non-Compete Enforceability in India

### The Core Rule: Section 27 Makes Most Non-Competes Void

Section 27 of the Indian Contract Act states: **"Every agreement by which anyone is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void."**

This is one of the most important things ClauseGuard can flag because foreign contracts routinely include non-compete clauses that are enforceable in the US/UK but void in India.

### Nuances

| Scenario | Enforceability in India | Notes |
|----------|------------------------|-------|
| **During employment/contract** | Generally enforceable | Negative covenants during active engagement are NOT restraint of trade under S.27 |
| **After termination** | Void, regardless of scope or duration | Delhi HC (Varun Tyagi v. Daffodil Software, June 2025) reaffirmed this emphatically |
| **Sale of business goodwill** | Enforceable within reasonable limits | The ONLY statutory exception to S.27 -- buyer can restrict seller from competing within reasonable geographic/time limits |
| **Non-solicitation (post-termination)** | Partially enforceable | Courts may uphold restrictions on soliciting specific clients or using confidential information, but not broad non-solicitation |
| **Confidentiality/NDA** | Enforceable | Not a restraint of trade -- protecting trade secrets is legitimate |
| **Garden leave (paid non-compete)** | May be enforceable | If the employer pays during the restriction period, courts are more sympathetic, but not guaranteed |

### Encodable Rules

```
RULE: noncompete_post_termination
IF clause restricts competition AFTER contract ends
AND this is NOT a sale-of-business context
THEN flag RED: "Non-compete clauses after termination are void under Indian Contract Act S.27. Delhi HC reaffirmed this in 2025 (Varun Tyagi v. Daffodil Software). This clause is unenforceable in India."

RULE: noncompete_during_contract
IF clause restricts competition DURING contract term
THEN flag YELLOW: "Non-compete during active engagement is generally enforceable in India, but verify scope is reasonable."

RULE: noncompete_vs_confidentiality
IF clause labeled "non-compete" actually restricts USE OF CONFIDENTIAL INFORMATION
THEN flag GREEN: "Confidentiality/NDA obligations are enforceable in India and are distinct from non-compete restrictions."

RULE: nonsolicitation_post_termination
IF clause restricts soliciting specific clients after termination
THEN flag YELLOW: "Post-termination non-solicitation clauses have uncertain enforceability in India. Courts may uphold narrow restrictions protecting specific client relationships or trade secrets, but broad non-solicitation is likely void under S.27."
```

**Source confidence:** HIGH -- well-established law with fresh 2025 judicial confirmation.

**Sources:**
- [Making Non-Compete Agreements Work in India: 2025 Update](https://www.aristolegal.co.in/post/making-non-compete-agreements-work-in-india-a-guide-for-employers-2025-update)
- [Delhi HC Varun Tyagi Judgment and S.27](https://www.mondaq.com/india/employee-rights-labour-relations/1643996/section-27-of-the-indian-contract-act-varun-tyagi-judgment-and-delhi-high-courts-ruling-on-non-compete-clauses)
- [Court Strikes Down Non-Compete: Law.asia](https://law.asia/limits-non-compete-clauses-india/)
- [Delhi HC: Post-Termination Non-Compete Unenforceable](https://www.transatlanticlaw.com/content/delhi-high-court-rules-post-termination-non-compete-clauses-unenforceable-in-employment-contracts/)

---

## 5. GST Implications for Freelancers with Foreign Clients

### Core Framework

Indian freelancers providing services to foreign clients are classified as **exporters of services** under GST law. Exports are **zero-rated** (0% GST) if specific conditions are met.

### Five Conditions for Export of Services (All Must Be Met)

1. Supplier of service is located in India
2. Recipient of service is located outside India
3. Place of supply of service is outside India
4. Payment is received in convertible foreign exchange (or INR as RBI permits)
5. Supplier and recipient are not merely establishments of the same person

### Critical 2026 Budget Change

**Section 13(8)(b) of the IGST Act has been deleted in Budget 2026.** Previously, this section forced Indian service providers acting as "intermediaries" for overseas clients to pay 18% GST with no refund route. The deletion unlocks zero-rated export status for freelancers who were previously caught by this provision (digital marketing, BPOs, IT freelancers). This is a major positive change.

### LUT vs. IGST Route

| Route | How It Works | Cash Flow Impact |
|-------|-------------|-----------------|
| **LUT (Letter of Undertaking)** | File LUT with GST authority, invoice without IGST, claim ITC refund | Best -- no GST outflow |
| **Pay IGST, claim refund** | Charge 18% IGST on invoice, file for refund after realization | Ties up cash for months |

### Encodable Rules

```
RULE: gst_export_conditions
IF contract is with foreign client
AND freelancer is Indian
THEN flag INFO: "This qualifies as export of services under GST. Ensure: (1) payment in convertible foreign exchange, (2) recipient located outside India, (3) file LUT for zero-rated supply."

RULE: gst_intermediary_risk
IF freelancer acts as intermediary between two foreign parties
THEN flag YELLOW: "Intermediary services had 18% GST liability under old S.13(8)(b). Budget 2026 deleted this provision, but verify your specific arrangement qualifies for zero-rated treatment."

RULE: gst_registration_threshold
IF contract value may push annual turnover above INR 20 lakhs (INR 10 lakhs for NE states)
THEN flag INFO: "GST registration is mandatory when aggregate turnover exceeds INR 20 lakhs. Freelancers exporting services should register voluntarily to claim ITC."

RULE: gst_reporting
IF contract involves export of services
THEN flag INFO: "Zero-rated exports must be reported in GSTR-1 (Table 6A) and GSTR-3B, even at 0% rate."
```

**Source confidence:** HIGH for core GST rules, MEDIUM for Budget 2026 S.13(8)(b) deletion (recent change, implementation pending).

**Sources:**
- [GST for Freelancers: Complete Guide 2025](https://jainanuragassociates.com/knowledge-center/gst-for-freelancers-foreign-clients-2025-update/)
- [GST on Export of Services: Zero-Tax Playbook](https://www.karboncard.com/blog/gst-on-export-of-services)
- [Section 13(8)(b) Deleted by Budget 2026](https://www.winvesta.in/blog/businesses/budget-2026-killed-section-138b-gst-on-exports)
- [GST for Freelancers: Registration, Rates, Returns](https://www.indiafilings.com/learn/gst-on-freelancers)

---

## 6. India-Specific Red Flags in Foreign Contracts

These are the practical patterns ClauseGuard should detect and flag.

### Critical Red Flags (RED)

| Red Flag | Why It Matters | Detection Pattern |
|----------|---------------|-------------------|
| **Foreign governing law + exclusive foreign jurisdiction + no arbitration** | Indian party has zero practical recourse | Look for "governed by laws of [non-India]" AND "exclusive jurisdiction of [non-India courts]" AND absence of arbitration clause |
| **Post-termination non-compete** | Void under S.27 but foreign clients include them routinely | Any restriction on competition/employment after contract ends |
| **IP assignment without consideration** | Void under S.25; "work made for hire" is a US concept, not Indian | "All IP shall vest in Client" without corresponding payment clause; "work made for hire" language |
| **Unilateral termination without notice** | Violates principles of natural justice and fairness | "Client may terminate at any time without cause" with no reciprocal right for freelancer |
| **Penalty clauses exceeding contract value** | Indian courts will reduce under S.73-74 | Liquidated damages > 2x contract value |
| **Waiver of right to sue** | Void under S.28 | "Contractor waives all claims" or "shall not institute proceedings" |

### Moderate Red Flags (YELLOW)

| Red Flag | Why It Matters | Detection Pattern |
|----------|---------------|-------------------|
| **Payment terms > 60 days** | Cash flow risk + approaches FEMA timeline concerns | Net-90, Net-120, or vague payment terms |
| **Payment in non-standard currency** | FEMA compliance risk | Currency other than USD, EUR, GBP, AUD, CAD |
| **Indemnification without cap** | Unlimited liability exposure | "Contractor shall indemnify and hold harmless... for all damages" without monetary cap |
| **Automatic renewal without opt-out** | May trap freelancer in unfavorable terms | Evergreen clauses, "auto-renew unless 90-day notice" |
| **Foreign arbitration seat** | Expensive for Indian party | Arbitration in Singapore, London, New York |
| **Scope creep language** | Undefined deliverables = free labor | "And other duties as assigned", "including but not limited to" in scope |
| **Moral rights waiver** | Indian Copyright Act preserves moral rights; waiver may not be enforceable | "Contractor waives all moral rights" |

### Informational Flags (GREEN/INFO)

| Flag | Why Mention It | Detection Pattern |
|------|---------------|-------------------|
| **Indian governing law + Indian arbitration** | Optimal for Indian party | "Governed by laws of India" + Indian arbitration seat |
| **Payment in INR via bank** | Simplest compliance | Payment terms mentioning INR + bank transfer |
| **Mutual termination clause** | Fair and balanced | Both parties have termination rights with notice |
| **Defined scope of work** | Reduces disputes | Clear deliverables list with acceptance criteria |

### Encodable Meta-Rule: India Risk Score

```
RULE: india_risk_score
CALCULATE score from:
  +3: Foreign exclusive jurisdiction, no arbitration
  +3: Post-termination non-compete
  +2: IP assignment without consideration
  +2: Waiver of right to sue
  +2: Penalty > 2x contract value
  +1: Payment terms > 60 days
  +1: Non-standard currency
  +1: Unlimited indemnification
  +1: Foreign arbitration seat
  +1: Scope creep language
  -1: Indian governing law
  -1: Indian arbitration seat
  -1: Mutual termination rights
  -1: Capped liability

IF score >= 6: OVERALL RED -- "This contract has significant risks for an Indian party."
IF score 3-5: OVERALL YELLOW -- "This contract has moderate risks. Negotiate key terms."
IF score <= 2: OVERALL GREEN -- "This contract appears reasonably fair for an Indian party."
```

**Source confidence:** HIGH for legal principles, MEDIUM for specific scoring weights (engineering judgment).

---

## 7. Legal Disclaimers Required for ClauseGuard

### The Core Problem

ClauseGuard provides analysis that looks like legal advice but must not be legal advice. India has specific regulatory concerns:

1. **Advocates Act, 1961** -- Only enrolled advocates can practice law in India. Providing "legal advice" without enrollment is illegal.
2. **Bar Council of India Rules** -- Prohibit non-advocates from giving legal opinions.
3. **IT Act 2000 Section 79** -- Intermediary safe harbour may apply if ClauseGuard is analyzed as an intermediary, but this is uncertain for AI-generated content (courts are questioning whether AI platforms can claim intermediary status when they generate the content).

### Required Disclaimer Elements

ClauseGuard MUST include these disclaimers:

```
MANDATORY DISCLAIMERS:

1. NOT LEGAL ADVICE:
   "ClauseGuard provides educational information about contract terms.
    This is NOT legal advice. ClauseGuard is not a law firm and does
    not provide legal services. No advocate-client relationship is
    created by using this tool."

2. CONSULT A LAWYER:
   "For important contracts, disputes, or legal decisions, consult a
    qualified advocate enrolled with the Bar Council of India."

3. NO LIABILITY:
   "ClauseGuard provides analysis on an 'as-is' basis. We do not
    guarantee accuracy, completeness, or applicability to your specific
    situation. You use this tool at your own risk."

4. JURISDICTION NOTICE:
   "Legal analysis is based on Indian law (Indian Contract Act 1872,
    FEMA, GST law, etc.) and may not apply to contracts governed by
    foreign law."

5. AI DISCLOSURE:
   "Analysis is generated by artificial intelligence. AI can make
    errors. Always verify important findings independently."
```

### Where to Place Disclaimers

| Placement | What | Why |
|-----------|------|-----|
| **Every analysis output** | Short disclaimer: "This is not legal advice. Consult a qualified advocate." | Must appear alongside every analysis |
| **Terms of Service** | Full disclaimer with all 5 elements | Legal protection layer |
| **Website footer** | "Not legal advice" badge | Persistent visibility |
| **SKILL.md header** | Disclaimer in system prompt | Claude users see it first |
| **MCP tool description** | Disclaimer in tool metadata | Developer-facing notice |
| **Before high-severity flags** | "This appears to be a significant legal issue. Consult an advocate." | Escalation trigger |

### Framing Rules for Analysis Output

```
DO:
  "This clause means..."
  "Under Indian law, this type of clause is typically..."
  "Courts have generally held that..."
  "Consider discussing this clause with a lawyer."

DO NOT:
  "You should not sign this."
  "This clause is illegal." (say "void under S.27" instead)
  "I recommend..."
  "You need to..."
  "Your legal position is..."
```

**Source confidence:** MEDIUM -- India has no specific "legal tech disclaimer" statute. Recommendations are based on Advocates Act, Bar Council Rules, general liability principles, and industry practice. The area is evolving.

**Sources:**
- [Legal Tech at a Turning Point: 2025 (NASSCOM)](https://community.nasscom.in/communities/tech-good/legal-tech-turning-point-what-2025-has-shown-us-so-far)
- [Product Liability India (ICLG)](https://iclg.com/practice-areas/product-liability-laws-and-regulations/india/amp)
- [IT Act 2000 Section 79 (Indian Kanoon)](https://indiankanoon.org/doc/844026/)

---

## 8. Data Privacy: DPDP Act 2023 Considerations

### Why This Matters for ClauseGuard

ClauseGuard processes contract text that may contain:
- Names of parties (personal data)
- Addresses, PAN numbers, GST numbers (sensitive identifiers)
- Financial terms (compensation amounts)
- Signatures

Under the Digital Personal Data Protection Act 2023 (DPDP Act), this constitutes processing of digital personal data.

### Compliance Timeline (Phased Implementation)

| Stage | Date | What Kicks In |
|-------|------|---------------|
| Stage 1 | November 13, 2025 | Data Protection Board of India constituted |
| Stage 2 | November 13, 2026 | Consent Manager registration |
| Stage 3 | May 13, 2027 | Full compliance: notice requirements, security protocols, breach notifications, Significant Data Fiduciary obligations |

### ClauseGuard's DPDP Obligations

| Obligation | Applies? | How to Comply |
|-----------|---------|---------------|
| **Consent** | YES -- if storing or processing identifiable data | Get consent before analysis; OR argue "voluntary provision for specified purpose" under S.4(2) |
| **Purpose limitation** | YES | Only use contract text for analysis, never for training, marketing, or resale |
| **Data minimization** | YES | Process in memory, do not persist contract text (stateless architecture helps here) |
| **Notice** | YES (Stage 3) | Inform users what data is collected, why, and how long it is retained |
| **Breach notification** | YES (Stage 3) | Notify Board and affected individuals of any data breach |
| **Data processor contract** | YES -- if using Anthropic API | Contract with Anthropic must comply with Rule 6 |
| **Cross-border transfer** | MAYBE | Contract text sent to Anthropic API (likely US servers) -- check if restricted country list applies |

### Stateless Architecture as Privacy Shield

The PROJECT.md specifies stateless, per-request analysis. This is a major privacy advantage:

```
PRIVACY-BY-DESIGN APPROACH:
1. Contract text is sent to Anthropic API for analysis
2. Analysis result is returned to user
3. No contract text is stored on ClauseGuard servers
4. No user history, no document storage
5. Only the Anthropic API temporarily processes the text

REMAINING RISK:
- Anthropic API may log/store request data per their data retention policy
- ClauseGuard must disclose this in privacy notice
- Anthropic's data processing agreement must comply with DPDP Act
```

### Penalties

Non-compliance penalties under DPDP Act are severe: up to **INR 250 crore (~$30M USD)** for serious violations.

### Encodable Compliance Checklist

```
CLAUSEGUARD DPDP COMPLIANCE:
[x] Stateless architecture -- no contract text stored (design decision)
[ ] Privacy notice on web app (implement by Stage 3: May 2027)
[ ] Consent mechanism for web app users (implement by Stage 2: Nov 2026)
[ ] Data processing agreement with Anthropic (verify covers DPDP Act)
[ ] Cross-border transfer assessment (Anthropic API server locations)
[ ] Breach notification process (implement by Stage 3: May 2027)
[ ] Cookie/analytics consent if using any tracking (implement before launch)
```

**Source confidence:** MEDIUM -- DPDP Act is law, but rules are phasing in. Full compliance obligations apply from May 2027. The cross-border transfer rules are not yet finalized.

**Sources:**
- [DPDP Act 2023 Official Text (MeitY)](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf)
- [India Passes DPDP Rules (Privacy World)](https://www.privacyworld.blog/2025/11/india-passes-the-digital-personal-data-protection-rules-ushering-in-a-new-digital-age-in-india/)
- [DPDP Act Compliance Guide 2026 (Atlas Systems)](https://www.atlassystems.com/blog/digital-personal-data-protection-act-india)
- [DPDP Act Section 4: Grounds for Processing](https://dpdpa.com/dpdpa2023/chapter-2/section4.html)
- [Hogan Lovells: DPDP Act Brought Into Force](https://www.hoganlovells.com/en/publications/indias-digital-personal-data-protection-act-2023-brought-into-force-)

---

## Summary: Priority Matrix for Implementation

### Must-Have Rules (Phase 1 -- Core Analysis)

| Rule Category | Count | Impact |
|--------------|-------|--------|
| Non-compete detection (S.27) | 3 rules | Highest value -- affects almost every foreign contract |
| Jurisdiction/arbitration flags | 4 rules | Second highest -- practical access to justice |
| IP assignment without consideration (S.25) | 1 rule | Common in freelancer contracts |
| Restraint of legal proceedings (S.28) | 1 rule | Protects fundamental rights |
| Legal disclaimers | 5 placements | Required for legal compliance |

### Should-Have Rules (Phase 2 -- Enhanced Analysis)

| Rule Category | Count | Impact |
|--------------|-------|--------|
| FEMA payment compliance | 4 rules | Important for cross-border contracts |
| GST export awareness | 4 rules | Tax compliance education |
| Penalty/damages reasonableness | 1 rule | Protects against overreach |
| India risk score | 1 composite rule | UX improvement |

### Nice-to-Have Rules (Phase 3 -- Comprehensive)

| Rule Category | Count | Impact |
|--------------|-------|--------|
| Scope creep detection | 1 rule | Quality of life |
| Moral rights waiver flag | 1 rule | Niche but important |
| Auto-renewal detection | 1 rule | Convenience |
| GST intermediary risk | 1 rule | Affected by Budget 2026 change |

### ClauseGuard's Own Compliance (Ongoing)

| Requirement | Deadline | Priority |
|------------|----------|----------|
| Legal disclaimers on all outputs | Launch day | CRITICAL |
| "Not legal advice" framing | Launch day | CRITICAL |
| DPDP Act privacy notice | Nov 2026 | HIGH |
| DPDP Act consent mechanism | Nov 2026 | HIGH |
| Anthropic data processing agreement | Before launch | HIGH |
| DPDP Act full compliance | May 2027 | MEDIUM (phased) |

---

## Confidence Assessment

| Topic | Confidence | Reason |
|-------|-----------|--------|
| Indian Contract Act provisions | HIGH | Statute unchanged since 1872, extensive case law |
| FEMA rules | HIGH | Well-documented, multiple authoritative sources |
| Non-compete enforceability | HIGH | Fresh 2025 Delhi HC judgment confirms position |
| Jurisdiction/arbitration | HIGH | Settled law under Arbitration Act 1996 |
| GST export rules | HIGH (core) / MEDIUM (S.13(8)(b) deletion) | Core rules stable; Budget 2026 change is recent |
| Legal disclaimers | MEDIUM | No specific legal tech statute; based on Advocates Act + general principles |
| DPDP Act compliance | MEDIUM | Law enacted, rules phasing in; cross-border rules not finalized |
| IT Act intermediary status | LOW | Courts actively questioning AI platforms' intermediary claims; area in flux |

## Gaps to Address in Later Phases

1. **Stamp duty on digital contracts** -- not researched; may matter for enforceability in certain states
2. **State-specific labor laws** -- India has state-level variations (e.g., Shops & Establishments Acts) that may affect freelancer classification
3. **TDS (Tax Deducted at Source)** on foreign payments -- relevant but outside core scope
4. **Consumer Protection Act 2019** -- may apply if ClauseGuard is considered a "service" with quality guarantees
5. **Specific Anthropic API terms** -- need to verify Anthropic's data processing policies against DPDP Act requirements
