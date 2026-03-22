"use client";

import { riskConfig } from "@/lib/risk-config";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RiskBadge } from "./risk-badge";
import type { Clause } from "@/lib/schemas";

interface ClauseCardProps {
  clause: Partial<Clause>;
}

function formatCategory(category?: string): string {
  if (!category) return "";
  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ClauseCard({ clause }: ClauseCardProps) {
  const risk = clause?.risk ?? "low";
  const config = riskConfig[risk];

  return (
    <Card
      className={`border-l-4 ${config.borderColor} ${config.bgColor} transition-opacity duration-500`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle>
              {clause?.clauseNumber ? `${clause.clauseNumber}. ` : ""}
              {clause?.title ?? "Analyzing..."}
            </CardTitle>
            {clause?.category && (
              <p className="text-xs text-muted-foreground">
                {formatCategory(clause.category)}
              </p>
            )}
          </div>
          <RiskBadge risk={clause?.risk} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {clause?.explanation && (
          <p className="text-sm leading-relaxed">{clause.explanation}</p>
        )}

        {clause?.concerns && clause.concerns.length > 0 && (
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {clause.concerns.map((concern, i) => (
              <li key={i}>{concern}</li>
            ))}
          </ul>
        )}

        {clause?.suggestion && (
          <div className="rounded-md bg-muted/50 p-3 text-sm">
            <span className="font-medium">Suggested alternative: </span>
            {clause.suggestion}
          </div>
        )}

        {clause?.indiaNote && (
          <div className="rounded-md border-l-4 border-l-blue-400 bg-blue-50 p-3 text-sm text-blue-800">
            <span className="font-medium">India-specific note: </span>
            {clause.indiaNote}
          </div>
        )}

        {clause?.escalation === true && (
          <div className="rounded-md bg-red-100 border border-red-300 p-3 text-sm text-red-800 font-medium">
            Consult a Lawyer — This clause has been flagged for professional
            legal review.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
