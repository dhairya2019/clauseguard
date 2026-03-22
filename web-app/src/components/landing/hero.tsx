import Link from "next/link"
import { Shield } from "lucide-react"

export function Hero() {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
          <Shield className="size-8 text-primary" />
        </div>

        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight lg:text-6xl">
          Understand Your Contracts in Minutes, Not Hours
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Paste any contract and get instant clause-by-clause risk analysis with
          India-specific legal awareness. Powered by AI.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3">
          <Link
            href="/analyze"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Analyze a Contract Free
          </Link>
          <p className="text-sm text-muted-foreground">No signup required</p>
        </div>
      </div>
    </section>
  )
}
