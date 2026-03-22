"use client";

import { useState, useEffect, useCallback } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { contractAnalysisSchema } from "@/lib/schemas";
import { ContractInput } from "@/components/analysis/contract-input";
import { ResultsPanel } from "@/components/analysis/results-panel";
import { UsageCounter } from "@/components/freemium/usage-counter";
import { UpgradeModal } from "@/components/freemium/upgrade-modal";
import { useFingerprint } from "@/lib/fingerprint";
import {
  getLocalUsage,
  setLocalUsage,
  incrementLocalUsage,
  markLocalPaid,
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

  const handlePaymentSuccess = () => {
    markLocalPaid();
    setUsageData({ used: 0, limit: Infinity, isPaid: true });
    setShowUpgradeModal(false);
  };

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
      </div>

      {/* Right panel: Results */}
      <div className="w-full lg:w-1/2">
        <ResultsPanel object={object} isLoading={isLoading} error={error} />
      </div>

      {/* Upgrade modal for payment */}
      <UpgradeModal
        open={showUpgradeModal && !usageData.isPaid}
        onOpenChange={setShowUpgradeModal}
        fingerprint={fingerprint}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
