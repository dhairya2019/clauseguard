# Phase 3: Web App Core - Research

**Researched:** 2026-03-22
**Domain:** Next.js App Router + Vercel AI SDK + shadcn/ui streaming analysis UI
**Confidence:** HIGH

## Summary

Phase 3 builds a Next.js web application that lets users paste contract text and receive streaming clause-by-clause analysis powered by Claude. The existing MCP server (Phase 2) already contains the system prompt, Zod schemas, and TypeScript interfaces needed for analysis. The web app reuses these artifacts and adds a streaming UI layer using Vercel AI SDK's `streamText` + `Output.object()` pattern with the `useObject` React hook for progressive rendering.

The critical technical challenge is streaming a structured JSON object (the `ContractAnalysis` type) so that clause cards appear progressively as the AI generates each clause. Vercel AI SDK v6 solves this with `streamText` using `Output.object({ schema })` on the server and `experimental_useObject` (aliased `useObject`) on the client, which provides a partial object that updates as JSON chunks arrive. Each clause in the `clauses` array will appear as soon as it is generated, enabling progressive card rendering.

**Primary recommendation:** Use `streamText` with `Output.object()` pattern (NOT raw `streamObject`) for the API route, `useObject` hook on the client, share types by direct import from `mcp-server/src/` via TypeScript path aliases, and build the UI with shadcn/ui Card + Badge components styled with Tailwind border-left color coding.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WEB-01 | Next.js App Router + Tailwind CSS + shadcn/ui | Standard stack section: `create-next-app` + `shadcn init` setup |
| WEB-02 | Landing page with hero, how-it-works, pricing, FAQ (SSR) | Architecture patterns: landing page structure, all Server Components for SSR |
| WEB-03 | Analysis page with textarea + results panel | Architecture patterns: responsive layout with `flex-col lg:flex-row` |
| WEB-04 | Streaming AI via Vercel AI SDK Route Handler calling Claude | Core pattern: `streamText` + `Output.object()` + `@ai-sdk/anthropic` provider |
| WEB-05 | Clause cards with color-coded risk (red/yellow/green border-left) | Code examples: ClauseCard component with risk-based border colors |
| WEB-06 | Risk summary dashboard (counts per risk level) | Code examples: RiskSummary component computing from partial object |
| WEB-07 | Progressive streaming UX: skeleton loaders, fade-in cards | useObject partial rendering + CSS transitions |
| WEB-08 | India-specific rules in system prompt | Direct import of `buildSystemPrompt()` from mcp-server |
| WEB-09 | Legal disclaimer on every analysis output | ContractAnalysis.disclaimer field rendered as footer |
| WEB-10 | Mobile-responsive, professional design | Tailwind responsive utilities, shadcn/ui defaults |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.x | App Router framework | Industry standard for React SSR/SSG, required by spec |
| react / react-dom | 19.x | UI library | Ships with Next.js 15 |
| ai | ^6.0 (latest) | Vercel AI SDK core | `streamText`, `Output.object()`, streaming protocol |
| @ai-sdk/react | ^6.0 | React hooks | `useObject` hook for streaming structured data |
| @ai-sdk/anthropic | latest | Claude provider | Connects AI SDK to Claude API |
| tailwindcss | v4 | Utility CSS | Ships with `create-next-app --tailwind`, zero config in v4 |
| zod | ^3.25 | Schema validation | Shared with MCP server, used by AI SDK for `Output.object()` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | latest CLI | Component library | Card, Badge, Button, Textarea, Accordion, Skeleton |
| lucide-react | latest | Icons | Shield, AlertTriangle, CheckCircle for risk indicators |
| class-variance-authority | latest | Variant styling | Installed by shadcn/ui, used for ClauseCard variants |
| clsx + tailwind-merge | latest | Class merging | Installed by shadcn/ui as `cn()` utility |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Route Handler | Server Action | AI SDK v6 supports both; Route Handler is simpler for single-request streaming (no chat history needed) |
| useObject | Custom fetch + ReadableStream | useObject handles JSON parsing, partial objects, loading state automatically |
| shadcn/ui | Radix + custom CSS | shadcn gives pre-built accessible components with zero lock-in |

