"use client";

import type {
  Phrase,
  Language,
  Definition,
  DefinitionVote,
  Example,
  ExampleVote,
  Tag,
  PhraseTag,
} from "@prisma/client";
import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Augmented type that includes nested language and top definition
export interface PhraseWithLang extends Phrase {
  language: Pick<Language, "id" | "name" | "isoCode">;
  tags?: (PhraseTag & { tag: Tag })[];
  definitions?: (Definition & {
    votes: DefinitionVote[];
    voteScore?: number;
    author: { name: string | null; email: string | null; username: string | null };
    examples: (Example & { votes: ExampleVote[]; voteScore?: number })[];
  })[];
}

export default function PhraseCard({ phrase }: { phrase: PhraseWithLang }) {
  const [showNSFW, setShowNSFW] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const isNSFW =
    phrase.tags?.some((pt) => pt.tag.name.toLowerCase() === "nsfw") || false;

  const handleShowNSFW = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session?.user) {
      router.push("/api/auth/signin");
      return;
    }
    setShowNSFW(true);
  };

  const topDefinition = useMemo(() => {
    if (!phrase.definitions || phrase.definitions.length === 0) return null;
    return phrase.definitions
      .map((def) => ({
        ...def,
        score: def.voteScore ?? def.votes.reduce((sum, v) => sum + v.value, 0),
      }))
      .sort((a, b) => b.score - a.score)[0];
  }, [phrase.definitions]);

  const topExample = useMemo(() => {
    if (!topDefinition?.examples || topDefinition.examples.length === 0)
      return null;
    return topDefinition.examples
      .map((ex) => ({
        ...ex,
        score: ex.voteScore ?? ex.votes.reduce((sum, v) => sum + v.value, 0),
      }))
      .sort((a, b) => b.score - a.score)[0];
  }, [topDefinition]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on an interactive element (like author link)
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }

    if (isNSFW && !showNSFW && !session?.user) {
      router.push("/api/auth/signin");
      return;
    }

    router.push(`/${phrase.language.isoCode}/${phrase.slug}`);
  };

  return (
    <div onClick={handleCardClick}>
      <article
        className={`
          rounded-[20px] border-4 border-primary bg-card text-card-foreground p-5
          shadow-card hover:shadow-card-hover hover:-translate-y-1.5 hover:border-primary/80
          transition-all duration-[250ms] ease-[cubic-bezier(0.34,0,0.12,1)]
          cursor-pointer relative overflow-hidden
          ${isNSFW && !showNSFW ? "" : ""}
        `}
      >
        {/* Header with Language Badge */}
        <header className="mb-4 flex items-center justify-between relative z-10">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold bg-primary text-primary-foreground tracking-[0.15em] uppercase shadow-sm">
            {phrase.language.name}
          </span>
          <time
            dateTime={phrase.createdAt.toISOString()}
            className="text-[11px] text-muted-foreground/60 font-mono tabular-nums"
          >
            {phrase.createdAt.toLocaleDateString()}
          </time>
        </header>

        {/* Hero Title */}
        <h2
          className={`
            text-3xl md:text-4xl font-black text-foreground mb-2
            tracking-tighter leading-[1.1]
            drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]
            relative z-10
            ${isNSFW && !showNSFW ? "blur-sm select-none" : ""}
          `}
        >
          {phrase.textOriginal}
          {phrase.transliteration && (
            <span className="block mt-1.5 text-base md:text-lg text-muted-foreground/70 font-medium italic tracking-wide">
              /{phrase.transliteration}/
            </span>
          )}
        </h2>

        {topDefinition && (
          <div
            className={`space-y-3 relative z-10 ${
              isNSFW && !showNSFW ? "blur-sm select-none" : ""
            }`}
          >
            {/* Definition Text */}
            <p className="text-[15px] md:text-base text-card-foreground/85 leading-[1.7] line-clamp-3 whitespace-pre-wrap">
              {topDefinition.body.length > 140
                ? `${topDefinition.body.substring(0, 140)}...`
                : topDefinition.body}
            </p>

            {/* Example Quote with Decorative Quotation Marks */}
            {topExample && (
              <div className="relative mt-4 pl-6">
                {/* Large decorative opening quote */}
                <span
                  className="absolute -left-1 -top-2 text-5xl text-primary/20 font-serif leading-none select-none"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>

                <div className="border-l-2 border-primary/30 pl-4 py-1">
                  <p className="text-sm italic text-card-foreground/70 leading-relaxed whitespace-pre-wrap">
                    {topExample.text.length > 90
                      ? `${topExample.text.substring(0, 90)}...`
                      : topExample.text}
                  </p>
                  {topExample.translation && (
                    <p className="text-xs text-card-foreground/50 mt-1.5 not-italic whitespace-pre-wrap">
                      {topExample.translation.length > 80
                        ? `${topExample.translation.substring(0, 80)}...`
                        : topExample.translation}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Footer with Author & Votes */}
            <div className="mt-4 pt-3 relative flex items-center justify-between">
              {/* Gradient separator line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

              <span className="text-xs text-muted-foreground/60">
                <span className="text-muted-foreground/40 mr-1">by</span>
                {topDefinition.author.username ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/user/${topDefinition.author.username}`);
                    }}
                    className="font-medium text-primary/80 hover:text-primary hover:underline transition-colors relative z-20"
                  >
                    {topDefinition.author.name ||
                      topDefinition.author.email ||
                      "Anonymous"}
                  </button>
                ) : (
                  <span className="font-medium text-muted-foreground/80">
                    {topDefinition.author.name ||
                      topDefinition.author.email ||
                      "Anonymous"}
                  </span>
                )}
              </span>

              {/* Vote count badge with arrow indicator */}
              <span
                className={`
                  inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                  ${
                    topDefinition.score >= 0
                      ? "bg-primary/15 text-primary"
                      : "bg-destructive/15 text-destructive"
                  }
                `}
              >
                <span className="text-[10px]">
                  {topDefinition.score >= 0 ? "▲" : "▼"}
                </span>
                {Math.abs(topDefinition.score)}
              </span>
            </div>
          </div>
        )}

        {/* NSFW Overlay */}
        {isNSFW && !showNSFW && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-lg flex items-center justify-center rounded-[20px] z-20">
            <div className="bg-card rounded-2xl p-6 text-center shadow-lg border-4 border-primary/50 max-w-[200px]">
              <div className="text-3xl mb-2">🔞</div>
              <p className="text-sm font-bold text-foreground mb-1">
                Mature Content
              </p>
              <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
                You must be 18+ to view this content
              </p>
              <button
                onClick={handleShowNSFW}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105"
              >
                {session?.user ? "Reveal" : "Sign In"}
              </button>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
