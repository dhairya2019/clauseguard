"use client";

import { Card, CardContent } from "@/components/ui/card";
import { riskConfig } from "@/lib/risk-config";
import { Shield } from "lucide-react";

interface RiskSummaryProps {
  breakdown?: Partial<{ high: number; medium: number; low: number }>;
  score?: string;
  summary?: string;
}

const levelColors = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
} as const;

export function RiskSummary({ breakdown, score, summary }: RiskSummaryProps) {
  if (!breakdown) return null;

  const high = breakdown.high ?? 0;
  const medium = breakdown.medium ?? 0;
  const low = breakdown.low ?? 0;
  const total = high + medium + low;

  const riskLevel = (score as "high" | "medium" | "low") ?? "low";
  const config = riskConfig[riskLevel];

  return (
    <Card>
      <CardContent className="space-y-4">
        {/* Overall risk score */}
        <div className="flex items-center gap-3">
          <Shield className={`size-6 ${config.textColor}`} />
          <div>
            <p className={`text-lg font-semibold ${config.textColor}`}>
              {config.label}
            </p>
            {summary && (
              <p className="text-sm text-muted-foreground">{summary}</p>
            )}
          </div>
        </div>

        {/* Per-level counts */}
        <div className="flex items-center gap-4 text-sm">
          {(["high", "medium", "low"] as const).map((level) => {
            const count =
              level === "high" ? high : level === "medium" ? medium : low;
            return (
              <div key={level} className="flex items-center gap-1.5">
                <span
                  className={`inline-block h-3 w-3 rounded-full ${levelColors[level]}`}
                />
                <span>
                  {count} {riskConfig[level].label.split(" ")[0].toLowerCase()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Proportional bar */}
        {total > 0 && (
          <div className="flex h-2 overflow-hidden rounded-full">
            {high > 0 && (
              <div
                className="bg-red-500"
                style={{ flexGrow: high }}
              />
            )}
            {medium > 0 && (
              <div
                className="bg-yellow-500"
                style={{ flexGrow: medium }}
              />
            )}
            {low > 0 && (
              <div
                className="bg-green-500"
                style={{ flexGrow: low }}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
