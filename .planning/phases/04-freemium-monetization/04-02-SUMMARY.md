---
phase: 04-freemium-monetization
plan: 02
subsystem: payments, api
tags: [razorpay, payments, hmac, checkout, upgrade-modal, freemium]

# Dependency graph
requires:
  - phase: 04-freemium-monetization
    provides: Rate limiting infrastructure, markAsPaid, usage tracking, showUpgradeModal state
provides:
  - Razorpay order creation endpoint (/api/payment/create-order)
  - HMAC-SHA256 payment verification endpoint (/api/payment/verify)
  - UpgradeModal component with Razorpay hosted checkout
  - Complete freemium payment flow (create order -> checkout -> verify -> unlock)
affects: []

# Tech tracking
tech-stack:
  added: ["razorpay", "@base-ui/react (dialog)"]
  patterns: ["Lazy Razorpay SDK initialization for serverless build compatibility", "X-Fingerprint header for consistent server-side identifier derivation across payment routes", "HMAC-SHA256 timing-safe signature verification"]

key-files:
  created:
    - web-app/src/types/razorpay.d.ts
    - web-app/src/app/api/payment/create-order/route.ts
    - web-app/src/app/api/payment/verify/route.ts
    - web-app/src/components/freemium/upgrade-modal.tsx
    - web-app/src/components/ui/dialog.tsx
  modified:
    - web-app/src/app/analyze/page.tsx
    - web-app/package.json

key-decisions:
  - "Lazy Razorpay instantiation via singleton getter -- avoids build-time crash when env vars not set"
  - "X-Fingerprint header sent from UpgradeModal to payment routes -- server derives compound key via getUserIdentifier(req)"
  - "timing-safe HMAC comparison with Buffer.from + crypto.timingSafeEqual -- prevents timing attacks"

patterns-established:
  - "Lazy SDK initialization: serverless routes must not instantiate SDK at module level when env vars are runtime-only"
  - "Consistent identifier derivation: all payment endpoints use getUserIdentifier(req) from X-Fingerprint header"

requirements-completed: [FREEM-05, FREEM-06, FREEM-08]

# Metrics
duration: 4min
completed: 2026-03-22
---

# Phase 4 Plan 2: Razorpay Payment Integration Summary

**Razorpay hosted checkout with INR 299 one-time payment, HMAC-SHA256 verification, and upgrade modal wired into analyze page**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-22T14:24:13Z
- **Completed:** 2026-03-22T14:28:43Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Razorpay payment flow: create order (server) -> hosted checkout modal (client) -> verify signature (server) -> unlock unlimited access (Redis)
- HMAC-SHA256 signature verification with timing-safe comparison prevents payment tampering and timing attacks
- UpgradeModal component with pricing card (INR 299, one-time), feature list, and Razorpay checkout trigger
- Analyze page wired with payment success callback that updates both localStorage and React state

## Task Commits

Each task was committed atomically:

1. **Task 1: Razorpay types, payment API routes, and upgrade modal component** - `c1601e7` (feat)
2. **Task 2: Wire upgrade modal into analyze page and verify full flow builds** - `6e244bc` (feat)

## Files Created/Modified
- `web-app/src/types/razorpay.d.ts` - Global type declarations for Razorpay checkout.js (RazorpayOptions, RazorpayResponse, RazorpayInstance, Window.Razorpay)
- `web-app/src/app/api/payment/create-order/route.ts` - POST endpoint creating Razorpay order with INR 29900 paise and identifier in notes
- `web-app/src/app/api/payment/verify/route.ts` - POST endpoint verifying HMAC-SHA256 signature and calling markAsPaid
- `web-app/src/components/freemium/upgrade-modal.tsx` - Dialog with pricing info, Razorpay checkout.js script loading, and payment flow
- `web-app/src/components/ui/dialog.tsx` - shadcn dialog component (base-ui backed)
- `web-app/src/app/analyze/page.tsx` - Added UpgradeModal with handlePaymentSuccess callback
- `web-app/package.json` - Added razorpay dependency

## Decisions Made
- Used lazy singleton pattern for Razorpay SDK instantiation to avoid build-time failures when env vars are only available at runtime (common serverless pattern)
- UpgradeModal accepts `fingerprint` prop (not `identifier`) and sends X-Fingerprint header; server routes derive the compound identifier via getUserIdentifier(req) for consistency with rate-limiting routes
- Used crypto.timingSafeEqual with Buffer conversion for HMAC comparison instead of simple string equality

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Lazy Razorpay SDK initialization for build compatibility**
- **Found during:** Task 2 (build verification)
- **Issue:** Module-level `new Razorpay({...})` crashes at build time because RAZORPAY_KEY_ID env var is not set during `next build`
- **Fix:** Wrapped in lazy singleton getter function; SDK only instantiated on first request
- **Files modified:** web-app/src/app/api/payment/create-order/route.ts
- **Verification:** `npm run build` passes successfully with all routes present
- **Committed in:** 6e244bc (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for Next.js build compatibility. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviation above.

## User Setup Required

The following environment variables must be set for Razorpay payment processing:

```bash
# Razorpay (from https://dashboard.razorpay.com)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here
```

These are required in addition to the Upstash Redis variables from plan 04-01.

## Next Phase Readiness
- Complete freemium monetization pipeline is now in place: rate limiting (04-01) + payments (04-02)
- Flow: 3 free analyses -> 429 -> upgrade modal -> Razorpay checkout -> verify -> unlimited
- All that remains is deploying with real Razorpay API keys and Upstash Redis credentials

## Self-Check: PASSED

All 5 created files verified on disk. Both task commits (c1601e7, 6e244bc) verified in git log.

---
*Phase: 04-freemium-monetization*
*Completed: 2026-03-22*