**Installation:**
```bash
# Create Next.js app (inside project root as web-app/)
npx create-next-app@latest web-app --ts --tailwind --eslint --app --src-dir --import-alias "@/*"

# Initialize shadcn/ui
cd web-app && npx shadcn@latest init

# Install AI SDK + Anthropic provider
npm install ai @ai-sdk/react @ai-sdk/anthropic zod

# Add shadcn components needed
npx shadcn@latest add card badge button textarea accordion skeleton separator
```

## Architecture Patterns

### Recommended Project Structure
```
web-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (fonts, metadata, nav)
│   │   ├── page.tsx                # Landing page (Server Component)
│   │   ├── analyze/
│   │   │   └── page.tsx            # Analysis page (Client Component)
│   │   └── api/
│   │       └── analyze/
│   │           └── route.ts        # POST Route Handler (streaming)
│   ├── components/
│   │   ├── ui/                     # shadcn/ui generated components
│   │   ├── landing/                # Landing page sections
│   │   │   ├── hero.tsx
│   │   │   ├── how-it-works.tsx
│   │   │   ├── pricing.tsx
│   │   │   └── faq.tsx
│   │   ├── analysis/               # Analysis feature components
│   │   │   ├── contract-input.tsx
│   │   │   ├── clause-card.tsx
│   │   │   ├── risk-summary.tsx
│   │   │   ├── risk-badge.tsx
│   │   │   ├── results-panel.tsx
│   │   │   └── disclaimer.tsx
│   │   └── layout/
│   │       ├── navbar.tsx
│   │       └── footer.tsx
│   ├── lib/
│   │   ├── utils.ts                # cn() utility (shadcn default)
│   │   ├── schemas.ts              # Re-export/adapt Zod schema for AI SDK
│   │   └── prompts.ts              # Re-export buildSystemPrompt
│   └── types/
│       └── analysis.ts             # Shared ContractAnalysis type
├── .env.local                      # ANTHROPIC_API_KEY
├── next.config.ts
├── tailwind.config.ts              # (if v3) or automatic in v4
├── components.json                 # shadcn config
├── tsconfig.json
└── package.json
```

### Pattern 1: Streaming Structured Object via Route Handler

**What:** Use `streamText` with `Output.object()` to stream a complete `ContractAnalysis` JSON object, consumed by `useObject` on the client.

**When to use:** Single-request analysis (not multi-turn chat). User submits contract text, receives streaming structured result.

**Server (Route Handler):**
```typescript
// web-app/src/app/api/analyze/route.ts
import { streamText, Output } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { contractAnalysisSchema } from '@/lib/schemas';
import { buildSystemPrompt, buildUserMessage } from '@/lib/prompts';

export const maxDuration = 60; // Allow up to 60s for long contracts

export async function POST(req: Request) {
  const { contractText, analysisType, partyPerspective } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-5-20250514'),
    system: buildSystemPrompt(),
    output: Output.object({ schema: contractAnalysisSchema }),
    prompt: buildUserMessage(contractText, analysisType, partyPerspective),
  });

  return result.toTextStreamResponse();
}
```

**Client (useObject hook):**
```typescript
// web-app/src/app/analyze/page.tsx
'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { contractAnalysisSchema } from '@/lib/schemas';

export default function AnalyzePage() {
  const { object, submit, isLoading, stop, error } = useObject({
    api: '/api/analyze',
    schema: contractAnalysisSchema,
  });

  const handleAnalyze = (contractText: string) => {
    submit({ contractText, analysisType: 'full' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
      {/* Left: Input */}
      <div className="w-full lg:w-1/2">
        <ContractInput onSubmit={handleAnalyze} disabled={isLoading} />
      </div>
      {/* Right: Results */}
      <div className="w-full lg:w-1/2">
        {object && <RiskSummary breakdown={object.riskBreakdown} score={object.riskScore} />}
        {object?.clauses?.map((clause, i) => (
          <ClauseCard key={i} clause={clause} />
        ))}
        {object?.disclaimer && <Disclaimer text={object.disclaimer} />}
      </div>
    </div>
  );
}
```

### Pattern 2: Shared Types via Direct Import with Path Aliases

**What:** Import the system prompt and types from `mcp-server/src/` directly into the web app using TypeScript path aliases, avoiding code duplication.

**When to use:** When both packages are in the same repo and the MCP server exports raw TypeScript.

