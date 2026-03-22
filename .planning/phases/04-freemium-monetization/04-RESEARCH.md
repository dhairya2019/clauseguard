# Phase 4: Freemium Monetization - Research

**Researched:** 2026-03-22
**Domain:** Upstash Redis rate limiting + FingerprintJS browser fingerprinting + Razorpay payment gateway
**Confidence:** HIGH

## Summary

Phase 4 adds a freemium monetization layer to the existing Next.js web app. The system tracks usage via a compound identifier (IP address + browser fingerprint) stored in Upstash Redis, limits free users to 3 analyses, and unlocks unlimited access through Razorpay payments. No user accounts are needed -- identification is entirely anonymous.

The architecture splits into two clean concerns: (1) a rate-limiting middleware layer that intercepts `/api/analyze` requests and checks/increments a Redis counter keyed by `ip:fingerprint`, and (2) a payment flow that creates a Razorpay order on the server, opens the Razorpay hosted checkout modal on the client, verifies the payment signature server-side via HMAC-SHA256, and marks the identifier as "paid" in Redis. The client uses localStorage for instant UI feedback (usage counter) and FingerprintJS for generating a stable browser identifier.

The existing web-app already uses Next.js 16 (App Router), AI SDK v6, shadcn/ui, and Zod v4. Phase 4 adds three new npm dependencies (`@upstash/ratelimit`, `@upstash/redis`, `@fingerprintjs/fingerprintjs`) and one server-only dependency (`razorpay`). The Razorpay checkout.js script loads via `next/script` on the client.

**Primary recommendation:** Use `@upstash/redis` for both rate limiting (via `@upstash/ratelimit` sliding window) AND quota storage (via raw `redis.get`/`redis.set` for paid status). Use the open-source `@fingerprintjs/fingerprintjs` (free, MIT) for browser fingerprinting -- 40-60% accuracy is sufficient for a freemium wall when combined with IP. Use the official `razorpay` npm package with its built-in `validatePaymentVerification` utility for HMAC signature verification.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FREEM-01 | Upstash Redis rate limiting (3 free analyses per user) | Standard stack: `@upstash/ratelimit` with `fixedWindow(3, "30 d")` or custom counter via `@upstash/redis` incr/get |
| FREEM-02 | Browser fingerprinting (FingerprintJS) + IP for user identification | Code examples: `@fingerprintjs/fingerprintjs` v5 `load()` + `get()` returns `visitorId`; IP from `x-forwarded-for` header |
| FREEM-03 | localStorage usage counter for instant UI feedback | Architecture pattern: client-side counter synced with server response headers |
| FREEM-04 | 429 response with upgrade prompt when limit reached | Architecture pattern: Route Handler checks Redis before analysis, returns 429 + JSON body with upgrade info |
| FREEM-05 | Razorpay payment integration (create-order, verify, status API routes) | Code examples: 3 API routes (`/api/payment/create-order`, `/api/payment/verify`, `/api/payment/status`) |
| FREEM-06 | Payment verification + quota unlock in Redis | Code examples: HMAC-SHA256 verification via `validatePaymentVerification`, then `redis.set` paid flag |
| FREEM-07 | Usage counter component ("2 of 3 free analyses remaining") | Architecture pattern: header component reading localStorage + server usage data |
| FREEM-08 | Upgrade prompt modal when limit reached | Architecture pattern: shadcn/ui Dialog triggered by 429 response or zero remaining |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @upstash/redis | latest | HTTP-based Redis client for serverless | Connectionless (REST), works in Vercel Edge/Serverless, `Redis.fromEnv()` auto-config |
| @upstash/ratelimit | latest | Rate limiting primitives | Sliding window / fixed window / token bucket algorithms, built for serverless |
| @fingerprintjs/fingerprintjs | v5 (latest) | Browser fingerprint generation | MIT license, free, generates stable `visitorId` hash from browser attributes |
| razorpay | latest | Razorpay Node.js SDK | Official SDK, `orders.create()`, built-in `validatePaymentVerification` utility |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/script | (bundled) | Load Razorpay checkout.js | Client-side script loading for payment modal |
| crypto | (Node.js built-in) | HMAC-SHA256 | Fallback manual signature verification (prefer SDK utility) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| FingerprintJS open-source | Fingerprint Pro (commercial) | Pro has 99.5% accuracy but costs money; open-source 40-60% + IP combo is sufficient for freemium |
| @upstash/ratelimit | Custom Redis INCR counter | Ratelimit handles edge cases (multi-region, analytics); but custom counter gives more control over quota semantics |
| Razorpay hosted checkout | Razorpay Custom Checkout | Hosted checkout handles PCI compliance, UPI intent, all payment modes automatically |

