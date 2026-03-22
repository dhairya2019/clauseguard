export const riskConfig = {
  high: {
    label: "High Risk",
    borderColor: "border-l-red-500",
    bgColor: "bg-red-50",
    badgeVariant: "destructive" as const,
    icon: "AlertTriangle",
    textColor: "text-red-700",
  },
  medium: {
    label: "Medium Risk",
    borderColor: "border-l-yellow-500",
    bgColor: "bg-yellow-50",
    badgeVariant: "secondary" as const,
    icon: "AlertCircle",
    textColor: "text-yellow-700",
  },
  low: {
    label: "Low Risk",
    borderColor: "border-l-green-500",
    bgColor: "bg-green-50",
    badgeVariant: "outline" as const,
    icon: "CheckCircle",
    textColor: "text-green-700",
  },
} as const;
