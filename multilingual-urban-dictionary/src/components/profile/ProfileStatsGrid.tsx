"use client";

import {
  MessageSquareText,
  FileText,
  BookOpen,
  ThumbsUp,
  Sparkles,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

interface ProfileStatsGridProps {
  phraseCount: number;
  definitionCount: number;
  exampleCount: number;
  totalUpvotes: number;
  totalContributions: number;
}

export function ProfileStatsGrid({
  phraseCount,
  definitionCount,
  exampleCount,
  totalUpvotes,
  totalContributions,
}: ProfileStatsGridProps) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 animate-page-enter"
      style={{ animationDelay: "0.2s" }}
    >
      <StatCard
        icon={MessageSquareText}
        value={phraseCount}
        label="Phrases"
        delay="0.1s"
        animateCount
      />
      <StatCard
        icon={FileText}
        value={definitionCount}
        label="Definitions"
        delay="0.15s"
        animateCount
      />
      <StatCard
        icon={BookOpen}
        value={exampleCount}
        label="Examples"
        delay="0.2s"
        animateCount
      />
      <StatCard
        icon={ThumbsUp}
        value={totalUpvotes}
        label="Upvotes"
        delay="0.25s"
        animateCount
      />
      <StatCard
        icon={Sparkles}
        value={totalContributions}
        label="Total"
        delay="0.3s"
        animateCount
        className="col-span-2 sm:col-span-1"
      />
    </div>
  );
}
