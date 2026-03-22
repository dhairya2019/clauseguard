# Architecture Patterns

**Domain:** AI-powered contract analysis web app (freemium, India-focused)
**Researched:** 2026-03-22

## Recommended Architecture

```
                    +---------------------------+
                    |    Next.js App Router      |
                    |  (Vercel Edge / Node.js)   |
                    +---------------------------+
                    |                           |
          +---------+--------+       +---------+---------+
          | Landing Page     |       | Analysis App      |
          | (SSR, SEO-opt)   |       | (Client-side)     |
          +------------------+       +-------------------+
                                     |                   |
                              +------+------+    +-------+------+
                              | /api/analyze |    | /api/payment |
                              | Route Handler|    | Route Handler|
                              +------+------+    +-------+------+
                                     |                   |
                              +------+------+    +-------+------+
                              | Anthropic   |    | Razorpay     |
                              | Claude API  |    | API          |
                              +-------------+    +--------------+
                                     |
                              +------+------+
                              | Upstash     |
                              | Redis       |
                              | (rate limit)|
                              +-------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| Landing Page (`/`) | SEO, conversion, explain product | Analysis Page |
| Analysis Page (`/analyze`) | Contract input, results display, streaming UI | API Route Handlers |
| `/api/analyze` Route Handler | Rate limit check, Claude API call, stream response | Upstash Redis, Anthropic API |
| `/api/payment/create-order` | Create Razorpay order | Razorpay API |
| `/api/payment/verify` | Verify payment signature, unlock quota | Razorpay API, Upstash Redis |
| Upstash Redis | Store usage counts per fingerprint, payment status | All API routes |

### Data Flow

1. User pastes contract text on `/analyze` page
2. Client sends POST to `/api/analyze` with contract text
3. Route handler checks rate limit (Upstash Redis, keyed by IP + fingerprint)
4. If under limit: call Claude API via Vercel AI SDK `streamText`, stream response back
5. If over limit: return 429 with upgrade prompt
6. Client renders streamed analysis clause-by-clause as tokens arrive
7. After payment, Redis quota resets for that user's fingerprint

---

## Pattern 1: Streaming AI Responses via Vercel AI SDK

**Confidence:** HIGH (official Vercel docs, multiple tutorials, active SDK)

Use Vercel AI SDK (v6+) with Route Handlers, not Server Actions, for the analysis endpoint. Route Handlers give you full HTTP control needed for streaming, status codes, and rate limiting headers.

### API Route: `/app/api/analyze/route.ts`

```typescript
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { ratelimit } from "@/lib/ratelimit";
import { getFingerprint } from "@/lib/fingerprint";

export const maxDuration = 60; // Claude can take time for long contracts

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { contractText, fingerprint } = await req.json();

  // Rate limit check (see Pattern 3)
  const key = `${ip}:${fingerprint}`;
  const { success, remaining } = await ratelimit.limit(key);

  if (!success) {
    return new Response(
      JSON.stringify({ error: "limit_reached", remaining: 0 }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `You are a contract analysis expert. Analyze the contract clause by clause.
For each clause, provide:
- A brief summary
- Risk level: LOW, MEDIUM, HIGH, or CRITICAL
- Explanation of why this risk level
- Suggested modification if risk is MEDIUM or above

Format each clause analysis as a JSON object on its own line:
{"clause": "...", "risk": "LOW|MEDIUM|HIGH|CRITICAL", "summary": "...", "explanation": "...", "suggestion": "..."}`,
    prompt: contractText,
  });

  return result.toDataStreamResponse();
}
```

### Client Side: `useChat` or `useCompletion` Hook

```typescript
import { useCompletion } from "@ai-sdk/react";

