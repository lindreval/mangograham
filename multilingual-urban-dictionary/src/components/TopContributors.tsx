"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

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

  return (
    <div className="rounded-lg border-4 bg-card text-card-foreground shadow-elevation-medium">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left font-semibold hover:bg-card/80 transition-colors border-b border-border"
      >
        <h2 className="text-lg font-semibold">Top Contributors</h2>
        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ease-in-out ${
          isExpanded ? 'rotate-180' : 'rotate-0'
        }`} />
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-4 border-b border-border">
          {/* Time period selector */}
          <div className="flex gap-2 bg-muted p-1 rounded-md text-sm">
            {(["weekly", "monthly", "all-time"] as const).map((timePeriod) => (
              <button
                key={timePeriod}
                onClick={() => setPeriod(timePeriod)}
                className={`flex-1 py-1 rounded transition-colors ${
                  period === timePeriod
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {timePeriod === "all-time" ? "All Time" : timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : contributors.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No contributors found for this period.
          </p>
        ) : (
          <div className="space-y-3">
            {contributors.map((contributor, index) => (
              <div key={contributor.id} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <Link
                      href={`/user/${contributor.username}`}
                      className="font-medium truncate hover:text-primary transition-colors"
                    >
                      {contributor.username || contributor.name || "Anonymous"}
                    </Link>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="inline-block">
                      {contributor.phraseCount} phrases/
                    </span>
                    <span className="inline-block">
                      {contributor.definitionCount} definitions/
                    </span>
                    <span className="inline-block">
                      {contributor.exampleCount} examples
                    </span>
                  </div>
                </div>
                
                <div className="text-sm font-medium text-primary">
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