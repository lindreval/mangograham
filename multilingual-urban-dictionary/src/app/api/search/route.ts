import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { searchQuerySchema } from "@/lib/validations";

// TODO: Add rate limiting (Upstash Redis)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Validate query parameters
  const parseResult = searchQuerySchema.safeParse({
    q: searchParams.get("q"),
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
  });

  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.errors.map(e => e.message).join(", ") },
      { status: 400 }
    );
  }

  const { q: query, page, limit } = parseResult.data;
  const skip = (page - 1) * limit;

  try {
    // Optimized query - don't load all votes, calculate scores separately
    const rawPhrases = await prisma.phrase.findMany({
      where: {
        status: "approved",
        OR: [
          { normalized: { contains: query.toLowerCase() } },
          { transliteration: { contains: query.toLowerCase() } }
        ]
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
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
          where: { status: "approved" },
          take: 3, // Only load top 3 definitions per phrase for display
          include: {
            author: {
              select: { name: true, email: true },
            },
            examples: {
              where: { status: "approved" },
              take: 1, // Only need 1 example for display
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

    // Calculate vote scores efficiently using bulk aggregation
    const definitionIds = rawPhrases.flatMap(p => p.definitions.map(d => d.id));
    const exampleIds = rawPhrases.flatMap(p => p.definitions.flatMap(d => d.examples.map(e => e.id)));

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

    // Create lookup maps
    const defScoreMap = new Map(defVoteScores.map(v => [v.definitionId, Number(v.score)]));
    const exScoreMap = new Map(exVoteScores.map(v => [v.exampleId, Number(v.score)]));

    // Transform data with pre-calculated scores
    const phrases = rawPhrases.map(phrase => ({
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
        .sort((a, b) => b.voteScore - a.voteScore),
    }));

    const response = NextResponse.json({ phrases, hasMore: phrases.length === limit });
    // Cache search results for 60 seconds, allow stale content for 120 seconds while revalidating
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error("Error searching phrases:", error);
    return NextResponse.json({ error: "Failed to search phrases" }, { status: 500 });
  }
}