**Installation:**
```bash
cd web-app

# Rate limiting + Redis
npm install @upstash/ratelimit @upstash/redis

# Browser fingerprinting (client-side)
npm install @fingerprintjs/fingerprintjs

# Razorpay (server-side only)
npm install razorpay
```

## Architecture Patterns

### Recommended Project Structure (additions to existing web-app)
```
web-app/src/
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts        # MODIFY: add rate limit check before analysis
│   │   └── payment/
│   │       ├── create-order/
│   │       │   └── route.ts    # NEW: Razorpay order creation
│   │       ├── verify/
│   │       │   └── route.ts    # NEW: HMAC signature verification + quota unlock
│   │       └── status/
│   │           └── route.ts    # NEW: check paid status for an identifier
│   └── analyze/
│       └── page.tsx            # MODIFY: add fingerprint, usage counter, upgrade modal
├── components/
│   ├── analysis/               # existing
│   ├── freemium/               # NEW
│   │   ├── usage-counter.tsx   # "2 of 3 free analyses remaining"
│   │   ├── upgrade-modal.tsx   # Payment prompt with pricing + Razorpay checkout trigger
│   │   └── payment-button.tsx  # Razorpay checkout button
│   └── layout/
│       └── navbar.tsx          # MODIFY: add usage counter
├── lib/
│   ├── redis.ts                # NEW: Upstash Redis singleton + rate limiter
│   ├── fingerprint.ts          # NEW: FingerprintJS loader + hook
│   └── usage.ts                # NEW: localStorage usage tracking helpers
└── types/
    └── razorpay.d.ts           # NEW: Razorpay checkout window type declarations
```

### Pattern 1: Compound Identifier (IP + Fingerprint)

**What:** Combine server-side IP with client-side browser fingerprint to create a stable user identifier without accounts.

**When to use:** Always for rate limiting and quota tracking in this project.

**Key design decisions:**
- The fingerprint is generated client-side and sent as a header (`X-Fingerprint`) with each API request
- The server extracts IP from `x-forwarded-for` header
- The compound key is `usage:{ip}:{fingerprint}` in Redis
- If fingerprint is missing (JavaScript disabled), fall back to IP-only: `usage:{ip}:nofp`

```typescript
// web-app/src/lib/redis.ts
import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

// Compound identifier for rate limiting
export function getUserIdentifier(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const fingerprint = req.headers.get("x-fingerprint") || "nofp";
  return `${ip}:${fingerprint}`;
}
```

### Pattern 2: Custom Usage Counter (not @upstash/ratelimit)

**What:** Use raw Redis `INCR` + `GET` instead of `@upstash/ratelimit` for usage tracking, because we need to: (a) read the current count for UI display, (b) check paid status separately, (c) reset count on payment.

**Why not @upstash/ratelimit:** The ratelimit library is designed for "allow/deny" decisions with time windows. Our use case is a lifetime counter (3 total, not 3 per time window) that resets on payment. A simple Redis counter is cleaner.

**When to use:** For the `/api/analyze` rate check.

```typescript
// web-app/src/lib/redis.ts (continued)
const FREE_LIMIT = 3;
const USAGE_PREFIX = "usage:";
const PAID_PREFIX = "paid:";

export async function checkAndIncrementUsage(identifier: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  isPaid: boolean;
}> {
  const paidKey = `${PAID_PREFIX}${identifier}`;
  const usageKey = `${USAGE_PREFIX}${identifier}`;

  // Check if user is paid
  const isPaid = await redis.get<boolean>(paidKey);
  if (isPaid) {
    return { allowed: true, used: 0, limit: Infinity, remaining: Infinity, isPaid: true };
  }

  // Increment and check free usage
  const used = await redis.incr(usageKey);

  if (used > FREE_LIMIT) {
    // Decrement back since we shouldn't count this attempt
    await redis.decr(usageKey);
    return { allowed: false, used: FREE_LIMIT, limit: FREE_LIMIT, remaining: 0, isPaid: false };
  }

  return {
    allowed: true,
    used,
    limit: FREE_LIMIT,
    remaining: FREE_LIMIT - used,
    isPaid: false,
  };
}

export async function getUsageStatus(identifier: string): Promise<{
  used: number;
  limit: number;
  remaining: number;
  isPaid: boolean;
}> {
  const isPaid = await redis.get<boolean>(`${PAID_PREFIX}${identifier}`);
  if (isPaid) {
    return { used: 0, limit: Infinity, remaining: Infinity, isPaid: true };
  }
  const used = (await redis.get<number>(`${USAGE_PREFIX}${identifier}`)) || 0;
  return { used, limit: FREE_LIMIT, remaining: Math.max(0, FREE_LIMIT - used), isPaid: false };
}

export async function markAsPaid(identifier: string): Promise<void> {
  await redis.set(`${PAID_PREFIX}${identifier}`, true);
}
```