**Setup (web-app/tsconfig.json):**
```json
{
  "compilerOptions": {
    "paths": {
      "@clauseguard/core/*": ["../mcp-server/src/*"]
    }
  }
}
```

**Setup (next.config.ts) -- needed for Next.js to resolve outside src/:**
```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['../mcp-server'],
  webpack: (config) => {
    config.resolve.alias['@clauseguard/core'] = require('path').resolve(__dirname, '../mcp-server/src');
    return config;
  },
};

export default nextConfig;
```

**ALTERNATIVE (simpler, recommended):** Copy the shared files (`system-prompt.ts`, contract schema Zod version, `ContractAnalysis` type) into `web-app/src/lib/`. This avoids cross-package resolution issues and is simpler for a 2-package project. The system prompt and types are stable artifacts that change rarely.

**Recommendation:** Copy the shared files. The MCP server uses a raw JSON Schema object (`CONTRACT_ANALYSIS_SCHEMA`) for the Anthropic SDK tool_use pattern, but the web app needs a Zod schema for `Output.object()`. Create a Zod schema in `web-app/src/lib/schemas.ts` that matches the `ContractAnalysis` interface. The `buildSystemPrompt()` function can be copied as-is.

### Pattern 3: Landing Page as Server Component (SEO)

**What:** All landing page sections are Server Components (no `"use client"` directive). Only the analysis page needs client-side interactivity.

**When to use:** Always for the landing page. SSR ensures search engines index the content.

```typescript
// web-app/src/app/page.tsx (Server Component - no "use client")
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Pricing } from '@/components/landing/pricing';
import { FAQ } from '@/components/landing/faq';

export const metadata = {
  title: 'ClauseGuard - AI Contract Analysis for Indian Law',
  description: 'Paste any contract and get instant clause-by-clause risk analysis with India-specific legal awareness.',
};

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Pricing />
      <FAQ />
    </main>
  );
}
```

### Anti-Patterns to Avoid
- **Using `useChat` for analysis:** `useChat` is for multi-turn conversations. This is a single-request analysis. Use `useObject` with `submit()`.
- **Building custom SSE/fetch streaming:** AI SDK handles the streaming protocol, partial JSON parsing, and error handling. Do not hand-roll `ReadableStream` parsing.
- **Putting `"use client"` on the landing page:** Kills SSR benefits. Only the analysis page and interactive components need it.
- **Using the raw `@anthropic-ai/sdk` directly:** The MCP server uses this, but the web app should use `@ai-sdk/anthropic` provider which integrates with AI SDK streaming protocol.
- **Streaming raw text then parsing JSON:** The `Output.object()` pattern handles JSON streaming natively. Do not stream text and try to parse partial JSON manually.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Streaming JSON parsing | Custom SSE parser + JSON.parse on chunks | `useObject` hook from `@ai-sdk/react` | Handles partial objects, undefined fields, error states, abort |
| Component styling | Custom CSS for cards, badges, buttons | shadcn/ui Card, Badge, Button | Accessible, themeable, Tailwind-native, copy-paste ownership |
| Responsive layout | Custom media queries | Tailwind responsive prefixes (`lg:flex-row`) | Less code, more maintainable |
| Loading skeletons | Custom shimmer animations | shadcn/ui Skeleton component | Consistent with design system |
| FAQ accordion | Custom expand/collapse | shadcn/ui Accordion (Radix-based) | Keyboard accessible, animated |
| Risk color mapping | Scattered inline conditionals | Single `riskConfig` map object | Centralized, type-safe |
| Route Handler streaming | Manual `ReadableStream` + `TextEncoder` | `result.toTextStreamResponse()` | AI SDK handles encoding, headers, protocols |

**Key insight:** The Vercel AI SDK's `Output.object()` + `useObject` pattern solves the hardest problem in this phase -- streaming a structured JSON object and progressively rendering it. Without this, you would need custom SSE parsing, incremental JSON parsing, and manual state management for partial objects.

## Common Pitfalls

### Pitfall 1: useObject Returns Deeply Partial Objects
**What goes wrong:** During streaming, `object.clauses[0].title` might be `undefined` even though `object.clauses[0]` exists. Every nested field can be `undefined` at any point.
**Why it happens:** `useObject` provides the object as-is during streaming. Fields populate in JSON generation order.
**How to avoid:** Use optional chaining (`?.`) everywhere when rendering partial objects. Design components to gracefully handle missing fields (show skeleton/placeholder).
**Warning signs:** `TypeError: Cannot read properties of undefined` in the console during streaming.

