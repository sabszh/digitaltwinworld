"use client";

import { inferAiAttitude } from "@/lib/profileScoring";
import type { SessionResult } from "@/types/world2046";

export function SessionDebugPanel({ result }: { result: SessionResult }) {
  if (process.env.NODE_ENV === "production") return null;
  const custom = result.completedDilemmas.filter((item) => item.customAnswer).length;
  return (
    <details className="glass fixed bottom-4 right-4 z-40 max-h-[46vh] max-w-lg overflow-auto rounded-2xl p-4 text-xs text-white/70">
      <summary className="cursor-pointer text-white">Session debug</summary>
      <p className="mt-3">AI-holdning: {inferAiAttitude(result.valueProfile)} · Egne løsninger: {custom}</p>
      <pre className="mt-3 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
    </details>
  );
}