### Pattern 3: Rate-Limited Analyze Route

**What:** Modify the existing `/api/analyze` route to check usage before running the analysis.

```typescript
// web-app/src/app/api/analyze/route.ts (modified)
import { streamText, Output } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { contractAnalysisSchema } from "@/lib/schemas";
import { buildSystemPrompt, buildUserMessage } from "@/lib/prompts";
import { getUserIdentifier, checkAndIncrementUsage } from "@/lib/redis";

export const maxDuration = 60;

export async function POST(req: Request) {
  // --- Rate limit check ---
  const identifier = getUserIdentifier(req);
  const usage = await checkAndIncrementUsage(identifier);

  if (!usage.allowed) {
    return Response.json(
      {
        error: "Free analysis limit reached",
        code: "LIMIT_REACHED",
        used: usage.used,
        limit: usage.limit,
      },
      {
        status: 429,
        headers: {
          "X-Usage-Used": String(usage.used),
          "X-Usage-Limit": String(usage.limit),
          "X-Usage-Remaining": "0",
        },
      },
    );
  }

  const { contractText, analysisType = "full", partyPerspective } =
    await req.json();

  if (!contractText || contractText.length < 50) {
    return Response.json(
      { error: "Contract text must be at least 50 characters" },
      { status: 400 },
    );
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-5-20250514"),
    system: buildSystemPrompt(),
    output: Output.object({ schema: contractAnalysisSchema }),
    prompt: buildUserMessage(contractText, analysisType, partyPerspective),
  });

  // Add usage headers to streaming response
  const response = result.toTextStreamResponse();
  response.headers.set("X-Usage-Used", String(usage.used));
  response.headers.set("X-Usage-Limit", String(usage.limit));
  response.headers.set("X-Usage-Remaining", String(usage.remaining));
  return response;
}
```

### Pattern 4: Razorpay Payment Flow

**What:** Three-step payment flow: create order (server) -> hosted checkout (client) -> verify (server) -> unlock quota (server).

**Step 1 - Create Order:**
```typescript
// web-app/src/app/api/payment/create-order/route.ts
import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  const { identifier } = await req.json();

  const order = await razorpay.orders.create({
    amount: 29900, // INR 299.00 in paise
    currency: "INR",
    receipt: `cg_${Date.now()}`,
    notes: { identifier }, // Store identifier for verification
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}
```

**Step 2 - Client Checkout:**
```typescript
// Razorpay hosted checkout modal opening
const options = {
  key: keyId, // from create-order response
  amount: amount,
  currency: "INR",
  name: "ClauseGuard",
  description: "Unlimited Contract Analysis",
  order_id: orderId,
  handler: async (response: RazorpayResponse) => {
    // Step 3: Verify on server
    await fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        identifier: userIdentifier,
      }),
    });
  },
  prefill: { name: "", email: "" },
  theme: { color: "#1e40af" }, // Match ClauseGuard blue
};
const rzp = new window.Razorpay(options);
rzp.open();
```

**Step 3 - Verify + Unlock:**
```typescript
// web-app/src/app/api/payment/verify/route.ts
import crypto from "crypto";
import { markAsPaid } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, identifier } =
    await req.json();

  // HMAC-SHA256 signature verification
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Mark user as paid in Redis
  await markAsPaid(identifier);

  return NextResponse.json({ success: true, message: "Payment verified, quota unlocked" });
}
```

### Pattern 5: FingerprintJS Client Integration

**What:** Load FingerprintJS once on the analyze page, store the visitor ID, and send it with every API request.

