"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

interface Props {
  error: string;
  onRetry: () => void;
}

export function LandingStatsError({ error, onRetry }: Props) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await onRetry();
    // Keep spinning for a moment even after retry starts
    setTimeout(() => setIsRetrying(false), 1000);
  };

  return (
    <section className="relative px-4 mt-0">
      <div className="max-w-3xl mx-auto">
        <div
          className="rounded-lg p-6 md:p-8 text-center backdrop-blur-sm"
          style={{
            backgroundColor: "oklch(from var(--off-white) l c h / 0.9)",
            border: "2px solid oklch(from var(--primary) l c h / 0.2)"
          }}
        >
          {/* Error icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: "oklch(from var(--primary) l c h / 0.1)"
              }}
            >
              <AlertCircle
                className="w-6 h-6"
                style={{ color: "var(--primary)" }}
              />
            </div>
          </div>

          {/* Error message */}
          <p
            className="font-medium mb-2"
            style={{ color: "var(--primary)" }}
          >
            Unable to load statistics
          </p>
          <p
            className="text-sm mb-6"
            style={{ color: "oklch(from var(--primary) calc(l * 1.2) calc(c * 0.7) h)" }}
          >
            {error}
          </p>

          {/* Retry button */}
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--off-white)"
            }}
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    </section>
  );
}
