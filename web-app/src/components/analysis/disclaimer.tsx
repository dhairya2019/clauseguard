"use client";

import { Separator } from "@/components/ui/separator";
import { ShieldAlert } from "lucide-react";

interface DisclaimerProps {
  text?: string;
}

export function Disclaimer({ text }: DisclaimerProps) {
  if (!text) return null;

  return (
    <div className="space-y-3">
      <Separator />
      <div className="flex items-start gap-2 rounded bg-slate-50 p-3">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-xs italic text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
