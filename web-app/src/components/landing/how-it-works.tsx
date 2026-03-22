import { FileText, Search, CheckCircle } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

const steps = [
  {
    icon: FileText,
    title: "Paste Your Contract",
    description:
      "Copy and paste your contract text into the analysis box",
  },
  {
    icon: Search,
    title: "AI Analyzes Every Clause",
    description:
      "Our AI reviews each clause for risks, missing protections, and India-specific legal issues",
  },
  {
    icon: CheckCircle,
    title: "Get Actionable Results",
    description:
      "See color-coded risk levels with plain English explanations and safer alternatives",
  },
] as const

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          How It Works
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Three simple steps to understand any contract
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {steps.map((step, i) => (
            <Card key={step.title}>
              <CardHeader>
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <step.icon className="size-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Step {i + 1}
                  </span>
                </div>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{step.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
