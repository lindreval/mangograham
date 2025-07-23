"use client";

import Link from "next/link";
import type { Phrase, Language, Definition, DefinitionVote, Example, ExampleVote, Tag, PhraseTag } from "@prisma/client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Augmented type that includes nested language and top definition
export interface PhraseWithLang extends Phrase {
  language: Pick<Language, "id" | "name" | "isoCode">;
  tags?: (PhraseTag & { tag: Tag })[];
  definitions?: (Definition & {
    votes: DefinitionVote[];
    author: { name: string | null; email: string | null; };
    examples: (Example & { votes: ExampleVote[] })[];
  })[];
}

export default function PhraseCard({ phrase }: { phrase: PhraseWithLang }) {
  const [showNSFW, setShowNSFW] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  
  // Check if phrase has NSFW tag
  const isNSFW = phrase.tags?.some(pt => pt.tag.name.toLowerCase() === 'nsfw') || false;
  
  const handleShowNSFW = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      // Redirect to sign in if not authenticated
      router.push('/api/auth/signin');
      return;
    }
    
    setShowNSFW(true);
  };
  
  // Calculate vote scores and find top definition
  const topDefinition = phrase.definitions && phrase.definitions.length > 0
    ? phrase.definitions
        .map(def => ({
          ...def,
          score: def.votes.reduce((sum, v) => sum + v.value, 0)
        }))
        .sort((a, b) => b.score - a.score)[0]
    : null;

  // Find top example for the top definition
  const topExample = topDefinition?.examples && topDefinition.examples.length > 0
    ? topDefinition.examples
        .map(ex => ({
          ...ex,
          score: ex.votes.reduce((sum, v) => sum + v.value, 0)
        }))
        .sort((a, b) => b.score - a.score)[0]
    : null;

  return (
    <Link href={`/${phrase.language.isoCode}/${phrase.slug}`}>
      <article className={`rounded-lg border-4 bg-card text-card-foreground p-4 shadow-elevation-medium hover:bg-accent hover:shadow-elevation-high transition-shadow cursor-pointer relative ${isNSFW && !showNSFW ? 'overflow-hidden' : ''}`}>
        <header className="mb-3 flex items-center justify-between">
          <span className="text-base text-muted-foreground">
            {phrase.language.name}
          </span>
          <time
            dateTime={phrase.createdAt.toISOString()}
            className="text-s text-muted-foreground"
          >
            {phrase.createdAt.toLocaleDateString()}
          </time>
        </header>

        <h2 className={`text-xl font-semibold hover:underline mb-2 text-foreground ${isNSFW && !showNSFW ? 'blur-sm select-none' : ''}`}>
          {phrase.textOriginal}
          {phrase.transliteration && (
            <span className="ml-2 text-base text-muted-foreground font-normal">
              ({phrase.transliteration})
            </span>
          )}
        </h2>

        {topDefinition && (
          <div className={`space-y-2 ${isNSFW && !showNSFW ? 'blur-sm select-none' : ''}`}>
            <p className="text-base text-card-foreground/80">
              {topDefinition.body.length > 100
                ? `${topDefinition.body.substring(0, 100)}...`
                : topDefinition.body}
            </p>

            {topExample && (
              <div className="border-l-2 border-card-foreground/20 pl-3 space-y-1 bg-card/50 rounded-r p-2">
                <p className="text-base italic text-card-foreground/70">
                  &ldquo;{topExample.text.length > 80
                    ? `${topExample.text.substring(0, 80)}...`
                    : topExample.text}&rdquo;
                </p>
                {topExample.translation && (
                  <p className="text-s text-card-foreground/60">
                    {topExample.translation.length > 80
                      ? `${topExample.translation.substring(0, 80)}...`
                      : topExample.translation}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-card-foreground/70">
              <span>
                By {topDefinition.author.name || topDefinition.author.email || 'Anonymous'}
              </span>
              <span className="flex items-center gap-1">
                <span className={topDefinition.score >= 0 ? "text-primary" : "text-destructive"}>
                  {topDefinition.score > 0 ? '+' : ''}{topDefinition.score}
                </span>
                votes
              </span>
            </div>
          </div>
        )}
        
        {/* NSFW Overlay */}
        {isNSFW && !showNSFW && (
          <div className="absolute inset-0 bg-background/30 flex items-center justify-center rounded-lg">
            <div className="bg-card/90 border border-muted-foreground/20 rounded-lg p-4 text-center shadow-lg backdrop-blur-sm">
              <p className="text-md font-medium text-foreground mb-1">🔞 Mature Content</p>
              <p className="text-xs text-muted-foreground mb-3">You must be 18+ to view.</p>
              <button
                onClick={handleShowNSFW}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded text-sm transition-colors font-medium"
              >
                {session?.user ? 'Show' : 'Sign in to view'}
              </button>
            </div>
          </div>
        )}
      </article>
    </Link>
  );
}