```typescript
// web-app/src/lib/fingerprint.ts
"use client";

import { useEffect, useState } from "react";

let cachedVisitorId: string | null = null;

export function useFingerprint(): string | null {
  const [visitorId, setVisitorId] = useState<string | null>(cachedVisitorId);

  useEffect(() => {
    if (cachedVisitorId) return;

    async function loadFingerprint() {
      const FingerprintJS = await import("@fingerprintjs/fingerprintjs");
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      cachedVisitorId = result.visitorId;
      setVisitorId(result.visitorId);
    }

    loadFingerprint();
  }, []);

  return visitorId;
}
```

### Pattern 6: localStorage Usage Counter

**What:** Mirror Redis usage count in localStorage for instant UI feedback without network round-trips.

```typescript
// web-app/src/lib/usage.ts
"use client";

const STORAGE_KEY = "clauseguard_usage";

interface UsageData {
  used: number;
  limit: number;
  isPaid: boolean;
}

export function getLocalUsage(): UsageData {
  if (typeof window === "undefined") return { used: 0, limit: 3, isPaid: false };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { used: 0, limit: 3, isPaid: false };
}

export function setLocalUsage(data: UsageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function incrementLocalUsage(): UsageData {
  const current = getLocalUsage();
  const updated = { ...current, used: current.used + 1 };
  setLocalUsage(updated);
  return updated;
}

export function markLocalPaid(): void {
  setLocalUsage({ used: 0, limit: Infinity, isPaid: true });
}
```

### Anti-Patterns to Avoid
- **Using @upstash/ratelimit for lifetime quotas:** The ratelimit library resets after time windows. Use raw Redis `INCR`/`GET` for lifetime counters.
- **Trusting localStorage alone:** Users can clear localStorage. Always verify against Redis on the server. localStorage is for UI speed only.
- **Exposing RAZORPAY_KEY_SECRET to the client:** Only `NEXT_PUBLIC_RAZORPAY_KEY_ID` goes to the client. The secret stays server-side.
- **Creating Razorpay orders on the client:** Order creation must happen server-side to prevent amount tampering.
- **Using FingerprintJS Pro when open-source suffices:** The open-source version (40-60% accuracy) combined with IP is adequate for freemium gating. Save the cost.
- **Blocking the page render on fingerprint load:** FingerprintJS loads async. Show the page immediately, send fingerprint when available.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Browser fingerprinting | Canvas hash + WebGL + font detection | `@fingerprintjs/fingerprintjs` | Handles browser quirks, cross-platform, maintained |
| Payment signature verification | Custom HMAC implementation | `crypto.createHmac` or Razorpay SDK `validatePaymentVerification` | Timing-safe comparison, tested edge cases |
| Redis connection management | `ioredis` or `redis` npm | `@upstash/redis` (REST-based) | No connection pooling needed in serverless, HTTP-based |
| Payment UI / checkout form | Custom card input form | Razorpay hosted checkout (checkout.js) | PCI DSS compliance, UPI intent, all payment modes handled |
| Usage analytics | Custom tracking tables | Upstash ratelimit analytics (if using ratelimit) or simple Redis counters | Already built into the infrastructure |

**Key insight:** Razorpay's hosted checkout modal handles PCI compliance, UPI intent flows, saved cards, net banking, and wallet payments automatically. Building a custom payment form would require PCI DSS Level 1 compliance, which is a massive and unnecessary burden.

## Common Pitfalls

### Pitfall 1: Fingerprint Not Ready on First Request
**What goes wrong:** User clicks "Analyze" before FingerprintJS has loaded, so the fingerprint header is missing.
**Why it happens:** FingerprintJS loads async and takes 100-500ms.
**How to avoid:** Fall back to IP-only identification if fingerprint is not yet available. Update the identifier for subsequent requests. The `X-Fingerprint: nofp` fallback key handles this.
**Warning signs:** First analysis always uses a different identifier than subsequent ones.

### Pitfall 2: Razorpay Amount in Paise, Not Rupees
**What goes wrong:** User is charged 100x the intended amount, or 1/100th.
**Why it happens:** Razorpay expects amount in the smallest currency unit (paise for INR). INR 299 = 29900 paise.
**How to avoid:** Always multiply by 100 on the server when creating orders. Display the human-readable amount (INR 299) in UI.
**Warning signs:** Payment amount looks wrong in Razorpay dashboard.

