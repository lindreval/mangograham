import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { contributionsQuerySchema } from "@/lib/validations";

// TODO: Add rate limiting (Upstash Redis)

export async function GET(request: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate query parameters with Zod
  const parseResult = contributionsQuerySchema.safeParse({
    page: request.nextUrl.searchParams.get("page"),
    limit: request.nextUrl.searchParams.get("limit"),
    type: request.nextUrl.searchParams.get("type"),
    sortBy: request.nextUrl.searchParams.get("sortBy"),
    userId: request.nextUrl.searchParams.get("userId"),
  });

  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.errors.map(e => e.message).join(", ") },
      { status: 400 }
    );
  }

  const { page, limit, type, sortBy, userId: requestedUserId } = parseResult.data;
  // Note: Contributions are public (visible on user profiles), so allowing userId parameter is intentional
  const userId = requestedUserId || session.user.id;
  const skip = (page - 1) * limit;

  try {
    let orderBy: { createdAt: "desc" | "asc" } = { createdAt: "desc" };
    
    // Determine sort order
    if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" };
    }
    // Note: upvotes sorting will be handled differently for each type

    // Get total counts for all types (for stats)
    const [totalPhrases, totalDefinitions, totalExamples] = await Promise.all([
      prisma.phrase.count({ where: { authorId: userId } }),
      prisma.definition.count({ where: { authorId: userId } }),
      prisma.example.count({ where: { authorId: userId } })
    ]);

    if (type === "phrases") {
      const phrases = await prisma.phrase.findMany({
        where: { authorId: userId },
        include: {
          language: true,
          definitions: {
            include: {
              votes: true
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      });

      // If sorting by upvotes, sort after fetching
      if (sortBy === "upvotes") {
        phrases.sort((a, b) => {
          const aVotes = a.definitions.reduce((total, def) => 
            total + def.votes.reduce((sum, vote) => sum + vote.value, 0), 0
          );
          const bVotes = b.definitions.reduce((total, def) => 
            total + def.votes.reduce((sum, vote) => sum + vote.value, 0), 0
          );
          return bVotes - aVotes;
        });
      }

      return NextResponse.json({ 
        data: phrases, 
        hasMore: phrases.length === limit,
        type: "phrases",
        totalCounts: {
          phrases: totalPhrases,
          definitions: totalDefinitions,
          examples: totalExamples
        }
      });
    }
    
    if (type === "definitions") {
      const definitions = await prisma.definition.findMany({
        where: { authorId: userId },
        include: {
          phrase: {
            include: {
              language: true
            }
          },
          votes: true,
          examples: true
        },
        orderBy,
        skip,
        take: limit,
      });

      // If sorting by upvotes, sort after fetching
      if (sortBy === "upvotes") {
        definitions.sort((a, b) => {
          const aVotes = a.votes.reduce((sum, vote) => sum + vote.value, 0);
          const bVotes = b.votes.reduce((sum, vote) => sum + vote.value, 0);
          return bVotes - aVotes;
        });
      }

      return NextResponse.json({ 
        data: definitions, 
        hasMore: definitions.length === limit,
        type: "definitions",
        totalCounts: {
          phrases: totalPhrases,
          definitions: totalDefinitions,
          examples: totalExamples
        }
      });
    }
    
    if (type === "examples") {
      const examples = await prisma.example.findMany({
        where: { authorId: userId },
        include: {
          definition: {
            include: {
              phrase: {
                include: {
                  language: true
                }
              }
            }
          },
          votes: true
        },
        orderBy,
        skip,
        take: limit,
      });

      // If sorting by upvotes, sort after fetching
      if (sortBy === "upvotes") {
        examples.sort((a, b) => {
          const aVotes = a.votes.reduce((sum, vote) => sum + vote.value, 0);
          const bVotes = b.votes.reduce((sum, vote) => sum + vote.value, 0);
          return bVotes - aVotes;
        });
      }

      return NextResponse.json({ 
        data: examples, 
        hasMore: examples.length === limit,
        type: "examples",
        totalCounts: {
          phrases: totalPhrases,
          definitions: totalDefinitions,
          examples: totalExamples
        }
      });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return NextResponse.json({ error: "Failed to fetch contributions" }, { status: 500 });
  }
}