export function ContractAnalyzer() {
  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/analyze",
  });

  const handleAnalyze = async (contractText: string) => {
    await complete(contractText);
  };

  // Parse streamed completion into clause objects as they arrive
  const clauses = parseStreamedClauses(completion);

  return (
    // Render clauses progressively as they stream in
  );
}
```

**Why Route Handlers over Server Actions:**
- Server Actions are for mutations (form submissions, data writes). The analysis endpoint is a query that returns a streaming response.
- Route Handlers give explicit control over HTTP status codes (429 for rate limit), headers (rate limit metadata), and streaming.
- External services (future mobile app, API access) can call Route Handlers directly.

---

## Pattern 2: Freemium Rate Limiting Without Accounts

**Confidence:** MEDIUM (well-established patterns, but no single canonical approach)

Use a layered approach: IP address + browser fingerprint + localStorage counter. No approach is bulletproof without accounts, but this combination handles 95% of casual users.

### Layer 1: Upstash Redis (Server-side, authoritative)

```typescript
// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(3, "30 d"), // 3 requests per 30 days
  prefix: "clauseguard",
  analytics: true,
});
```

**Why Upstash Redis:**
- Free tier: 10,000 commands/day, 256MB storage. More than enough for early-stage.
- HTTP-based, works on Vercel Edge Runtime (no TCP connections needed).
- Built-in rate limiting SDK with sliding window, fixed window, token bucket algorithms.
- Analytics dashboard to see usage patterns.

### Layer 2: Browser Fingerprint (Client-side, sent to server)

Use the open-source FingerprintJS library (MIT-licensed core). It generates a visitor ID from browser attributes (canvas, WebGL, fonts, screen, etc.). About 40-60% accuracy for the open-source version, but combined with IP it catches most users.

```typescript
// lib/fingerprint.ts (client-side)
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export async function getVisitorId(): Promise<string> {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId;
}
```

### Layer 3: localStorage Counter (Client-side UX, not security)

```typescript
// Show remaining count in UI instantly without server round-trip
const STORAGE_KEY = "cg_usage";
export function getLocalUsage(): number {
  return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
}
export function incrementLocalUsage(): void {
  localStorage.setItem(STORAGE_KEY, String(getLocalUsage() + 1));
}
```

**The server (Upstash) is the source of truth.** localStorage is only for instant UI feedback ("2 of 3 free analyses remaining"). A savvy user clearing localStorage still hits the server-side limit.

### Handling Edge Cases

| Scenario | What Happens |
|----------|--------------|
| User clears cookies/localStorage | Server-side limit still enforced via IP + fingerprint |
| User uses VPN/new IP | Fingerprint still matches (partially). Accept some leakage -- it's freemium, not Fort Knox |
| User uses incognito | FingerprintJS still works in incognito. IP still matches. |
| User uses different device | Gets 3 more free analyses. This is acceptable leakage for freemium. |

**Philosophy:** The goal is not to prevent all abuse. The goal is to make the free tier convenient for honest users and mildly inconvenient for cheapskates. Anyone determined enough to bypass will just use a competitor, not pay you. Focus on conversion, not enforcement.

---

## Pattern 3: Razorpay Payment Integration

**Confidence:** HIGH (well-documented, dominant in India)

Razorpay is the correct choice for India. Zero setup fee, 2% per transaction + GST, supports UPI (which is how most Indians pay online).

### Architecture: Three API Routes

```
/api/payment/create-order   POST  -> Creates Razorpay order
/api/payment/verify          POST  -> Verifies payment signature
/api/payment/status          GET   -> Checks if user has paid (by fingerprint)
```

### Order Creation

```typescript
// app/api/payment/create-order/route.ts
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  const { fingerprint } = await req.json();

  const order = await razorpay.orders.create({
    amount: 9900, // INR 99 in paise
    currency: "INR",
    notes: { fingerprint },
  });

  return Response.json({ orderId: order.id, amount: order.amount });
}
```

### Client-Side Checkout

```typescript
// Load Razorpay script dynamically
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    document.body.appendChild(script);
  });
};

