"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { contractAnalysisSchema } from "@/lib/schemas";
import { ContractInput } from "@/components/analysis/contract-input";

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

      {/* Right panel: Results (minimal -- Plan 03-03 adds full UI) */}
      <div className="w-full lg:w-1/2">
        {error && (
          <div className="text-red-600 p-4 border border-red-200 rounded">
            Error: {error.message}
          </div>
        )}
        {object && (
          <div className="space-y-4">
            {object.riskScore && (
              <div className="text-lg font-semibold">
                Overall Risk: {object.riskScore}
              </div>
            )}
            {object.riskSummary && (
              <p className="text-muted-foreground">{object.riskSummary}</p>
            )}
            {object.clauses?.map((clause, i) => (
              <div key={i} className="border rounded p-3">
                <div className="font-medium">{clause?.title}</div>
                <div className="text-sm text-muted-foreground">
                  {clause?.risk} risk
                </div>
                <p className="text-sm mt-1">{clause?.explanation}</p>
              </div>
            ))}
            {object.disclaimer && (
              <p className="text-xs text-muted-foreground italic mt-4">
                {object.disclaimer}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
