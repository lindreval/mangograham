import Link from "next/link";
import type { Phrase, Language } from "@prisma/client";

// Augmented type that includes nested language
export interface PhraseWithLang extends Phrase {
  language: Pick<Language, "name" | "isoCode">;
}

export default function PhraseCard({ phrase }: { phrase: PhraseWithLang }) {
  return (
    <article className="rounded-lg border p-4 shadow-sm">
      <header className="mb-1 flex items-center justify-between">
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
        className="text-lg font-semibold hover:underline"
      >
        {phrase.textOriginal}
      </Link>
    </article>
  );
}
