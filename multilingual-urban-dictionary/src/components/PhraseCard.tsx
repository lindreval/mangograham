import Link from "next/link";
import slugify from "@/lib/slugify";
import type { Phrase, Language } from "@prisma/client";

export type PhraseWithLang = Phrase & { language: Language };

export default function PhraseCard({ phrase }: { phrase: PhraseWithLang }) {
  return (
    <article className="rounded-lg border p-4 shadow-sm">
      <header className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{phrase.language.name}</span>
        <time dateTime={phrase.createdAt.toISOString()}>
          {phrase.createdAt.toLocaleDateString()}
        </time>
      </header>

      <Link
        href={`/${phrase.language.isoCode}/${slugify(phrase.textOriginal)}-${phrase.id}`}
        className="text-lg font-semibold hover:underline"
      >
        {phrase.textOriginal}
      </Link>
    </article>
  );
}
