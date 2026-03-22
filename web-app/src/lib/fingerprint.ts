"use client";

import { useEffect, useState } from "react";

let cachedVisitorId: string | null = null;

export function useFingerprint(): string | null {
  const [visitorId, setVisitorId] = useState<string | null>(cachedVisitorId);

  useEffect(() => {
    if (cachedVisitorId) return;

    async function loadFingerprint() {
      const FingerprintJS = await import("@fingerprintjs/fingerprintjs");
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      cachedVisitorId = result.visitorId;
      setVisitorId(result.visitorId);
    }

    loadFingerprint();
  }, []);

  return visitorId;
}
