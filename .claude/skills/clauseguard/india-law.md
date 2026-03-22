# ClauseGuard: India-Specific Legal Rules Reference

> Referenced by SKILL.md for India-specific rule checks (Step 5).
> Structured as IF/THEN rules for Phase 2 MCP system prompt encoding.

---

## Section 1: Indian Contract Act 1872 -- Key Sections

| Section | Rule | When to Flag | Flag |
|---------|------|-------------|------|
| S.27 | Post-termination non-compete is void | Clause restricts competition AFTER contract ends (and is NOT a sale-of-business scenario) | HIGH -- "Void under Indian Contract Act S.27. Delhi HC reaffirmed in 2025 (Varun Tyagi v. Daffodil Software). This clause is unenforceable in India." |
| S.28 | Restriction on legal proceedings is void | Clause waives right to sue, shortens limitation period, or mandates exclusive foreign jurisdiction with no Indian recourse | HIGH -- "Void under S.28. Clauses restricting legal proceedings are unenforceable in India." |
| S.25 | Agreement without consideration is void | IP assignment or work assignment with no explicit payment/compensation mentioned | HIGH -- "IP assignment without stated consideration may be void under S.25. Ensure contract specifies compensation for IP transfer." |
| S.73-74 | Penalties must be reasonable | Liquidated damages or penalty clause exceeding 2x contract value | MEDIUM -- "Disproportionate penalties can be reduced by Indian courts under S.73-74. Courts award only reasonable compensation, not the stipulated penalty." |
| S.29 | Void for uncertainty | Vague scope of work, undefined deliverables, ambiguous obligations | MEDIUM -- "Vague obligations may be unenforceable under S.29. Both parties benefit from clearly defined scope and deliverables." |

---

## Section 2: Non-Compete Nuances (S.27)

This is the most critical India-specific analysis area. The skill MUST distinguish these five scenarios:

| Scenario | Enforceability in India | Flag | Notes |
|----------|------------------------|------|-------|
| Post-termination non-compete | Void | HIGH | Regardless of duration, geography, or scope. S.27 is absolute for service contracts. Delhi HC (Varun Tyagi v. Daffodil Software, June 2025) reaffirmed emphatically. Bombay HC and other High Courts consistent. |
| During-engagement non-compete | Generally enforceable | MEDIUM | Negative covenants during active engagement are NOT restraint of trade under S.27. Courts distinguish between "during service" and "after service" restrictions. Verify the scope is reasonable and proportionate to the engagement. |
| Non-solicitation (specific clients) | Uncertain, partially enforceable | MEDIUM | Indian courts may uphold narrow restrictions protecting specific client relationships built during engagement. Broad non-solicitation covering "all contacts" is likely void as disguised non-compete. The line between enforceable non-solicitation and void non-compete is fact-specific. |
| Confidentiality / NDA obligations | Enforceable | LOW | Protecting trade secrets and confidential information is NOT a restraint of trade. Confidentiality obligations survive termination. This is distinct from non-compete -- restricting disclosure is not the same as restricting competition. |
| Sale-of-business non-compete | Enforceable within reasonable limits | LOW | The ONLY statutory exception to S.27. When a person sells the goodwill of a business, they may agree not to carry on a similar business within specified local limits for a reasonable time. Verify: (1) genuine sale of business/goodwill, (2) geographic limits are specified, (3) time limits are reasonable. |

### Detection Logic for S.27 Analysis

```
IF clause contains competition restriction:
  IF restriction applies AFTER termination/expiration:
    IF sale-of-business context:
      -> LOW (verify geographic and time limits are reasonable)
    ELSE:
      -> HIGH (void under S.27, unenforceable)
  ELSE IF restriction applies DURING engagement:
    IF scope is reasonable (named competitors, similar services):
      -> MEDIUM (enforceable but verify scope)
    ELSE IF scope is unrestricted ("any business", "any field"):
      -> HIGH (may be challenged even during engagement)
  
IF clause contains solicitation restriction:
  IF narrow (specific named clients from the engagement):
    -> MEDIUM (may be enforceable)
  ELSE IF broad ("all contacts", "any customer"):
    -> HIGH (likely void as disguised non-compete)

IF clause contains only confidentiality/NDA:
  -> LOW (enforceable, not restraint of trade)
```

---

## Section 3: FEMA (Foreign Exchange Management Act)

Applies when an Indian party (freelancer, consultant, company) works with a foreign client. These rules govern how payment flows into India.

| Rule | Detection Pattern | Flag |
|------|-------------------|------|
| Payment must flow through AD Category-I banks | Payment via cryptocurrency, informal channels (hawala), non-RBI-approved platforms, direct cash transfers | HIGH -- "FEMA requires all foreign exchange transactions through RBI-authorized dealer (AD Category-I) banks. Non-compliance penalties up to 3x the amount involved. Ensure contract specifies payment through authorized banking channels." |
| Freely convertible currency required | Payment denominated in non-standard currency (not USD, EUR, GBP, AUD, CAD, JPY, CHF, SGD, or other RBI-approved freely convertible currencies) | MEDIUM -- "Verify this currency is RBI-approved for foreign remittances. Major freely convertible currencies (USD, EUR, GBP) are preferred for compliance simplicity." |
| 15-month repatriation deadline | Payment terms exceeding 12 months from date of service delivery or invoice | MEDIUM -- "RBI mandates that export proceeds (including service exports) must be realized within 15 months of the date of invoice. Payment terms that push realization beyond 15 months risk FEMA non-compliance. Negotiate shorter payment cycles." |
| Purpose codes mandatory for inward remittance | Contract has no clear service description or deliverable type that maps to an RBI purpose code | INFO -- "Ensure the contract service description maps to a recognized RBI purpose code for inward remittance (e.g., P0802 for software services, P0805 for business consulting). This is required by the AD bank when processing incoming foreign payments." |