### Pitfall 3: Race Condition on Usage Counter
**What goes wrong:** Two simultaneous requests both pass the limit check.
**Why it happens:** Redis INCR is atomic, but the check-then-increment pattern (GET then conditional INCR) is not.
**How to avoid:** Always INCR first, then check if the result exceeds the limit. If it does, DECR back. The `INCR` command is atomic in Redis.
**Warning signs:** User gets 4 or 5 analyses instead of 3.

### Pitfall 4: Payment Verification Without Identifier Binding
**What goes wrong:** Attacker replays a valid payment verification to unlock a different identifier.
**Why it happens:** The verify endpoint accepts any identifier with a valid signature.
**How to avoid:** Store the identifier in the Razorpay order's `notes` field during creation. On verification, fetch the order from Razorpay and compare the identifier in notes with the one in the verify request.
**Warning signs:** Users getting free access by sharing payment data.

### Pitfall 5: localStorage Desync with Redis
**What goes wrong:** User clears browser data and gets 3 more free analyses according to UI, but server blocks them.
**Why it happens:** localStorage shows 0 used, but Redis still has the real count.
**How to avoid:** On page load, fetch the actual usage from a `/api/payment/status` endpoint and sync localStorage. The localStorage value is a cache, not the source of truth.
**Warning signs:** UI shows "3 remaining" but analyze request returns 429.

### Pitfall 6: Missing Razorpay Script in Production
**What goes wrong:** Payment button does nothing or throws `window.Razorpay is not defined`.
**Why it happens:** The checkout.js script failed to load or was blocked by a content security policy.
**How to avoid:** Use `next/script` with `strategy="lazyOnload"` and check `window.Razorpay` existence before calling `new Razorpay()`. Show an error message if the script fails.
**Warning signs:** Payment works locally but fails in production.

## Code Examples

### Razorpay Type Declarations
```typescript
// web-app/src/types/razorpay.d.ts
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open(): void;
  close(): void;
  on(event: string, handler: (response: any) => void): void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
```

### Usage Counter Component
```typescript
// web-app/src/components/freemium/usage-counter.tsx
"use client";

import { Badge } from "@/components/ui/badge";

interface UsageCounterProps {
  used: number;
  limit: number;
  isPaid: boolean;
}

export function UsageCounter({ used, limit, isPaid }: UsageCounterProps) {
  if (isPaid) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Unlimited Plan
      </Badge>
    );
  }

  const remaining = Math.max(0, limit - used);
  const isLow = remaining <= 1;

  return (
    <Badge
      variant="outline"
      className={isLow ? "bg-red-50 text-red-700 border-red-200" : "bg-blue-50 text-blue-700 border-blue-200"}
    >
      {remaining} of {limit} free analyses remaining
    </Badge>
  );
}
```

### Upgrade Modal
```typescript
// web-app/src/components/freemium/upgrade-modal.tsx
"use client";

import Script from "next/script";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  identifier: string;
  onPaymentSuccess: () => void;
}

export function UpgradeModal({ open, onOpenChange, identifier, onPaymentSuccess }: UpgradeModalProps) {
  const handlePayment = async () => {
    // 1. Create order on server
    const res = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    });
    const { orderId, amount, currency, keyId } = await res.json();

    // 2. Open Razorpay checkout
    const options: RazorpayOptions = {
      key: keyId,
      amount,
      currency,
      name: "ClauseGuard",
      description: "Unlimited Contract Analysis",
      order_id: orderId,
      handler: async (response) => {
        // 3. Verify payment on server
        const verifyRes = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            identifier,
          }),
        });
        const result = await verifyRes.json();
        if (result.success) {
          onPaymentSuccess();
          onOpenChange(false);
        }
      },
      theme: { color: "#1e40af" },
    };

    if (typeof window !== "undefined" && window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    }
  };

  return (
    <>
      <Script
        id="razorpay-checkout"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to Unlimited</DialogTitle>
            <DialogDescription>
              You have used all 3 free contract analyses. Upgrade for unlimited access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border p-4 text-center">
              <div className="text-3xl font-bold">INR 299</div>
              <div className="text-sm text-muted-foreground">One-time payment</div>
              <ul className="mt-3 space-y-1 text-sm text-left">
                <li>Unlimited contract analyses</li>
                <li>All payment modes (UPI, cards, net banking)</li>
                <li>Instant access after payment</li>
              </ul>
            </div>
            <Button onClick={handlePayment} className="w-full" size="lg">
              Pay with Razorpay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Environment Variables Required
```bash
# .env.local additions for Phase 4

