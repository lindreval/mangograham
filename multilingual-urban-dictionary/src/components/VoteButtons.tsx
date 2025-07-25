// components/VoteButtons.tsx
"use client";

import { useTransition, useOptimistic } from "react";
import { voteOnDefinition, voteOnExample } from "@/app/actions/vote";
import { ChevronUp, ChevronDown } from "lucide-react";
import { triggerAchievementPolling } from "@/hooks/useAchievementPolling";

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
  
  // Optimistic state for instant UI updates
  const [optimisticVote, setOptimisticVote] = useOptimistic(
    { score, userVote },
    (state, newVote: number | null) => {
      // Calculate score change
      let scoreChange = 0;
      if (state.userVote === null && newVote !== null) {
        // No previous vote -> new vote
        scoreChange = newVote;
      } else if (state.userVote !== null && newVote === null) {
        // Had vote -> removed vote
        scoreChange = -state.userVote;
      } else if (state.userVote !== null && newVote !== null && state.userVote !== newVote) {
        // Changed vote (e.g., upvote -> downvote)
        scoreChange = newVote - state.userVote;
      }
      
      return {
        score: state.score + scoreChange,
        userVote: newVote
      };
    }
  );

  const handleVote = (value: number) => {
    // Determine the new vote state
    const newVote = optimisticVote.userVote === value ? null : value;
    
    // Perform optimistic update and server action within transition
    startTransition(async () => {
      // Immediately update UI optimistically
      setOptimisticVote(newVote);
      
      try {
        let result;
        if (type === "definition") {
          result = await voteOnDefinition(id, value);
        } else {
          result = await voteOnExample(id, value);
        }

        if (result?.error) {
          alert(result.error);
          // TODO: Revert optimistic update on error
        } else {
          // Trigger smart achievement polling after successful vote
          triggerAchievementPolling();
        }
      } catch (error) {
        console.error("Vote error:", error);
        alert("An unexpected error occurred. Please try again.");
        // TODO: Revert optimistic update on error
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
          ${optimisticVote.userVote === 1 
            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
            : 'hover:bg-gray-100'
          }
        `}
        title={optimisticVote.userVote === 1 ? "Remove upvote" : "Upvote"}
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <span className="text-sm font-medium min-w-[1.5rem] text-center">{optimisticVote.score}</span>
      <button
        disabled={isPending}
        onClick={() => handleVote(-1)}
        className={`
          disabled:opacity-50 p-1 rounded transition-colors
          ${optimisticVote.userVote === -1 
            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
            : 'hover:bg-gray-100'
          }
        `}
        title={optimisticVote.userVote === -1 ? "Remove downvote" : "Downvote"}
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}