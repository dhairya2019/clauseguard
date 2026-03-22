"use client";

import { Badge } from "@/components/ui/badge";

interface UsageCounterProps {
  used: number;
  limit: number;
  isPaid: boolean;
}

export function UsageCounter({ used, limit, isPaid }: UsageCounterProps) {
  if (isPaid) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Unlimited Plan
      </Badge>
    );
  }

  const remaining = Math.max(0, limit - used);
  const isLow = remaining <= 1;

  return (
    <Badge
      variant="outline"
      className={
        isLow
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-blue-50 text-blue-700 border-blue-200"
      }
    >
      {remaining} of {limit} free analyses remaining
    </Badge>
  );
}
