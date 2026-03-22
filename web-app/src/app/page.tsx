import type { Metadata } from "next"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Pricing } from "@/components/landing/pricing"
import { FAQ } from "@/components/landing/faq"

export const metadata: Metadata = {
  title: "ClauseGuard - AI Contract Analysis for Indian Law",
  description:
    "Paste any contract and get instant clause-by-clause risk analysis with India-specific legal awareness. Powered by AI.",
  openGraph: {
    title: "ClauseGuard - AI Contract Analysis for Indian Law",
    description:
      "Paste any contract and get instant clause-by-clause risk analysis with India-specific legal awareness.",
    type: "website",
  },
}

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Pricing />
      <FAQ />
    </>
  )
}
