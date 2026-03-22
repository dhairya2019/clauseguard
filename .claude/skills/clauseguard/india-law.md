# ClauseGuard: India-Specific Legal Rules Reference

> Referenced by SKILL.md for India-specific rule checks (Step 5).
> Structured as IF/THEN rules for Phase 2 MCP system prompt encoding.

---

## Section 1: Indian Contract Act 1872 -- Key Sections

| Section | Rule | When to Flag | Flag |
|---------|------|-------------|------|
| S.10 | Valid contract requires free consent, lawful consideration, lawful object | Contract missing consideration, consent issues, or unlawful object | HIGH -- "Contract may be void under S.10 if free consent, lawful consideration, or lawful object is absent." |
| S.14-18 | Free consent -- not by coercion, undue influence, fraud, misrepresentation | Take-it-or-leave-it terms with unconscionable clauses; one-sided terms imposed by dominant party | HIGH -- "Consent may not be 'free' under S.14-18. Unconscionable terms imposed by dominant party may be voidable." Case: *Central Inland Water Transport Corp v. Brojo Nath Ganguly* (1986) 3 SCC 156 -- SC held unconscionable employment terms void as violating Art. 14. [VERIFIED] |
| S.23 | Unlawful consideration or object -- agreements violating public policy are void | Clauses requiring illegal acts, agreements against public policy, unlawful consideration | HIGH -- "Agreement with unlawful consideration or object is void under S.23." Case: *Gherulal Parakh v. Mahadeodas Maiya* (1959) AIR SC 781. [VERIFIED] |
| S.25 | Agreement without consideration is void | IP assignment or work assignment with no explicit payment/compensation mentioned | HIGH -- "IP assignment without stated consideration may be void under S.25. Ensure contract specifies compensation for IP transfer." |
| S.27 | Post-termination non-compete is void | Clause restricts competition AFTER contract ends (and is NOT a sale-of-business scenario) | HIGH -- "Void under Indian Contract Act S.27. Delhi HC reaffirmed in 2025 (Varun Tyagi v. Daffodil Software). This clause is unenforceable in India." |
| S.28 | Restriction on legal proceedings is void | Clause waives right to sue, shortens limitation period, or mandates exclusive foreign jurisdiction with no Indian recourse | HIGH -- "Void under S.28. Clauses restricting legal proceedings are unenforceable in India." |
| S.29 | Void for uncertainty | Vague scope of work, undefined deliverables, ambiguous obligations | MEDIUM -- "Vague obligations may be unenforceable under S.29. Both parties benefit from clearly defined scope and deliverables." |
| S.73 | Reasonable compensation for breach | Liquidated damages or penalty clause exceeding 2x contract value | MEDIUM -- "Disproportionate penalties can be reduced by Indian courts under S.73. Courts award only reasonable compensation." |
| S.74 | Stipulated amount is upper limit, not automatic entitlement | Penalty clauses claiming exact stipulated amount regardless of actual loss | MEDIUM -- "Stipulated damages are an upper limit, not automatic. Courts assess reasonable compensation under S.74." |

### Expanded Case Citations

**S.27 (Non-Compete):**
- *Superintendence Co. of India v. Krishan Murgai* (1981) 2 SCC 246 -- SC foundational ruling on S.27 scope; post-termination non-compete void even if reasonable. [VERIFIED]
- *Percept D'Mark v. Zaheer Khan* (2006) 4 SCC 227 -- SC confirmed post-employment non-compete void; negative covenant after termination of contract is restraint of trade. [VERIFIED]
- *Varun Tyagi v. Daffodil Software* (Delhi HC 2025, FAO 167/2025) -- Delhi HC reaffirmed S.27 emphatically in modern gig-economy context. [CITED]

**S.28 (Restriction on Legal Proceedings):**
- *Oriental Insurance v. Sanjesh* (SC 2022) -- Time-limit conditions on claims void under S.28; cannot contractually shorten limitation period. [CITED]
- *Rakesh Kumar Verma v. HDFC Bank* (SC 2025, INSC 691) -- Exclusive jurisdiction clauses valid if they don't remove right to sue entirely; S.28 only voids clauses that absolutely restrict legal proceedings. [CITED]

