// components/VoteButtons.tsx
"use client";

import { useTransition } from "react";
import { voteOnDefinition, voteOnExample } from "@/app/actions/vote";

export default function VoteButtons({
  score,
  type,
  id,
}: {
  score: number;
  type: "definition" | "example";
  id: number;
}) {
  const [isPending, startTransition] = useTransition();

  const handleVote = (value: number) => {
    startTransition(async () => {
      try {
        if (type === "definition") {
          await voteOnDefinition(id, value);
        } else {
          await voteOnExample(id, value);
        }
      } catch (error) {
        console.error("Vote error:", error);
        alert(`Error voting: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isPending}
        onClick={() => handleVote(1)}
        className="disabled:opacity-50 hover:bg-gray-100 p-1 rounded"
      >
        👍
      </button>
      <span className="text-sm font-medium">{score}</span>
      <button
        disabled={isPending}
        onClick={() => handleVote(-1)}
        className="disabled:opacity-50 hover:bg-gray-100 p-1 rounded"
      >
        👎
      </button>
    </div>
  );
}