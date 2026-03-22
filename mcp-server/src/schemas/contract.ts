/**
 * Contract analysis schemas and types.
 *
 * - AnalyzeContractInput: Zod schema for MCP tool input validation
 * - CONTRACT_ANALYSIS_SCHEMA: JSON Schema for Claude tool_use structured output
 * - ContractAnalysis: TypeScript interface matching the JSON Schema
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schema (used by MCP registerTool for input validation)
// ---------------------------------------------------------------------------

export const AnalyzeContractInput = z.object({
  contract_text: z
    .string()
    .min(50)
    .describe("Full text of the contract to analyze"),
  analysis_type: z
    .enum(["full", "risk", "summary"])
    .default("full")
    .describe(
      "'full' = comprehensive, 'risk' = risks only, 'summary' = high-level overview",
    ),
  party_perspective: z
    .string()
    .optional()
    .describe(
      "Perspective for analysis: 'freelancer', 'client', 'employee', 'vendor'",
    ),
});

export type AnalyzeContractInputType = z.infer<typeof AnalyzeContractInput>;

// ---------------------------------------------------------------------------
// Output JSON Schema (used as Claude API tool_use input_schema)
// ---------------------------------------------------------------------------

export const CONTRACT_ANALYSIS_SCHEMA = {
  type: "object" as const,
  properties: {
    documentType: {
      type: "string" as const,
      enum: [
        "freelance_agreement",
        "nda",
        "terms_of_service",
        "employment",
        "saas",
        "vendor",
        "other",
      ],
    },
    parties: {
      type: "object" as const,
      properties: {
        party_a: { type: "string" as const },
        party_b: { type: "string" as const },
      },
      required: ["party_a", "party_b"] as const,
    },
    riskScore: {
      type: "string" as const,
      enum: ["high", "medium", "low"],
    },
    riskSummary: { type: "string" as const },
    riskBreakdown: {
      type: "object" as const,
      properties: {
        high: { type: "number" as const },
        medium: { type: "number" as const },
        low: { type: "number" as const },
      },
      required: ["high", "medium", "low"] as const,
    },
    clauses: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          clauseNumber: { type: "number" as const },
          title: { type: "string" as const },
          category: {
            type: "string" as const,
            enum: [
              "payment_terms",
              "ip_ownership",
              "termination",
              "liability_indemnification",
              "scope_of_work",
              "non_compete",
              "confidentiality",
              "other",
            ],
          },
          originalText: { type: "string" as const },
          risk: {
            type: "string" as const,
            enum: ["high", "medium", "low"],
          },
          explanation: { type: "string" as const },
          concerns: {
            type: "array" as const,
            items: { type: "string" as const },
          },
          suggestion: { type: "string" as const },
          indiaNote: { type: "string" as const },
          escalation: { type: "boolean" as const },
        },
        required: [
          "clauseNumber",
          "title",
          "category",
          "risk",
          "explanation",
          "suggestion",
        ] as const,
      },
    },
    missingClauses: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          name: { type: "string" as const },
          importance: {
            type: "string" as const,
            enum: ["critical", "high", "medium", "low"],
          },
          note: { type: "string" as const },
        },
        required: ["name", "importance", "note"] as const,
      },
    },
    escalationFlags: {
      type: "array" as const,
      items: { type: "string" as const },
    },
    disclaimer: { type: "string" as const },
  },
  required: [
    "documentType",
    "riskScore",
    "riskSummary",
    "riskBreakdown",
    "clauses",
    "missingClauses",
    "disclaimer",
  ] as const,
  additionalProperties: false as const,
} as const;

// ---------------------------------------------------------------------------
// TypeScript interface matching the JSON Schema
// ---------------------------------------------------------------------------

export interface ContractAnalysis {
  documentType:
    | "freelance_agreement"
    | "nda"
    | "terms_of_service"
    | "employment"
    | "saas"
    | "vendor"
    | "other";
  parties?: {
    party_a: string;
    party_b: string;
  };
  riskScore: "high" | "medium" | "low";
  riskSummary: string;
  riskBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  clauses: Array<{
    clauseNumber: number;
    title: string;
    category:
      | "payment_terms"
      | "ip_ownership"
      | "termination"
      | "liability_indemnification"
      | "scope_of_work"
      | "non_compete"
      | "confidentiality"
      | "other";
    originalText?: string;
    risk: "high" | "medium" | "low";
    explanation: string;
    concerns?: string[];
    suggestion: string;
    indiaNote?: string;
    escalation?: boolean;
  }>;
  missingClauses: Array<{
    name: string;
    importance: "critical" | "high" | "medium" | "low";
    note: string;
  }>;
  escalationFlags?: string[];
  disclaimer: string;
}