**S.73-74 (Penalties and Compensation):**
- *Kailash Nath Associates v. DDA* (2015) 4 SCC 136 -- SC: reasonable compensation shall not exceed stipulated amount; court must assess actual loss. [VERIFIED]
- *Fateh Chand v. Balkishan Dass* (1963) AIR SC 1405 -- SC: stipulated amounts are upper limit, not automatic entitlement; court has jurisdiction to award lesser amount. [VERIFIED]
- *ONGC v. Saw Pipes* (2003) 5 SCC 705 -- SC guidelines: S.74 allows reasonable compensation; party claiming liquidated damages must show loss was foreseeable and reasonable. [VERIFIED]

---

## Section 2: Non-Compete Nuances (S.27)

This is the most critical India-specific analysis area. The skill MUST distinguish these five scenarios:

| Scenario | Enforceability in India | Flag | Notes |
|----------|------------------------|------|-------|
| Post-termination non-compete | Void | HIGH | Regardless of duration, geography, or scope. S.27 is absolute for service contracts. Delhi HC (Varun Tyagi v. Daffodil Software, June 2025) reaffirmed emphatically. [CITED] Bombay HC and other High Courts consistent. SC confirmed in *Percept D'Mark v. Zaheer Khan* (2006). [VERIFIED] |
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

## Section 3: Copyright Act 1957

Applies to contracts involving creative work, software development, content creation, and IP assignments by Indian parties.

| Section | Rule | When to Flag | Flag |
|---------|------|-------------|------|
| S.17 | Author is first owner of copyright (exceptions: employer, commissioner) | Blanket IP assignment clauses that override default first-ownership without explicit consideration | HIGH -- "Under Copyright Act S.17, the author is the first owner of copyright. Blanket IP grabs require explicit written assignment with consideration." Case: *IPRS v. Eastern Indian Motion Pictures* (SC). [VERIFIED] |
| S.17(c) | Employer owns work created under contract of service (employment) | Misapplying employer ownership to independent contractor/freelancer work | MEDIUM -- "S.17(c) applies ONLY to employees under contract of service, NOT to independent contractors/freelancers. If party is a freelancer, author retains copyright unless explicitly assigned." |
| S.57 | Moral rights (paternity and integrity) are not assignable | Contract requires waiver of moral rights (attribution, integrity of work) | MEDIUM -- "Moral rights waiver may not be enforceable in India under Copyright Act S.57. Moral rights (right to claim authorship, right against distortion) cannot be assigned or waived." |

### Copyright Detection Logic

```
IF contract assigns copyright:
  IF party is employee (contract of service):
    -> S.17(c) applies, employer likely owns work product
    -> MEDIUM (verify scope is reasonable)
  ELSE IF party is independent contractor:
    -> S.17 default: author owns copyright
    -> Assignment requires explicit written agreement
    -> IF assignment without stated consideration -> HIGH (S.25 + S.17)
  IF contract waives moral rights:
    -> MEDIUM (questionable enforceability under S.57)
```

---

## Section 4: Arbitration and Conciliation Act 1996

Applies when contracts include dispute resolution clauses. Critical for evaluating arbitration fairness and enforceability.

| Provision | Rule | When to Flag | Flag |
|-----------|------|-------------|------|
| S.7 | Arbitration agreement must be in writing | Oral arbitration agreements or missing written arbitration clause | INFO -- "S.7 requires arbitration agreement to be in writing. Note if arbitration clause exists and is properly documented." |
| S.11 | Appointment of arbitrators -- unilateral appointment challengeable | Only one party appoints or selects the arbitrator | MEDIUM -- "Unilateral arbitrator appointment by one party is challengeable under S.11. Both parties should have equal say in arbitrator selection." |
| Part I vs Part II | Part I applies when seat is India; Part II for foreign awards under New York Convention | Seat of arbitration is outside India for an Indian party | INFO -- "Part I applies when seat is in India. Part II (New York Convention) applies to foreign-seated arbitration. Foreign seat increases cost for Indian party." |
| S.12(5) + Schedule VII | Grounds for challenging arbitrator independence and impartiality | Arbitrator has relationship to one party (employee, advisor, prior involvement) | MEDIUM -- "Arbitrator independence may be challenged under S.12(5) read with Schedule VII if arbitrator has prior relationship with one party." |