### Pitfall 2: ANTHROPIC_API_KEY Exposure
**What goes wrong:** API key leaks to the client bundle.
**Why it happens:** Using the key in a Client Component or importing it without the route handler boundary.
**How to avoid:** Only reference `ANTHROPIC_API_KEY` in Route Handlers (`app/api/`). Next.js only exposes env vars prefixed with `NEXT_PUBLIC_` to the client. The `@ai-sdk/anthropic` provider reads `ANTHROPIC_API_KEY` automatically on the server.
**Warning signs:** Key visible in browser Network tab or source.

### Pitfall 3: maxDuration Not Set on Route Handler
**What goes wrong:** Route handler times out after 10-15 seconds on Vercel (default function timeout).
**Why it happens:** Long contracts can take 30-60 seconds to analyze with Claude.
**How to avoid:** Export `maxDuration = 60` from the route handler file. On Vercel, this extends the serverless function timeout.
**Warning signs:** 504 Gateway Timeout on longer contracts.

### Pitfall 4: Zod Schema Mismatch Between Server and Client
**What goes wrong:** `useObject` fails to parse streaming data because the client schema doesn't match what the server sends.
**Why it happens:** Defining the schema in two places with subtle differences.
**How to avoid:** Define the Zod schema in a single file (`lib/schemas.ts`) imported by both the Route Handler and the client component.
**Warning signs:** `useObject` error state triggers, or `object` is always null.

### Pitfall 5: Landing Page Performance (3G Target)
**What goes wrong:** Page takes >3 seconds on 3G because of large JS bundles.
**Why it happens:** Importing analysis components on the landing page, or using heavy fonts/images.
**How to avoid:** Landing page is pure Server Components with zero client JS. Analysis page uses dynamic import. Use `next/font` for fonts (self-hosted, no external requests). No hero images larger than 100KB.
**Warning signs:** Lighthouse score below 90 on simulated 3G.

### Pitfall 6: Streaming Protocol Mismatch
**What goes wrong:** `useObject` doesn't receive data from the Route Handler.
**Why it happens:** Using `toUIMessageStreamResponse()` instead of `toTextStreamResponse()` for object streaming (or vice versa).
**How to avoid:** For `useObject`, the server MUST return `result.toTextStreamResponse()`. The `toUIMessageStreamResponse()` is for `useChat`.
**Warning signs:** Client receives data but `object` stays null.

## Code Examples

### Zod Schema for AI SDK (adapted from MCP server JSON Schema)
```typescript
// web-app/src/lib/schemas.ts
import { z } from 'zod';

export const clauseSchema = z.object({
  clauseNumber: z.number(),
  title: z.string(),
  category: z.enum([
    'payment_terms', 'ip_ownership', 'termination',
    'liability_indemnification', 'scope_of_work',
    'non_compete', 'confidentiality', 'other',
  ]),
  originalText: z.string().optional(),
  risk: z.enum(['high', 'medium', 'low']),
  explanation: z.string(),
  concerns: z.array(z.string()).optional(),
  suggestion: z.string(),
  indiaNote: z.string().optional(),
  escalation: z.boolean().optional(),
});

export const contractAnalysisSchema = z.object({
  documentType: z.enum([
    'freelance_agreement', 'nda', 'terms_of_service',
    'employment', 'saas', 'vendor', 'other',
  ]),
  parties: z.object({
    party_a: z.string(),
    party_b: z.string(),
  }).optional(),
  riskScore: z.enum(['high', 'medium', 'low']),
  riskSummary: z.string(),
  riskBreakdown: z.object({
    high: z.number(),
    medium: z.number(),
    low: z.number(),
  }),
  clauses: z.array(clauseSchema),
  missingClauses: z.array(z.object({
    name: z.string(),
    importance: z.enum(['critical', 'high', 'medium', 'low']),
    note: z.string(),
  })),
  escalationFlags: z.array(z.string()).optional(),
  disclaimer: z.string(),
});

export type ContractAnalysis = z.infer<typeof contractAnalysisSchema>;
```

