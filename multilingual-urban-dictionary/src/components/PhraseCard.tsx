import Link from "next/link";
import type { Phrase, Language, Definition, DefinitionVote } from "@prisma/client";

// Augmented type that includes nested language and top definition
export interface PhraseWithLang extends Phrase {
  language: Pick<Language, "id" | "name" | "isoCode">;
  definitions?: (Definition & { 
    votes: DefinitionVote[]; 
    author: { name: string | null; email: string | null; };
  })[];
}

export default function PhraseCard({ phrase }: { phrase: PhraseWithLang }) {
  // Calculate vote scores and find top definition
  const topDefinition = phrase.definitions && phrase.definitions.length > 0 
    ? phrase.definitions
        .map(def => ({
          ...def,
          score: def.votes.reduce((sum, v) => sum + v.value, 0)
        }))
        .sort((a, b) => b.score - a.score)[0]
    : null;

  return (
    <article className="rounded-lg border p-4 shadow-sm">
      <header className="mb-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {phrase.language.name}
        </span>
        <time
          dateTime={phrase.createdAt.toISOString()}
          className="text-xs text-muted-foreground"
        >
          {phrase.createdAt.toLocaleDateString()}
        </time>
      </header>

      <Link
        href={`/${phrase.language.isoCode}/${phrase.slug}`}
        className="text-lg font-semibold hover:underline block mb-2"
      >
        {phrase.textOriginal}
      </Link>

      {topDefinition && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {topDefinition.body.length > 100 
              ? `${topDefinition.body.substring(0, 100)}...` 
              : topDefinition.body}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              By {topDefinition.author.name || topDefinition.author.email || 'Anonymous'}
            </span>
            <span className="flex items-center gap-1">
              <span className={topDefinition.score >= 0 ? "text-green-600" : "text-red-600"}>
                {topDefinition.score > 0 ? '+' : ''}{topDefinition.score}
              </span>
              votes
            </span>
          </div>
        </div>
      )}
    </article>
  );
}
