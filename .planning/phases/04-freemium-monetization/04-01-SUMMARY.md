---
phase: 04-freemium-monetization
plan: 01
subsystem: api, payments
tags: [upstash, redis, fingerprintjs, rate-limiting, freemium, localStorage]

# Dependency graph
requires:
  - phase: 03-web-app-core
    provides: Next.js app with /api/analyze route and analyze page
provides:
  - Upstash Redis usage tracking (IP + fingerprint compound key)
  - Rate-limited /api/analyze with 429 LIMIT_REACHED response
  - FingerprintJS browser fingerprint hook
  - localStorage usage helpers for instant UI feedback
  - UsageCounter badge component
  - /api/payment/status endpoint for server-side usage sync
affects: [04-02-razorpay-payments]

# Tech tracking
tech-stack:
  added: ["@upstash/redis", "@fingerprintjs/fingerprintjs"]
  patterns: ["Compound identifier (IP:fingerprint)", "Atomic INCR-then-check usage gating", "localStorage cache with server sync on load"]

key-files:
  created:
    - web-app/src/lib/redis.ts
    - web-app/src/lib/fingerprint.ts
    - web-app/src/lib/usage.ts
    - web-app/src/app/api/payment/status/route.ts
    - web-app/src/components/freemium/usage-counter.tsx
  modified:
    - web-app/src/app/api/analyze/route.ts
    - web-app/src/app/analyze/page.tsx
    - web-app/package.json

key-decisions:
  - "Raw Redis INCR/DECR instead of @upstash/ratelimit -- lifetime counter semantics, not time-window rate limiting"
  - "UsageCounter on analyze page only, not global navbar -- avoids unnecessary client hydration on landing page"
  - "useObject headers option for dynamic X-Fingerprint header -- avoids custom fetch wrapper"

patterns-established:
  - "Compound identifier: getUserIdentifier(req) returns ip:fingerprint for all usage tracking"
  - "Atomic usage gating: INCR first, DECR back if over limit (race-condition safe)"
  - "Server-sync-on-load: fetch /api/payment/status on page mount to prevent localStorage desync"

requirements-completed: [FREEM-01, FREEM-02, FREEM-03, FREEM-04, FREEM-07]

# Metrics
duration: 3min
completed: 2026-03-22
---

# Phase 4 Plan 1: Rate Limiting + Fingerprinting Summary

**Upstash Redis usage tracking with IP+fingerprint compound key, 3-analysis free limit, and UsageCounter badge with localStorage instant feedback**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-22T14:18:17Z
- **Completed:** 2026-03-22T14:21:36Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Free users limited to exactly 3 analyses via atomic Redis INCR/DECR with compound IP:fingerprint key
- Usage counter badge on analyze page shows remaining free analyses with color-coded styling
- localStorage provides instant UI feedback, synced with server truth on page load via /api/payment/status
- 429 response with LIMIT_REACHED code and X-Usage headers when limit exceeded

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create lib files** - `8eb16d9` (feat)
2. **Task 2: Wire rate limiting into analyze route + add usage counter UI** - `d146877` (feat)

## Files Created/Modified
- `web-app/src/lib/redis.ts` - Upstash Redis client, getUserIdentifier, checkAndIncrementUsage, getUsageStatus, markAsPaid
- `web-app/src/lib/fingerprint.ts` - useFingerprint hook with cached visitor ID via dynamic import
- `web-app/src/lib/usage.ts` - localStorage usage helpers (get/set/increment/markPaid)
- `web-app/src/app/api/payment/status/route.ts` - GET endpoint returning usage status for an identifier
- `web-app/src/components/freemium/usage-counter.tsx` - Badge showing remaining free analyses (red when low, blue otherwise, green for paid)
- `web-app/src/app/api/analyze/route.ts` - Added rate limit gate before streaming + X-Usage headers
- `web-app/src/app/analyze/page.tsx` - Integrated fingerprint, usage sync, counter, and upgrade modal state
- `web-app/package.json` - Added @upstash/redis and @fingerprintjs/fingerprintjs

## Decisions Made
- Used raw Redis INCR/DECR instead of @upstash/ratelimit: lifetime counter semantics, not time-window rate limiting (per research recommendation)
- Placed UsageCounter on analyze page only, not in the global navbar: avoids converting Server Component navbar to client, reduces hydration on landing page
- Used useObject's headers option with a callback for dynamic X-Fingerprint header: cleaner than a custom fetch wrapper
- Upgrade prompt is a placeholder inline div, not a modal yet: the full upgrade modal with Razorpay checkout comes in plan 04-02

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

The following environment variables must be set for runtime operation:

```bash
# Upstash Redis (from https://console.upstash.com)
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

These are required for the rate limiting and usage tracking to function. Without them, `Redis.fromEnv()` will throw at runtime when the /api/analyze or /api/payment/status routes are called.

## Next Phase Readiness
- Rate limiting infrastructure complete and ready for plan 04-02 (Razorpay payments)
- `markAsPaid` function in redis.ts ready to be called after payment verification
- `showUpgradeModal` state in analyze page ready to trigger upgrade modal component
- `markLocalPaid` in usage.ts ready for post-payment localStorage update

## Self-Check: PASSED

All 7 created/modified files verified on disk. Both task commits (8eb16d9, d146877) verified in git log.

---
*Phase: 04-freemium-monetization*
*Completed: 2026-03-22*
