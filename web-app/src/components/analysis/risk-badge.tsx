"use client";

import { riskConfig } from "@/lib/risk-config";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";

const iconMap = {
  high: AlertTriangle,
  medium: AlertCircle,
  low: CheckCircle2,
} as const;

interface RiskBadgeProps {
  risk?: "high" | "medium" | "low";
}

export function RiskBadge({ risk = "low" }: RiskBadgeProps) {
  const config = riskConfig[risk];
  const Icon = iconMap[risk];

  return (
    <Badge variant={config.badgeVariant}>
      <Icon className="size-4" />
      {config.label}
    </Badge>
  );
}