### Risk Configuration Map
```typescript
// web-app/src/lib/risk-config.ts
export const riskConfig = {
  high: {
    label: 'High Risk',
    borderColor: 'border-l-red-500',
    bgColor: 'bg-red-50',
    badgeVariant: 'destructive' as const,
    icon: 'AlertTriangle',
    textColor: 'text-red-700',
  },
  medium: {
    label: 'Medium Risk',
    borderColor: 'border-l-yellow-500',
    bgColor: 'bg-yellow-50',
    badgeVariant: 'secondary' as const,
    icon: 'AlertCircle',
    textColor: 'text-yellow-700',
  },
  low: {
    label: 'Low Risk',
    borderColor: 'border-l-green-500',
    bgColor: 'bg-green-50',
    badgeVariant: 'outline' as const,
    icon: 'CheckCircle',
    textColor: 'text-green-700',
  },
} as const;
```

### ClauseCard Component
```typescript
// web-app/src/components/analysis/clause-card.tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { riskConfig } from '@/lib/risk-config';
import type { ContractAnalysis } from '@/lib/schemas';

type Clause = NonNullable<ContractAnalysis['clauses']>[number];

export function ClauseCard({ clause }: { clause: Partial<Clause> }) {
  const risk = clause?.risk ?? 'low';
  const config = riskConfig[risk];

  return (
    <Card className={`border-l-4 ${config.borderColor} ${config.bgColor} mb-4 animate-in fade-in duration-500`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {clause?.title ?? 'Analyzing...'}
          </CardTitle>
          <Badge variant={config.badgeVariant}>
            {config.label}
          </Badge>
        </div>
        {clause?.category && (
          <span className="text-xs text-muted-foreground capitalize">
            {clause.category.replace(/_/g, ' ')}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {clause?.explanation && <p>{clause.explanation}</p>}
        {clause?.suggestion && (
          <div className="bg-white/60 rounded p-2 text-xs">
            <span className="font-medium">Suggested alternative: </span>
            {clause.suggestion}
          </div>
        )}
        {clause?.indiaNote && (
          <div className="text-xs italic text-blue-700 border-l-2 border-blue-300 pl-2">
            {clause.indiaNote}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Risk Summary Dashboard
```typescript
// web-app/src/components/analysis/risk-summary.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { riskConfig } from '@/lib/risk-config';

interface RiskBreakdown {
  high?: number;
  medium?: number;
  low?: number;
}

