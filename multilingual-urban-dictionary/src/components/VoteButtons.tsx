// components/VoteButtons.tsx
"use client";

import { useTransition, useOptimistic, useRef } from "react";
import { voteOnDefinition, voteOnExample } from "@/app/actions/vote";
import { ChevronUp, ChevronDown } from "lucide-react";
import { triggerAchievementPolling } from "@/hooks/useAchievementPolling";
import { toast } from "@/hooks/use-toast";

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

  // Store previous state for rollback on error
  const previousStateRef = useRef({ score, userVote });

  const handleVote = (value: number) => {
    // Determine the new vote state
    const newVote = optimisticVote.userVote === value ? null : value;

    // Store current state before optimistic update for potential rollback
    previousStateRef.current = { score: optimisticVote.score, userVote: optimisticVote.userVote };

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
          // Revert to previous state on error
          setOptimisticVote(previousStateRef.current.userVote);
          toast({
            title: "Vote failed",
            description: result.error,
            variant: "destructive",
          });
        } else {
          // Trigger smart achievement polling after successful vote
          triggerAchievementPolling();
        }
      } catch (error) {
        console.error("Vote error:", error);
        // Revert to previous state on error
        setOptimisticVote(previousStateRef.current.userVote);
        toast({
          title: "Vote failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isPending}
        onClick={() => handleVote(1)}
        aria-label={optimisticVote.userVote === 1 ? `Remove upvote from ${type}` : `Upvote ${type}`}
        aria-pressed={optimisticVote.userVote === 1}
        className={`
          disabled:opacity-50 p-1 rounded transition-all duration-200 hover:scale-110 active:scale-95
          ${optimisticVote.userVote === 1
            ? 'bg-primary/15 text-primary'
            : 'hover:bg-primary/10 hover:text-primary'
          }
        `}
        title={optimisticVote.userVote === 1 ? "Remove upvote" : "Upvote"}
      >
        <ChevronUp className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="text-sm font-medium min-w-[1.5rem] text-center" aria-live="polite" aria-atomic="true">
        {optimisticVote.score}
      </span>
      <button
        disabled={isPending}
        onClick={() => handleVote(-1)}
        aria-label={optimisticVote.userVote === -1 ? `Remove downvote from ${type}` : `Downvote ${type}`}
        aria-pressed={optimisticVote.userVote === -1}
        className={`
          disabled:opacity-50 p-1 rounded transition-all duration-200 hover:scale-110 active:scale-95
          ${optimisticVote.userVote === -1
            ? 'bg-destructive/15 text-destructive'
            : 'hover:bg-destructive/10 hover:text-destructive'
          }
        `}
        title={optimisticVote.userVote === -1 ? "Remove downvote" : "Downvote"}
      >
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}