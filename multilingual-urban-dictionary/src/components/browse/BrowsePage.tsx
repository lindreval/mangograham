import { prisma } from "@/lib/prisma";
import LanguageSidebar from "@/components/LanguageSidebar";
import InfiniteScrollPhrases from "@/components/InfiniteScrollPhrases";
import type { PhraseWithLang } from "@/components/PhraseCard";
import type { Language } from "@prisma/client";

export const revalidate = 60; // ISR – re-render at most once per minute

export default async function BrowsePage() {
  let phrases: PhraseWithLang[] = [];
  let languages: Language[] = [];

  try {
    // Fetch newest 20 phrases with optimized query - only load what's needed for cards
    const rawPhrases = await prisma.phrase.findMany({
      where: {
        status: {
          in: ["approved", "pending"],
        },
        definitions: {
          some: {
            status: {
              in: ["approved", "pending"],
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        language: {
          select: { id: true, name: true, isoCode: true },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        definitions: {
          where: {
            status: {
              in: ["approved", "pending"],
            },
          },
          take: 3, // Only load top 3 definitions per phrase for card display
          include: {
            _count: {
              select: { votes: true }
            },
            author: {
              select: { name: true, email: true, username: true },
            },
            examples: {
              where: {
                status: {
                  in: ["approved", "pending"],
                },
              },
              take: 1, // Only need 1 example for card display
              select: {
                id: true,
                text: true,
                translation: true,
                createdAt: true,
                updatedAt: true,
                status: true,
                authorId: true,
                definitionId: true,
              },
            },
          },
        },
      },
    });

    // Calculate vote scores efficiently using a single aggregation query
    const definitionIds = rawPhrases.flatMap(p => p.definitions.map(d => d.id));
    const exampleIds = rawPhrases.flatMap(p => p.definitions.flatMap(d => d.examples.map(e => e.id)));

    // Get vote scores for all definitions and examples in bulk
    const [defVoteScores, exVoteScores] = await Promise.all([
      definitionIds.length > 0
        ? prisma.$queryRaw<{ definitionId: number; score: bigint }[]>`
            SELECT "definitionId", COALESCE(SUM(value), 0) as score
            FROM "DefinitionVote"
            WHERE "definitionId" = ANY(${definitionIds}::int[])
            GROUP BY "definitionId"
          `
        : Promise.resolve([]),
      exampleIds.length > 0
        ? prisma.$queryRaw<{ exampleId: number; score: bigint }[]>`
            SELECT "exampleId", COALESCE(SUM(value), 0) as score
            FROM "ExampleVote"
            WHERE "exampleId" = ANY(${exampleIds}::int[])
            GROUP BY "exampleId"
          `
        : Promise.resolve([]),
    ]);

    // Create lookup maps for O(1) access
    const defScoreMap = new Map(defVoteScores.map(v => [v.definitionId, Number(v.score)]));
    const exScoreMap = new Map(exVoteScores.map(v => [v.exampleId, Number(v.score)]));

    // Transform data with pre-calculated scores
    phrases = rawPhrases.map(phrase => ({
      ...phrase,
      definitions: phrase.definitions
        .map(def => ({
          ...def,
          voteScore: defScoreMap.get(def.id) ?? 0,
          votes: [], // Empty array - score is pre-calculated
          examples: def.examples.map(ex => ({
            ...ex,
            voteScore: exScoreMap.get(ex.id) ?? 0,
            votes: [], // Empty array - score is pre-calculated
          })),
        }))
        .sort((a, b) => b.voteScore - a.voteScore), // Sort by score
    })) as PhraseWithLang[];

    languages = await prisma.language.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.warn("Database not available during build:", error);
  }

  return (
    <main className="mx-auto max-w-6xl p-4">
      <div className="md:flex md:gap-6">
        <LanguageSidebar languages={languages} />
        <InfiniteScrollPhrases initialPhrases={phrases} />
      </div>
    </main>
  );
}