export function RiskSummary({
  breakdown,
  score,
  summary,
}: {
  breakdown?: Partial<RiskBreakdown>;
  score?: string;
  summary?: string;
}) {
  if (!breakdown) return null;

  const levels = ['high', 'medium', 'low'] as const;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        {score && (
          <div className={`text-lg font-semibold mb-2 ${riskConfig[score as keyof typeof riskConfig]?.textColor}`}>
            Overall: {riskConfig[score as keyof typeof riskConfig]?.label}
          </div>
        )}
        {summary && <p className="text-sm text-muted-foreground mb-4">{summary}</p>}
        <div className="flex gap-4">
          {levels.map((level) => (
            <div key={level} className={`flex items-center gap-2 ${riskConfig[level].textColor}`}>
              <span className={`w-3 h-3 rounded-full ${riskConfig[level].borderColor.replace('border-l-', 'bg-')}`} />
              <span className="text-sm font-medium">{breakdown[level] ?? 0} {level}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Route Handler with System Prompt
```typescript
// web-app/src/app/api/analyze/route.ts
import { streamText, Output } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { contractAnalysisSchema } from '@/lib/schemas';
import { buildSystemPrompt, buildUserMessage } from '@/lib/prompts';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { contractText, analysisType = 'full', partyPerspective } = await req.json();

  if (!contractText || contractText.length < 50) {
    return Response.json(
      { error: 'Contract text must be at least 50 characters' },
      { status: 400 },
    );
  }

  const result = streamText({
    model: anthropic('claude-sonnet-4-5-20250514'),
    system: buildSystemPrompt(),
    output: Output.object({ schema: contractAnalysisSchema }),
    prompt: buildUserMessage(contractText, analysisType, partyPerspective),
  });

  return result.toTextStreamResponse();
}
```

### Disclaimer Component
```typescript
// web-app/src/components/analysis/disclaimer.tsx
import { Separator } from '@/components/ui/separator';

export function Disclaimer({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <>
      <Separator className="my-4" />
      <p className="text-xs text-muted-foreground italic px-2 py-3 bg-slate-50 rounded">
        {text}
      </p>
    </>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useChat` + parse markdown | `useObject` + structured streaming | AI SDK v4+ (2024) | Type-safe progressive rendering |
| `streamObject()` standalone | `streamText` + `Output.object()` | AI SDK v6 (Feb 2026) | Unified API, same function handles text and object output |
| API routes (`pages/api/`) | Route Handlers (`app/api/route.ts`) | Next.js 13+ (2023) | App Router standard |
| tailwind.config.js | Tailwind v4 CSS-first config | Tailwind v4 (2025) | No config file needed with `create-next-app` |
| `npx shadcn-ui@latest init` | `npx shadcn@latest init` | shadcn 2024 rebrand | Simplified CLI name |
| `AnthropicStream` helper | `@ai-sdk/anthropic` provider | AI SDK v3+ (2024) | `AnthropicStream` is deprecated/removed in v6 |

**Deprecated/outdated:**
- `AnthropicStream` / `StreamingTextResponse`: Removed in AI SDK v6. Use provider + `streamText` instead.
- `@anthropic-ai/sdk` direct usage in web app: Use `@ai-sdk/anthropic` which wraps it with AI SDK streaming protocol.
- `streamObject()` as standalone function: Still works but `streamText` + `Output.object()` is the v6 recommended pattern.

## Open Questions

1. **AI SDK v6 `useObject` stability**
   - What we know: The hook is exported as `experimental_useObject` in v6, suggesting it may still be experimental.
   - What's unclear: Whether there are breaking changes planned or if the `experimental_` prefix is just legacy naming.
   - Recommendation: Use it -- it is the documented approach. Import as `experimental_useObject as useObject` for cleaner code. If it breaks, the migration path will be straightforward.

2. **Vercel AI Gateway vs Direct Anthropic Provider**
   - What we know: AI SDK v6 defaults to Vercel AI Gateway which requires `AI_GATEWAY_API_KEY`. The `@ai-sdk/anthropic` provider uses `ANTHROPIC_API_KEY` directly.
   - What's unclear: Whether the gateway adds latency or has rate limits.
   - Recommendation: Use `@ai-sdk/anthropic` directly. The project already has `ANTHROPIC_API_KEY` from the MCP server. No need for a gateway intermediary.

3. **Tailwind v3 vs v4 with create-next-app**
   - What we know: `create-next-app@latest` with `--tailwind` now ships Tailwind v4 (CSS-first config, no `tailwind.config.ts`).
   - What's unclear: Whether shadcn/ui CLI fully supports Tailwind v4 theming.
   - Recommendation: Let `create-next-app` and `shadcn init` handle the versions. Both tools auto-detect and configure correctly as of 2026.

## Sources

### Primary (HIGH confidence)
- [AI SDK Official Docs - Next.js App Router](https://ai-sdk.dev/docs/getting-started/nextjs-app-router) - Setup, Route Handlers, streaming
- [AI SDK Cookbook - Stream Object](https://ai-sdk.dev/cookbook/next/stream-object) - `Output.object()` + `useObject` pattern
- [AI SDK Anthropic Provider](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic) - Provider setup, model names, env vars
- [AI SDK Object Generation Docs](https://ai-sdk.dev/docs/ai-sdk-ui/object-generation) - `useObject` hook API
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) - Setup and component installation
- Existing MCP server source code (`mcp-server/src/`) - System prompt, schemas, types

### Secondary (MEDIUM confidence)
- [Vercel Blog - AI SDK 6](https://vercel.com/blog/ai-sdk-6) - v6 changes, Agent abstraction, breaking changes
- [AI SDK Cookbook - Stream Text](https://ai-sdk.dev/cookbook/next/stream-text) - Text streaming patterns

### Tertiary (LOW confidence)
- None -- all critical patterns verified against official docs.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified against official docs, versions confirmed current
- Architecture: HIGH - `streamText` + `Output.object()` + `useObject` pattern is documented in official AI SDK cookbook
- Pitfalls: HIGH - Common issues documented in GitHub discussions and official troubleshooting
- Code examples: MEDIUM - Adapted from official examples to ClauseGuard domain; not tested

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (30 days - stack is stable, AI SDK v6 is fresh release)
