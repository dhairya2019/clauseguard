"use client";

import { useState, useEffect, useCallback } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { contractAnalysisSchema } from "@/lib/schemas";
import { ContractInput } from "@/components/analysis/contract-input";
import { ResultsPanel } from "@/components/analysis/results-panel";
import { UsageCounter } from "@/components/freemium/usage-counter";
import { useFingerprint } from "@/lib/fingerprint";
import {
  getLocalUsage,
  setLocalUsage,
  incrementLocalUsage,
  type UsageData,
} from "@/lib/usage";

export default function AnalyzePage() {
  const fingerprint = useFingerprint();
  const [usageData, setUsageData] = useState<UsageData>(() => getLocalUsage());
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Sync localStorage with server truth on mount / fingerprint ready
  useEffect(() => {
    async function syncUsage() {
      try {
        const headers: Record<string, string> = {};
        if (fingerprint) {
          headers["X-Fingerprint"] = fingerprint;
        }
        const res = await fetch("/api/payment/status", { headers });
        if (res.ok) {
          const serverUsage = await res.json();
          const synced: UsageData = {
            used: serverUsage.used,
            limit: serverUsage.limit,
            isPaid: serverUsage.isPaid,
          };
          setLocalUsage(synced);
          setUsageData(synced);
        }
      } catch {
        // Fallback to localStorage if server unreachable
      }
    }

    syncUsage();
  }, [fingerprint]);

  // Build dynamic headers for useObject (includes fingerprint)
  const getHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (fingerprint) {
      headers["X-Fingerprint"] = fingerprint;
    }
    return headers;
  }, [fingerprint]);

  const { object, submit, isLoading, stop, error } = useObject({
    api: "/api/analyze",
    schema: contractAnalysisSchema,
    headers: getHeaders,
    onError: (err) => {
      // Detect 429 LIMIT_REACHED from the error
      // useObject passes fetch errors through; check for limit reached
      if (err.message?.includes("LIMIT_REACHED") || err.message?.includes("429")) {
        setShowUpgradeModal(true);
      }
    },
  });

  const handleAnalyze = (contractText: string) => {
    // Check local usage first for instant feedback
    if (!usageData.isPaid && usageData.used >= usageData.limit) {
      setShowUpgradeModal(true);
      return;
    }

    // Optimistically increment local counter
    if (!usageData.isPaid) {
      const updated = incrementLocalUsage();
      setUsageData(updated);
    }

    submit({ contractText, analysisType: "full" });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
      {/* Left panel: Contract input */}
      <div className="w-full lg:w-1/2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Analyze Your Contract</h1>
          <UsageCounter
            used={usageData.used}
            limit={usageData.limit}
            isPaid={usageData.isPaid}
          />
        </div>
        <ContractInput onSubmit={handleAnalyze} disabled={isLoading} />
        {isLoading && (
          <button
            onClick={stop}
            className="mt-2 text-sm text-muted-foreground underline cursor-pointer"
          >
            Stop analysis
          </button>
        )}
        {showUpgradeModal && !usageData.isPaid && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-800">Free analysis limit reached</p>
            <p className="text-sm text-red-700 mt-1">
              You have used all {usageData.limit} free contract analyses. Upgrade to continue analyzing contracts.
            </p>
            {/* Upgrade modal / payment button will be wired in plan 04-02 */}
          </div>
        )}
      </div>

      {/* Right panel: Results */}
      <div className="w-full lg:w-1/2">
        <ResultsPanel object={object} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
}
