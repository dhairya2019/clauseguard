"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { contractAnalysisSchema } from "@/lib/schemas";
import { ContractInput } from "@/components/analysis/contract-input";
import { ResultsPanel } from "@/components/analysis/results-panel";

export default function AnalyzePage() {
  const { object, submit, isLoading, stop, error } = useObject({
    api: "/api/analyze",
    schema: contractAnalysisSchema,
  });

  const handleAnalyze = (contractText: string) => {
    submit({ contractText, analysisType: "full" });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
      {/* Left panel: Contract input */}
      <div className="w-full lg:w-1/2">
        <h1 className="text-2xl font-bold mb-4">Analyze Your Contract</h1>
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
    </div>
  );
}
