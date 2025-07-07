"use client";

import { useState } from "react";

export default function VoteButtons({
  score,
  onVote,
  disabled,
}: {
  score: number;
  onVote: (value: number) => void;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleVote(value: number) {
    if (disabled || loading) return;
    setLoading(true);
    await onVote(value);
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote(1)}
        disabled={disabled || loading}
        className="px-2 py-1 text-green-600"
      >
        👍
      </button>
      <span className="text-sm">{score}</span>
      <button
        onClick={() => handleVote(-1)}
        disabled={disabled || loading}
        className="px-2 py-1 text-red-600"
      >
        👎
      </button>
    </div>
  );
}
