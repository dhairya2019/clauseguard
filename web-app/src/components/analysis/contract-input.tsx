"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const MIN_CHARS = 50;

interface ContractInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

export function ContractInput({ onSubmit, disabled }: ContractInputProps) {
  const [text, setText] = useState("");

  const charCount = text.length;
  const isValid = charCount >= MIN_CHARS;

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Paste your contract text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[300px] resize-y font-mono text-sm"
        disabled={disabled}
      />
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {charCount} characters{" "}
          {!isValid && (
            <span className="text-orange-600">
              (minimum {MIN_CHARS} required)
            </span>
          )}
        </span>
        <Button
          onClick={() => onSubmit(text)}
          disabled={!isValid || disabled}
          size="lg"
        >
          {disabled ? (
            <>
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Analyzing...
            </>
          ) : (
            "Analyze Contract"
          )}
        </Button>
      </div>
    </div>
  );
}