# Upstash Redis (from https://console.upstash.com)
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# Razorpay (from https://dashboard.razorpay.com)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ioredis TCP connections | @upstash/redis REST API | 2022+ | No connection management in serverless |
| Custom sliding window in Redis | @upstash/ratelimit algorithms | 2023+ | Battle-tested, analytics built-in |
| Manual HMAC verification | Razorpay SDK `validatePaymentVerification` | razorpay npm v2+ | Built-in utility handles edge cases |
| Razorpay Standard Checkout (redirect) | Razorpay Hosted Checkout (modal) | 2020+ | No page redirect, better UX |
| Cookie-based tracking | FingerprintJS + IP compound ID | 2020+ | Survives incognito, no cookies needed |

**Deprecated/outdated:**
- `razorpay` npm `validateWebhookSignature` is for webhooks, not checkout verification. Use `validatePaymentVerification` or manual HMAC for checkout flow.
- Razorpay Standard Checkout (full-page redirect) still works but hosted checkout (modal) is the recommended UX pattern.

## Open Questions

1. **Pricing tier structure**
   - What we know: Requirements mention "unlimited contracts (or N based on pricing tier)". Current research assumes a single tier at INR 299 for unlimited.
   - What's unclear: Whether there should be multiple tiers (e.g., 10 analyses for INR 99, unlimited for INR 299).
   - Recommendation: Start with a single "Unlimited" tier. Multiple tiers add complexity (more Redis state, tier selection UI, upgrade paths). Can add tiers in v2.

2. **Identifier persistence across devices**
   - What we know: IP + fingerprint is per-device. A user paying on laptop won't be recognized on mobile.
   - What's unclear: Whether this is acceptable for v1 or if email-based identification is needed.
   - Recommendation: Accept per-device limitation in v1. The payment confirmation page can show a "paid identifier" the user can save. User accounts (PLAT-02) in v2 solve this properly.

3. **Razorpay test mode vs live mode**
   - What we know: Razorpay provides test API keys (rzp_test_*) that simulate payments without real money.
   - What's unclear: Nothing -- this is straightforward.
   - Recommendation: Use test mode keys during development. The code is identical; only the keys differ. Document the switch in deployment instructions.

4. **Quota expiry for paid users**
   - What we know: Requirements say "unlimited" after payment.
   - What's unclear: Whether "unlimited" means forever or for some time period.
   - Recommendation: Store paid status without TTL (permanent). If needed later, add a TTL to the Redis key for time-limited access.

## Sources

### Primary (HIGH confidence)
- [Upstash Ratelimit Getting Started](https://upstash.com/docs/redis/sdks/ratelimit-ts/gettingstarted) - Setup, algorithms, `limit()` API
- [Upstash Redis Overview](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview) - Serverless capabilities, features
- [FingerprintJS GitHub](https://github.com/fingerprintjs/fingerprintjs) - Open-source v5, installation, `load()` + `get()` API, accuracy claims
- [Razorpay Node.js SDK Payment Verification](https://github.com/razorpay/razorpay-node/blob/master/documents/paymentVerfication.md) - `validatePaymentVerification` utility
- [Razorpay Integration Steps](https://razorpay.com/docs/payments/server-integration/nodejs/integration-steps/) - Order creation, checkout, verification flow

### Secondary (MEDIUM confidence)
- [Razorpay Next.js Integration Guide](https://dev.to/hanuchaudhary/how-to-integrate-razorpay-in-nextjs-1415-with-easy-steps-fl7) - Complete App Router code examples, verified against official SDK
- [Next.js IP Address Discussion](https://github.com/vercel/next.js/discussions/55037) - `x-forwarded-for` header pattern for App Router

### Tertiary (LOW confidence)
- None -- all critical patterns verified against official sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified against npm and official docs
- Architecture: HIGH - Patterns are standard serverless Redis + payment gateway integration
- Pitfalls: HIGH - Common issues well-documented in Razorpay and Upstash communities
- Code examples: MEDIUM - Adapted from official examples to ClauseGuard domain; not runtime-tested

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (30 days - payment APIs and Redis SDKs are stable)