const handlePayment = async () => {
  await loadRazorpay();
  const { orderId, amount } = await fetch("/api/payment/create-order", {
    method: "POST",
    body: JSON.stringify({ fingerprint }),
  }).then((r) => r.json());

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount,
    currency: "INR",
    name: "ClauseGuard",
    description: "Unlimited Contract Analysis",
    order_id: orderId,
    handler: async (response: any) => {
      // Verify on server
      await fetch("/api/payment/verify", {
        method: "POST",
        body: JSON.stringify({ ...response, fingerprint }),
      });
    },
    prefill: { email: "", contact: "" },
    theme: { color: "#1e40af" }, // Match brand blue
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};
```

### Verification + Quota Unlock

```typescript
// app/api/payment/verify/route.ts
import crypto from "crypto";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function POST(req: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, fingerprint } =
    await req.json();

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Mark fingerprint as paid in Redis (no expiry = lifetime access for this tier)
  await redis.set(`clauseguard:paid:${fingerprint}`, {
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
    paidAt: new Date().toISOString(),
  });

  return Response.json({ success: true });
}
```

### Pricing Model Recommendation

For an India-focused freemium tool:
- **Free:** 3 analyses total (not per month -- simpler, creates urgency)
- **Paid:** INR 99 one-time for 50 analyses, or INR 199 for unlimited
- UPI is zero MDR for Razorpay, so the INR 99 tier loses almost nothing to fees

Start with one-time payments, not subscriptions. Subscriptions add complexity (recurring billing, cancellation flows, failed payment handling) and Indian users are psychologically more receptive to one-time purchases for tools they use occasionally.

---

## Pattern 4: Contract Analysis UI -- Clause-by-Clause Display

**Confidence:** HIGH (well-established UX patterns from existing legal tech tools)

### Risk Color System

Inspired by Luminance and Spellbook's approaches, use a 4-level traffic-light system:

```typescript
const RISK_COLORS = {
  LOW:      { bg: "bg-emerald-50",  border: "border-emerald-400", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-800" },
  MEDIUM:   { bg: "bg-amber-50",    border: "border-amber-400",   text: "text-amber-700",   badge: "bg-amber-100 text-amber-800" },
  HIGH:     { bg: "bg-orange-50",   border: "border-orange-400",  text: "text-orange-700",  badge: "bg-orange-100 text-orange-800" },
  CRITICAL: { bg: "bg-red-50",      border: "border-red-400",     text: "text-red-700",     badge: "bg-red-100 text-red-800" },
} as const;
```

### Clause Card Component

```tsx
function ClauseCard({ clause }: { clause: ClauseAnalysis }) {
  const colors = RISK_COLORS[clause.risk];

  return (
    <div className={`rounded-lg border-l-4 ${colors.border} ${colors.bg} p-4 mb-3`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colors.badge}`}>
          {clause.risk}
        </span>
      </div>
      <p className="text-sm text-gray-800 font-medium mb-1">{clause.summary}</p>
      <p className="text-sm text-gray-600">{clause.explanation}</p>
      {clause.suggestion && (
        <div className="mt-2 bg-white/60 rounded p-2 text-sm text-gray-700">
          <span className="font-medium">Suggestion:</span> {clause.suggestion}
        </div>
      )}
    </div>
  );
}
```

### Summary Dashboard (Top of Results)

Before showing individual clauses, show a summary bar:

```tsx
function RiskSummary({ clauses }: { clauses: ClauseAnalysis[] }) {
  const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  clauses.forEach((c) => counts[c.risk]++);

  return (
    <div className="flex gap-3 mb-6">
      {Object.entries(counts).map(([level, count]) => (
        <div
          key={level}
          className={`flex-1 rounded-lg p-3 text-center ${RISK_COLORS[level as RiskLevel].bg}`}
        >
          <div className="text-2xl font-bold">{count}</div>
          <div className="text-xs uppercase tracking-wide">{level}</div>
        </div>
      ))}
    </div>
  );
}
```

### Streaming UX Pattern

As Claude streams clause analyses, render them progressively:

1. Show a pulsing skeleton card while the next clause is being generated
2. When a complete clause JSON line arrives, parse it and animate it into view (fade-in + slide-up)
3. Update the summary dashboard counts in real-time
4. Show a progress indicator: "Analyzing clause 4 of ~12..."

This gives the user immediate feedback and the feeling the tool is working hard for them.

---

## Pattern 5: Page Layout and Component Library

**Confidence:** HIGH (shadcn/ui is the de facto standard for Next.js + Tailwind apps)

### Use shadcn/ui

Do not build components from scratch. Use shadcn/ui (copy-paste components, not a dependency) for:
- `Button`, `Card`, `Badge`, `Alert`, `Dialog`, `Textarea`, `Skeleton`
- `Sheet` (mobile sidebar), `Tabs`, `Accordion` (for clause expansion)

Install via CLI:
```bash
npx shadcn@latest init
npx shadcn@latest add button card badge alert dialog textarea skeleton tabs accordion
```

### Page Structure

```
/ (Landing Page)
  - Hero section with contract paste demo
  - "How it works" 3-step section
  - Pricing section (free vs paid)
  - FAQ accordion
  - Footer with legal links

/analyze (Main App)
  - Textarea (left panel on desktop, top on mobile)
  - Results panel (right panel on desktop, bottom on mobile)
  - Sticky header with usage counter + upgrade button
```

### Responsive Layout

```tsx
// /analyze page layout
<div className="min-h-screen flex flex-col">
  {/* Sticky header with branding + usage counter */}
  <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
    <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
      <Logo />
      <UsageCounter remaining={remaining} />
    </div>
  </header>

  {/* Main content: side-by-side on desktop, stacked on mobile */}
  <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <ContractInput onAnalyze={handleAnalyze} isLoading={isLoading} />
      </div>
      <div className="space-y-4">
        {clauses.length > 0 && <RiskSummary clauses={clauses} />}
        <ClauseList clauses={clauses} isStreaming={isLoading} />
      </div>
    </div>
  </main>
</div>
```

### Design Language for Legal/Professional Tools

- **Colors:** Muted blues and grays for trust. White backgrounds. Avoid bright colors except for risk indicators.
- **Typography:** Use `font-sans` (Inter via next/font). Legal tools need readability, not personality.
- **Spacing:** Generous padding. Legal text is dense; give it room to breathe.
- **Dark mode:** Do not build dark mode for v1. Legal professionals expect light interfaces. Ship faster.

---

## Pattern 6: SEO and Landing Page for India Market

**Confidence:** MEDIUM (general SaaS patterns are well-established; India-specific legal tech data is sparse)

### Next.js SEO Setup

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: "ClauseGuard - AI Contract Analysis | Review Contracts in Seconds",
  description:
    "Paste your contract and get instant AI-powered analysis. Identify risky clauses, understand legal jargon, and get suggestions. Free to try.",
  keywords: [
    "contract analysis", "AI contract review", "legal tech India",
    "clause analysis", "contract risk assessment", "NDA review",
    "employment agreement review",
  ],
  openGraph: {
    title: "ClauseGuard - AI Contract Analysis",
    description: "Review contracts in seconds with AI. Free to try.",
    type: "website",
    locale: "en_IN",
  },
};
```

### Landing Page Sections (in order)

1. **Hero:** "Understand any contract in 60 seconds" + live demo textarea with sample contract
2. **Social proof:** "Analyzed 1,200+ contracts" (use real or aspirational number)
3. **How it works:** 3 steps (Paste -> Analyze -> Understand) with icons
4. **Sample output:** Show a real analysis result with risk indicators
5. **Pricing:** Simple 2-column (Free vs Paid) comparison
6. **FAQ:** Accordion with SEO-friendly questions ("Is my contract data safe?", "What types of contracts can I analyze?", "How accurate is the AI analysis?")
7. **CTA:** Repeat the paste area at the bottom

### India-Specific Considerations

- Target keywords: "contract review India", "NDA analysis online", "employment agreement check"
- Hindi/regional language support is NOT needed for v1. English-speaking professionals are the target.
- Page speed matters enormously in India (variable connection speeds). Keep the landing page under 200KB total. Use Next.js Image optimization, no heavy animations.
- Add structured data (JSON-LD) for SoftwareApplication schema.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Building Auth Before You Need It
**What:** Adding NextAuth, user accounts, email verification before launch.
**Why bad:** Adds 2-3 days of work, login friction kills conversion, not needed until you have paying users who need account recovery.
**Instead:** Use fingerprint + Redis for tracking. Add auth only when users ask for features that require it (saved history, multiple devices).

### Anti-Pattern 2: Database Before You Need It
**What:** Setting up Postgres/Prisma/Drizzle for a v1 that only needs rate limiting and payment tracking.
**Why bad:** Redis handles both use cases. A database adds migrations, ORM setup, connection pooling concerns.
**Instead:** Upstash Redis handles rate limiting AND payment status. Add a database only when you need to store analysis history or user profiles.

### Anti-Pattern 3: Sending Entire Contracts to Client State
**What:** Storing the full contract text and full analysis in React state / localStorage.
**Why bad:** Contracts can be 50+ pages. This bloats memory and risks exposing sensitive legal text in browser storage.
**Instead:** Stream the analysis, render it, but only keep the parsed clause summaries in state. The original contract stays in the textarea (controlled input).

### Anti-Pattern 4: Over-Engineering the Prompt
**What:** Building complex prompt chains, multiple Claude calls per analysis.
**Why bad:** Each API call costs money (your API key), adds latency, and increases failure points.
**Instead:** One well-crafted system prompt + the contract text = one streaming call. Iterate on the prompt, not the architecture.

### Anti-Pattern 5: Building a Custom Payment Flow
**What:** Building your own checkout page, card input forms, payment processing.
**Why bad:** PCI compliance nightmare, trust issues with unknown checkout forms.
**Instead:** Use Razorpay's hosted checkout modal. It opens as an overlay, handles all payment methods (UPI, cards, net banking), and users trust the Razorpay brand.

---

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| AI API costs | ~$5/day | ~$500/day, need caching | Need prompt optimization, consider cheaper models for simple contracts |
| Rate limiting | Upstash free tier | Upstash Pro ($10/mo) | Custom solution, possibly Cloudflare Workers |
| Payment tracking | Redis key-value | Redis still fine | Need proper database + user accounts |
| Streaming | Vercel hobby plan | Vercel Pro, increase maxDuration | Edge functions, regional deployment |
| Contract storage | Not stored | Still not stored (privacy) | Optional: encrypted storage with user consent |

---

## File Structure Recommendation

```
app/
  layout.tsx              # Root layout with metadata, fonts, analytics
  page.tsx                # Landing page (SSR for SEO)
  analyze/
    page.tsx              # Main analysis page
  api/
    analyze/
      route.ts            # AI streaming endpoint
    payment/
      create-order/
        route.ts          # Razorpay order creation
      verify/
        route.ts          # Payment verification
      status/
        route.ts          # Check payment status
components/
  landing/
    hero.tsx
    how-it-works.tsx
    pricing.tsx
    faq.tsx
  analysis/
    contract-input.tsx    # Textarea + analyze button
    clause-card.tsx       # Individual clause result
    clause-list.tsx       # List of clause cards + skeleton loaders
    risk-summary.tsx      # Dashboard bar at top
    usage-counter.tsx     # "2 of 3 free analyses remaining"
    upgrade-prompt.tsx    # Shown when limit reached
  payment/
    checkout-button.tsx   # Razorpay integration
  ui/                     # shadcn/ui components
    button.tsx
    card.tsx
    badge.tsx
    ...
lib/
  ratelimit.ts            # Upstash rate limiter config
  fingerprint.ts          # Browser fingerprint helper
  redis.ts                # Upstash Redis client
  prompts.ts              # Claude system prompts
  parse-clauses.ts        # Stream parser for clause JSON
```

---

## Sources

- [Vercel AI SDK streaming in Next.js (LogRocket)](https://blog.logrocket.com/nextjs-vercel-ai-sdk-streaming/) - HIGH confidence
- [Vercel AI SDK official site](https://ai-sdk.dev/) - HIGH confidence
- [AI SDK v6 announcement](https://vercel.com/blog/ai-sdk-6) - HIGH confidence
- [Razorpay Next.js integration guide](https://dev.to/hanuchaudhary/how-to-integrate-razorpay-in-nextjs-1415-with-easy-steps-fl7) - HIGH confidence
- [Razorpay Next.js 15 UPI integration](https://medium.com/@jigsz6391/how-to-integrate-razorpay-in-next-js-15-for-upi-payments-115e9b66dc11) - HIGH confidence
- [Upstash rate limiting for Next.js](https://upstash.com/blog/nextjs-ratelimiting) - HIGH confidence
- [Upstash ratelimit-js GitHub](https://github.com/upstash/ratelimit-js) - HIGH confidence
- [FingerprintJS open source](https://github.com/fingerprintjs/fingerprintjs) - HIGH confidence
- [shadcn/ui](https://ui.shadcn.com/) - HIGH confidence
- [Server Actions vs Route Handlers (MakerKit)](https://makerkit.dev/blog/tutorials/server-actions-vs-route-handlers) - MEDIUM confidence
- [Spellbook AI contract review](https://www.spellbook.legal/learn/ai-legal-contract-review-faster-analysis) - MEDIUM confidence (UI pattern reference)
- [SaaS landing page essentials 2025](https://shipixen.com/blog/10-essential-features-every-saas-landing-page-needs-in-2025) - MEDIUM confidence
