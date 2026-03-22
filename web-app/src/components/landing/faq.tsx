import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Is ClauseGuard a replacement for a lawyer?",
    answer:
      "No. ClauseGuard provides informational analysis to help you understand contracts better. For important agreements, always consult a qualified advocate.",
  },
  {
    question: "What types of contracts can I analyze?",
    answer:
      "Freelance agreements, NDAs, employment contracts, SaaS agreements, vendor contracts, and terms of service.",
  },
  {
    question: "How does India-specific analysis work?",
    answer:
      "Our AI is trained on Indian Contract Act (S.27, S.28, S.25), FEMA regulations, Copyright Act, and Arbitration Act provisions to flag India-specific risks.",
  },
  {
    question: "Is my contract data stored?",
    answer:
      "No. Contract text is sent directly to the AI for analysis and is not stored on our servers.",
  },
  {
    question: "How accurate is the analysis?",
    answer:
      "ClauseGuard identifies common contractual risks with high accuracy, but complex legal situations require professional legal counsel.",
  },
] as const

export function FAQ() {
  return (
    <section id="faq" className="py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Everything you need to know about ClauseGuard
        </p>

        <div className="mt-12">
          <Accordion>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <p>{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
