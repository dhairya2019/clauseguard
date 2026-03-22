import { z } from "zod";

export const clauseSchema = z.object({
  clauseNumber: z.number(),
  title: z.string(),
  category: z.enum([
    "payment_terms",
    "ip_ownership",
    "termination",
    "liability_indemnification",
    "scope_of_work",
    "non_compete",
    "confidentiality",
    "other",
  ]),
  originalText: z.string().optional(),
  risk: z.enum(["high", "medium", "low"]),
  explanation: z.string(),
  concerns: z.array(z.string()).optional(),
  suggestion: z.string(),
  indiaNote: z.string().optional(),
  escalation: z.boolean().optional(),
});

export const contractAnalysisSchema = z.object({
  documentType: z.enum([
    "freelance_agreement",
    "nda",
    "terms_of_service",
    "employment",
    "saas",
    "vendor",
    "other",
  ]),
  parties: z
    .object({
      party_a: z.string(),
      party_b: z.string(),
    })
    .optional(),
  riskScore: z.enum(["high", "medium", "low"]),
  riskSummary: z.string(),
  riskBreakdown: z.object({
    high: z.number(),
    medium: z.number(),
    low: z.number(),
  }),
  clauses: z.array(clauseSchema),
  missingClauses: z.array(
    z.object({
      name: z.string(),
      importance: z.enum(["critical", "high", "medium", "low"]),
      note: z.string(),
    })
  ),
  escalationFlags: z.array(z.string()).optional(),
  disclaimer: z.string(),
});

export type ContractAnalysis = z.infer<typeof contractAnalysisSchema>;
export type Clause = z.infer<typeof clauseSchema>;
