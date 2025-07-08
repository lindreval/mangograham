// components/VoteButtons.tsx
"use client";

import { useTransition } from "react";
import { voteOnDefinition, voteOnExample } from "@/app/actions/vote";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function VoteButtons({
  score,
  type,
  id,
  userVote,
}: {
  score: number;
  type: "definition" | "example";
  id: number;
  userVote: number | null; // 1 for upvote, -1 for downvote, null for no vote
}) {
  const [isPending, startTransition] = useTransition();

  const handleVote = (value: number) => {
    startTransition(async () => {
      try {
        let result;
        if (type === "definition") {
          result = await voteOnDefinition(id, value);
        } else {
          result = await voteOnExample(id, value);
        }

        if (result?.error) {
          alert(result.error);
        }
      } catch (error) {
        console.error("Vote error:", error);
        alert("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isPending}
        onClick={() => handleVote(1)}
        className={`
          disabled:opacity-50 p-1 rounded transition-colors
          ${userVote === 1 
            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
            : 'hover:bg-gray-100'
          }
        `}
        title={userVote === 1 ? "Remove upvote" : "Upvote"}
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <span className="text-sm font-medium min-w-[1.5rem] text-center">{score}</span>
      <button
        disabled={isPending}
        onClick={() => handleVote(-1)}
        className={`
          disabled:opacity-50 p-1 rounded transition-colors
          ${userVote === -1 
            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
            : 'hover:bg-gray-100'
          }
        `}
        title={userVote === -1 ? "Remove downvote" : "Downvote"}
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}