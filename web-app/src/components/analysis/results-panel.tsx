"use client";

import { RiskSummary } from "./risk-summary";
import { ClauseCard } from "./clause-card";
import { Disclaimer } from "./disclaimer";
import { ClauseSkeleton } from "./clause-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface ResultsPanelProps {
  object: DeepPartial<Record<string, unknown>> | undefined;
  isLoading: boolean;
  error?: Error | undefined;
}

export function ResultsPanel({ object, isLoading, error }: ResultsPanelProps) {
  // Error state
  if (error) {
    return (
      <Card className="border-red-300 bg-red-50">
        <CardContent>
          <p className="text-sm text-red-700">
            <span className="font-medium">Analysis error: </span>
            {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Initial loading (no data yet)
  if (isLoading && !object) {
    return <ClauseSkeleton />;
  }

  // Data available (streaming or complete)
  if (object) {
    const data = object as Record<string, unknown>;
    const clauses = data.clauses as Array<Record<string, unknown>> | undefined;

    return (
      <div className="space-y-4">
        <RiskSummary
          breakdown={
            data.riskBreakdown as
              | Partial<{ high: number; medium: number; low: number }>
              | undefined
          }
          score={data.riskScore as string | undefined}
          summary={data.riskSummary as string | undefined}
        />

        {clauses?.map((clause, i) => (
          <ClauseCard key={i} clause={clause as Record<string, unknown>} />
        ))}

        {isLoading && clauses && clauses.length > 0 && (
          <ClauseSkeleton count={1} />
        )}

        <Disclaimer text={data.disclaimer as string | undefined} />
      </div>
    );
  }

  // Empty state (no analysis started)
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FileText className="mb-4 size-12 text-muted-foreground/50" />
      <p className="text-muted-foreground">
        Paste a contract and click Analyze to see results
      </p>
    </div>
  );
}
