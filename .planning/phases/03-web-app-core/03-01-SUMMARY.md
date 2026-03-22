---
phase: 03-web-app-core
plan: 01
subsystem: ui
tags: [next.js, tailwind, shadcn-ui, landing-page, server-components, ai-sdk]

# Dependency graph
requires:
  - phase: 02-mcp-server
    provides: MCP server with Claude API integration and analysis types
provides:
  - Next.js 15 project scaffold at web-app/ with all dependencies
  - Landing page with hero, how-it-works, pricing, FAQ sections
  - Navbar with Analyze Contract CTA linking to /analyze
  - shadcn/ui components installed (Card, Badge, Button, Textarea, Accordion, Skeleton, Separator)
  - AI SDK + @ai-sdk/anthropic installed for streaming analysis
affects: [03-02, 03-03, 04-payments]

# Tech tracking
tech-stack:
  added: [next.js 16.2.1, react 19, tailwind v4, shadcn/ui, ai sdk, @ai-sdk/anthropic, @ai-sdk/react, zod, lucide-react, @base-ui/react]
  patterns: [server-components-only landing page, inline tailwind button styles for server components, shadcn accordion from server component context]

key-files:
  created:
    - web-app/package.json
    - web-app/src/app/page.tsx
    - web-app/src/app/layout.tsx
    - web-app/src/components/landing/hero.tsx
    - web-app/src/components/landing/how-it-works.tsx
    - web-app/src/components/landing/pricing.tsx
    - web-app/src/components/landing/faq.tsx
    - web-app/src/components/layout/navbar.tsx
    - web-app/src/components/layout/footer.tsx
    - web-app/components.json
    - web-app/src/lib/utils.ts
  modified: []

key-decisions:
  - "Used inline Tailwind classes for link buttons instead of buttonVariants() — Next.js 16 blocks calling client module functions from Server Components"
  - "Removed nested .git from create-next-app output to keep monorepo structure"
  - "All landing components are Server Components for SSR/SEO — no 'use client' directives"

patterns-established:
  - "Server Component landing pattern: all landing/* components are pure server components, shadcn client components (Button, Accordion) imported but not their utility functions"
  - "Content width: max-w-6xl mx-auto px-4 for all sections"
  - "Section spacing: py-16 lg:py-24 between sections, py-20 lg:py-32 for hero"

requirements-completed: [WEB-01, WEB-02, WEB-10]

# Metrics
duration: 5min
completed: 2026-03-22
---

# Phase 3 Plan 01: Next.js Scaffold + Landing Page Summary

**Next.js 15 app with Tailwind v4 + shadcn/ui scaffold and 4-section Server Component landing page with hero, how-it-works, pricing, and FAQ**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-22T13:07:30Z
- **Completed:** 2026-03-22T13:12:30Z
- **Tasks:** 2
- **Files modified:** 36

## Accomplishments
- Scaffolded Next.js 15 project with Tailwind v4, TypeScript, App Router, shadcn/ui, AI SDK
- Built complete landing page with hero (headline + CTA), how-it-works (3-step cards), pricing (free + pro tiers), FAQ (5 questions accordion)
- All landing components are Server Components for SEO/SSR
- Navbar with sticky header and "Analyze Contract" CTA linking to /analyze
- Build passes cleanly with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js project with shadcn/ui and all dependencies** - `e1b1eed` (feat)
2. **Task 2: Build landing page with hero, how-it-works, pricing, FAQ sections** - `a782e05` (feat)

## Files Created/Modified
- `web-app/package.json` - Next.js project with all dependencies
- `web-app/components.json` - shadcn/ui configuration
- `web-app/src/app/layout.tsx` - Root layout with Navbar, Footer, metadata
- `web-app/src/app/page.tsx` - Landing page composing all sections
- `web-app/src/components/landing/hero.tsx` - Hero section with tagline and CTA
- `web-app/src/components/landing/how-it-works.tsx` - 3-step card grid
- `web-app/src/components/landing/pricing.tsx` - Free and Pro pricing cards
- `web-app/src/components/landing/faq.tsx` - FAQ accordion with 5 questions
- `web-app/src/components/layout/navbar.tsx` - Sticky navbar with nav links and CTA
- `web-app/src/components/layout/footer.tsx` - Footer with disclaimer
- `web-app/src/lib/utils.ts` - cn() utility from shadcn
- `web-app/src/components/ui/*.tsx` - shadcn components (button, card, badge, textarea, accordion, skeleton, separator)

## Decisions Made
- Used inline Tailwind classes for link-styled buttons instead of `buttonVariants()` — Next.js 16 prevents calling client module functions from Server Components at build time
- Removed nested `.git` directory from `create-next-app` output to maintain monorepo structure (not a submodule)
- All landing page components kept as pure Server Components (no `"use client"`) for SSR and SEO

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed nested .git directory from create-next-app**
- **Found during:** Task 1
- **Issue:** `create-next-app` creates its own `.git` directory, causing git to treat web-app as a submodule
- **Fix:** Removed `web-app/.git` before staging
- **Files modified:** None (just removed .git)
- **Verification:** `git add web-app/` succeeds without submodule warning
- **Committed in:** e1b1eed (Task 1 commit)

**2. [Rule 1 - Bug] Replaced buttonVariants() calls with inline Tailwind classes**
- **Found during:** Task 2
- **Issue:** `buttonVariants()` is exported from a `"use client"` module — Next.js 16 throws "Attempted to call buttonVariants() from the server" error during static generation
- **Fix:** Replaced all `buttonVariants()` calls in Server Components with equivalent inline Tailwind utility classes
- **Files modified:** navbar.tsx, hero.tsx, pricing.tsx
- **Verification:** `npm run build` succeeds, all pages generate statically
- **Committed in:** a782e05 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes necessary for build to succeed. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Web app scaffold complete with all dependencies for Plans 02 and 03
- AI SDK + Anthropic provider installed, ready for streaming analysis route
- shadcn components (Card, Badge, Skeleton, Textarea) available for analysis UI
- `/analyze` route referenced in CTAs — Plan 02 will implement this page

## Self-Check: PASSED

All 9 key files verified present. Both task commits (e1b1eed, a782e05) verified in git log.

---
*Phase: 03-web-app-core*
*Completed: 2026-03-22*