### Arbitration Detection Logic

```
IF contract has arbitration clause:
  IF seat is India:
    -> Part I of Arbitration Act applies
    -> Check if arbitrator appointment is mutual -> if not, MEDIUM
  IF seat is foreign:
    -> Part II applies, awards enforceable under New York Convention
    -> MEDIUM (cost concern for Indian party)
  IF no written arbitration agreement:
    -> INFO (may default to court litigation)
  IF one party appoints sole arbitrator:
    -> MEDIUM (challengeable under S.12)
```

---

## Section 5: FEMA (Foreign Exchange Management Act)

Applies when an Indian party (freelancer, consultant, company) works with a foreign client. These rules govern how payment flows into India.

| Rule | Detection Pattern | Flag |
|------|-------------------|------|
| Payment must flow through AD Category-I banks | Payment via cryptocurrency, informal channels (hawala), non-RBI-approved platforms, direct cash transfers | HIGH -- "FEMA requires all foreign exchange transactions through RBI-authorized dealer (AD Category-I) banks. Non-compliance penalties up to 3x the amount involved. Ensure contract specifies payment through authorized banking channels." |
| Freely convertible currency required | Payment denominated in non-standard currency (not USD, EUR, GBP, AUD, CAD, JPY, CHF, SGD, or other RBI-approved freely convertible currencies) | MEDIUM -- "Verify this currency is RBI-approved for foreign remittances. Major freely convertible currencies (USD, EUR, GBP) are preferred for compliance simplicity." |
| 15-month repatriation deadline | Payment terms exceeding 12 months from date of service delivery or invoice | MEDIUM -- "RBI mandates that export proceeds (including service exports) must be realized within 15 months of the date of invoice (extended from 9 months in 2025). Payment terms that push realization beyond 15 months risk FEMA non-compliance. Negotiate shorter payment cycles." |
| FEMA S.13 penalties | Any FEMA non-compliance detected in contract terms | HIGH -- "FEMA S.13 penalties: up to 3x the amount involved; INR 2 lakh if amount not quantifiable; INR 5,000/day for continuing default. Non-compliance carries severe financial consequences." |
| Purpose codes mandatory for inward remittance | Contract has no clear service description or deliverable type that maps to an RBI purpose code | INFO -- "Ensure the contract service description maps to a recognized RBI purpose code for inward remittance (e.g., P0802 for software services, P0805 for business consulting). This is required by the AD bank when processing incoming foreign payments." |

### FEMA Detection Logic

```
IF contract involves Indian party + foreign client:
  CHECK payment method:
    IF crypto/informal/unapproved platform -> HIGH (FEMA violation)
    -> Note: FEMA S.13 penalties up to 3x amount involved
  CHECK currency:
    IF not in [USD, EUR, GBP, INR, AUD, CAD, JPY, CHF, SGD] -> MEDIUM (verify)
  CHECK payment timeline:
    IF payment terms > 12 months from delivery -> MEDIUM (15-month rule, extended from 9 months in 2025)
  CHECK service description:
    IF vague or missing -> INFO (purpose code mapping needed)
```

---

## Section 6: Jurisdiction Preference Hierarchy

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

## Section 7: Employment & Labor Law

Applies to employment agreements, service bonds, and engagement contracts with Indian parties.

| Provision | Rule | Case Citation | Flag |
|-----------|------|---------------|------|
| Employment bond / service bond | Liquidated damages in employment bonds must be reasonable; unreasonable bonds may be struck down | *Vijaya Bank v. Prashant Narnaware* (SC 2025, INSC 691) -- employment bonds with liquidated damages upheld if reasonable. [CITED] | MEDIUM -- "Employment bond enforceability depends on reasonableness of amount and duration." |
| Garden leave | Paid non-compete during notice period; no definitive Indian case law | No definitive Indian ruling; enforceability stronger if employer pays full salary during restriction. [CITED] | MEDIUM -- "Garden leave enforceability in India is uncertain. Paid restriction during notice period has stronger basis than unpaid." |
| Probation termination | 3-6 months standard probation; employer can typically terminate with minimal notice | General employment law principle. | INFO -- "Standard probation period is 3-6 months. Flag if probation exceeds 6 months." |
| Restraint during employment vs after | Reasonable during-employment restrictions are valid; post-termination restrictions void under S.27 | *Niranjan Shankar Golikari v. Century Spinning & Mfg. Co.* (1967) 2 SCR 378 -- SC upheld reasonable during-employment restrictions. [VERIFIED] | Reinforces S.27 nuance: during-engagement OK, post-termination void. |

