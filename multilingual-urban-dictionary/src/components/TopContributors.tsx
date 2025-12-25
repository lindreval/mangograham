"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Trophy, Users } from "lucide-react";

type TimePeriod = "weekly" | "monthly" | "all-time";

interface Contributor {
  id: string;
  name: string | null;
  username: string | null;
  phraseCount: number;
  definitionCount: number;
  exampleCount: number;
  totalContributions: number;
}

interface TopContributorsProps {
  languageId: number;
}

export default function TopContributors({ languageId }: TopContributorsProps) {
  const [period, setPeriod] = useState<TimePeriod>("all-time");
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchContributors = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/languages/${languageId}/contributors?period=${period}`
        );
        if (response.ok) {
          const data = await response.json();
          setContributors(data);
        }
      } catch (error) {
        console.error("Failed to fetch contributors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContributors();
  }, [languageId, period]);

  const getRankBadge = (index: number) => {
    if (index === 0)
      return (
        <span className="text-amber-500">
          <Trophy className="w-4 h-4" />
        </span>
      );
    if (index === 1)
      return <span className="text-slate-400 text-sm font-bold">2</span>;
    if (index === 2)
      return <span className="text-amber-700 text-sm font-bold">3</span>;
    return <span className="text-muted-foreground text-sm">{index + 1}</span>;
  };

  return (
    <div
      className={`rounded-xl border-2 border-primary/20 bg-card text-card-foreground shadow-card overflow-hidden transition-all duration-500 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: "0.3s" }}
    >
      {/* Gradient accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Top Contributors
          </h2>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ease-[var(--ease-smooth)] ${
            isExpanded ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-[var(--ease-smooth)] ${
          isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {/* Time period selector */}
        <div className="px-4 pb-4">
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg text-sm">
            {(["weekly", "monthly", "all-time"] as const).map((timePeriod) => (
              <button
                key={timePeriod}
                onClick={() => setPeriod(timePeriod)}
                className={`flex-1 py-2 px-3 rounded-md font-medium transition-all duration-[var(--duration-hover)] ease-[var(--ease-smooth)] ${
                  period === timePeriod
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                }`}
              >
                {timePeriod === "all-time"
                  ? "All Time"
                  : timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mx-4" />

        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="w-8 h-8 bg-muted rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-24 mb-1.5" />
                      <div className="h-3 bg-muted rounded w-32" />
                    </div>
                    <div className="w-8 h-6 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : contributors.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/5 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary/30" />
              </div>
              <p className="text-muted-foreground text-sm">
                No contributors found for this period.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {contributors.map((contributor, index) => (
                <div
                  key={contributor.id}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-[var(--duration-hover)] hover:bg-primary/5 ${
                    index === 0 ? "bg-primary/5" : ""
                  }`}
                  style={{
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--off-white)] border border-primary/10">
                    {getRankBadge(index)}
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/user/${contributor.username}`}
                      className="font-medium text-foreground hover:text-primary transition-colors truncate block"
                    >
                      {contributor.username || contributor.name || "Anonymous"}
                    </Link>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{contributor.phraseCount}p</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span>{contributor.definitionCount}d</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span>{contributor.exampleCount}e</span>
                    </div>
                  </div>

                  {/* Total count badge */}
                  <div className="flex items-center justify-center min-w-[2.5rem] h-7 px-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {contributor.totalContributions}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
