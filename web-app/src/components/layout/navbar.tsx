import Link from "next/link"
import { Shield } from "lucide-react"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Shield className="size-5" />
          <span>ClauseGuard</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm md:flex">
          <Link
            href="#how-it-works"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            How It Works
          </Link>
          <Link
            href="#pricing"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="#faq"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            FAQ
          </Link>
        </div>

        <Link
          href="/analyze"
          className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Analyze Contract
        </Link>
      </nav>
    </header>
  )
}
