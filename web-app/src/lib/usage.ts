"use client";

const STORAGE_KEY = "clauseguard_usage";

export interface UsageData {
  used: number;
  limit: number;
  isPaid: boolean;
}

export function getLocalUsage(): UsageData {
  if (typeof window === "undefined") return { used: 0, limit: 3, isPaid: false };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Ignore parse errors
  }
  return { used: 0, limit: 3, isPaid: false };
}

export function setLocalUsage(data: UsageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

export function incrementLocalUsage(): UsageData {
  const current = getLocalUsage();
  const updated = { ...current, used: current.used + 1 };
  setLocalUsage(updated);
  return updated;
}

export function markLocalPaid(): void {
  setLocalUsage({ used: 0, limit: Infinity, isPaid: true });
}
