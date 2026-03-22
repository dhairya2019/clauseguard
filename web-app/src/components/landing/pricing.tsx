import Link from "next/link"
import { Check } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with contract analysis",
    features: [
      "3 analyses per month",
      "Full clause-by-clause breakdown",
      "India-specific legal flags",
      "Safer alternative suggestions",
    ],
    cta: "Start Free",
    href: "/analyze",
    disabled: false,
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$19/mo",
    description: "For professionals and teams",
    features: [
      "Unlimited analyses",
      "Priority processing",
      "Export reports",
    ],
    cta: "Coming Soon",
    href: "#",
    disabled: true,
    highlighted: false,
  },
] as const

export function Pricing() {
  return (
    <section id="pricing" className="py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Simple Pricing
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Start analyzing contracts for free. Upgrade when you need more.
        </p>

        <div className="mx-auto mt-12 grid max-w-3xl gap-6 lg:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                plan.highlighted && "ring-2 ring-primary/20"
              )}
            >
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{plan.price}</p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="size-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.disabled ? (
                  <span className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-secondary px-3 text-sm font-medium text-secondary-foreground opacity-60">
                    {plan.cta}
                  </span>
                ) : (
                  <Link
                    href={plan.href}
                    className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
                  >
                    {plan.cta}
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