### FEMA Detection Logic

```
IF contract involves Indian party + foreign client:
  CHECK payment method:
    IF crypto/informal/unapproved platform -> HIGH (FEMA violation)
  CHECK currency:
    IF not in [USD, EUR, GBP, INR, AUD, CAD, JPY, CHF, SGD] -> MEDIUM (verify)
  CHECK payment timeline:
    IF payment terms > 12 months from delivery -> MEDIUM (15-month rule)
  CHECK service description:
    IF vague or missing -> INFO (purpose code mapping needed)
```

---

## Section 4: Jurisdiction Preference Hierarchy

For Indian parties, jurisdiction and governing law significantly affect the practical enforceability and cost of dispute resolution.

| Rank | Pattern | Flag | Explanation |
|------|---------|------|-------------|
| 1 (Dangerous) | Foreign governing law + exclusive foreign courts + no arbitration clause | HIGH | "No practical recourse for Indian party. Litigating in foreign courts requires foreign lawyers, travel, and compliance with foreign procedural rules. Costs often exceed the contract value. Consider negotiating Indian arbitration as an alternative." |
| 2 (Risky) | Foreign arbitration seat (Singapore, London, New York, Hong Kong) | MEDIUM | "While international arbitration awards are enforceable in India under the New York Convention, the cost of arbitrating abroad is significant (venue fees, travel, foreign counsel). Consider negotiating an Indian arbitration seat (Mumbai, Delhi, Bangalore) with institutional rules (MCIA, DIAC)." |
| 3 (Uncertain) | No jurisdiction or governing law clause at all | MEDIUM | "Creates uncertainty about where and how disputes are resolved. In India, defaults to CPC Sections 16-20 based on where the defendant resides or where the cause of action arose. Explicitly specifying jurisdiction and governing law protects both parties." |
| 4 (Optimal) | Indian governing law + Indian arbitration seat (Mumbai, Delhi, Bangalore) | LOW | "Optimal for Indian party. Indian courts supervise arbitration under the Arbitration and Conciliation Act, 1996. Institutional arbitration (MCIA Mumbai, DIAC Delhi) provides structured, cost-effective dispute resolution." |

### Jurisdiction Detection Logic

```
IF governing law is foreign (not Indian):
  IF exclusive foreign court jurisdiction + no arbitration:
    -> HIGH (no practical recourse)
  IF foreign arbitration seat:
    -> MEDIUM (expensive but enforceable)

IF no governing law or jurisdiction clause:
  -> MEDIUM (uncertainty)

IF Indian governing law + Indian arbitration:
  -> LOW (optimal)

IF Indian governing law + Indian courts:
  -> LOW (acceptable)
```

---

## Section 5: Quick Reference -- India Risk Modifiers

These rules ALWAYS apply on top of the base risk classification from clause-patterns.md. They are India-specific overrides.

| # | Rule | Effect | Authority |
|---|------|--------|-----------|
| 1 | Any post-termination non-compete | Always HIGH, regardless of other factors | S.27, Indian Contract Act 1872 |
| 2 | Foreign exclusive jurisdiction + no arbitration | Always HIGH | S.28 + practical enforceability |
| 3 | IP assignment without stated consideration | Always HIGH | S.25, Indian Contract Act 1872 |
| 4 | Waiver of right to sue or shortened limitation | Always HIGH | S.28, Indian Contract Act 1872 |
| 5 | Payment through non-banking channels (crypto, hawala) | Always HIGH | FEMA, RBI regulations |
| 6 | Penalty clause > 2x contract value | Minimum MEDIUM (bump up if currently LOW) | S.73-74, Indian Contract Act 1872 |
| 7 | Payment terms > 12 months from delivery | Add FEMA warning note | RBI repatriation rules |
| 8 | No governing law clause in cross-border contract | Add jurisdiction warning note | CPC S.16-20 default rules |

### Modifier Application Logic

```
AFTER base risk classification (from clause-patterns.md):
  FOR EACH clause:
    APPLY modifiers 1-8 in order
    IF modifier triggers:
      IF modifier says "Always HIGH" -> override to HIGH
      IF modifier says "Minimum MEDIUM" -> set to MEDIUM if currently LOW
      IF modifier says "Add warning" -> append India-specific warning note
```

---

*Reference file for ClauseGuard SKILL.md -- do not use as standalone document.*
*All rules structured as IF/THEN for Phase 2 MCP system prompt encoding.*
*Legal references are for informational analysis only -- not legal advice.*