### Employment Detection Logic

```
IF contract is employment agreement:
  IF contains service/employment bond:
    IF bond amount > 12 months' salary OR duration > 2 years:
      -> HIGH (likely unreasonable, may be struck down)
    ELSE:
      -> MEDIUM (enforceable if reasonable per Vijaya Bank ruling)
  IF contains garden leave clause:
    IF paid during restriction:
      -> MEDIUM (stronger enforceability)
    ELSE:
      -> HIGH (unpaid garden leave is effectively post-termination non-compete -> S.27)
  IF contains probation terms:
    -> INFO (standard; flag if probation > 6 months)
  IF contains non-compete:
    -> Apply S.27 analysis from Section 2 (same rules apply to employment)
```

---

## Section 8: GST for Cross-Border Services

Applies when Indian parties provide services to foreign clients. Critical for freelancers, consultants, and IT service exporters.

| Rule | Detail | When to Flag | Flag |
|------|--------|-------------|------|
| Zero-rated export of services | Must meet 5 conditions: (1) supplier in India, (2) recipient outside India, (3) place of supply outside India, (4) payment in convertible foreign exchange or INR permitted by RBI, (5) supplier and recipient not merely establishments of same person | Contract for cross-border services -- verify all 5 conditions | INFO -- "Verify all 5 conditions for 0% GST on service exports. Failure to meet any condition means 18% GST applies." |
| S.13(8)(b) deletion (Budget 2025-26) | Intermediary services no longer forced to pay 18% GST; Indian intermediaries acting for foreign principals can now claim zero-rated export | Indian party acting as intermediary or agent for foreign principal | INFO -- "Recent change (Budget 2025-26): intermediary services may now qualify for zero-rated export after S.13(8)(b) deletion." |
| GST registration threshold | INR 20 lakh aggregate turnover (INR 10 lakh for NE states and special category states) | Freelancer or small service provider with turnover discussion or high-value contract | INFO -- "Freelancers below INR 20 lakh threshold may not need GST registration for domestic services, but cross-border service exports have different rules regarding LUT (Letter of Undertaking) requirement." |

### GST Detection Logic

```
IF contract involves Indian party providing services to foreign client:
  CHECK if 5 conditions for zero-rated export are met:
    -> INFO (list conditions in analysis)
  IF Indian party is acting as intermediary:
    -> INFO (note S.13(8)(b) deletion, may qualify for zero-rating)
  IF aggregate turnover discussed or payment terms suggest high volume:
    -> INFO (GST registration may be required)
```

---

## Section 9: Quick Reference -- India Risk Modifiers

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
| 9 | Employment bond with unreasonable liquidated damages (>12 months salary) | Minimum MEDIUM | SC per Vijaya Bank ruling |
| 10 | Moral rights waiver in IP assignment | Add warning note | Copyright Act S.57 |
| 11 | Unilateral arbitrator appointment | Minimum MEDIUM | Arbitration Act S.12 |
| 12 | Copyright assignment by freelancer without explicit consideration | Always HIGH | Copyright Act S.17 + Contract Act S.25 |

### Modifier Application Logic

```
AFTER base risk classification (from clause-patterns.md):
  FOR EACH clause:
    APPLY modifiers 1-12 in order
    IF modifier triggers:
      IF modifier says "Always HIGH" -> override to HIGH
      IF modifier says "Minimum MEDIUM" -> set to MEDIUM if currently LOW
      IF modifier says "Add warning" -> append India-specific warning note
```

---

*Reference file for ClauseGuard SKILL.md -- do not use as standalone document.*
*All rules structured as IF/THEN for Phase 2 MCP system prompt encoding.*
*Legal references are for informational analysis only -- not legal advice.*
