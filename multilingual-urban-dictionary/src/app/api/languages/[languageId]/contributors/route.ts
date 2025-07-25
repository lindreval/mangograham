import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ languageId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { languageId } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all-time";

    // Calculate date threshold based on period
    let dateThreshold: Date | null = null;
    const now = new Date();
    
    if (period === "weekly") {
      dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "monthly") {
      dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build where clause for date filtering
    const dateFilter = dateThreshold ? { gte: dateThreshold } : {};

    // Convert languageId to number
    const languageIdNum = parseInt(languageId);
    if (isNaN(languageIdNum)) {
      return NextResponse.json(
        { error: "Invalid language ID" },
        { status: 400 }
      );
    }

    // Query contributors with their contribution counts
    const contributors = await prisma.user.findMany({
      where: {
        OR: [
          {
            phrases: {
              some: {
                languageId: languageIdNum,
                ...(dateThreshold && { createdAt: dateFilter }),
              },
            },
          },
          {
            definitions: {
              some: {
                phrase: {
                  languageId: languageIdNum,
                },
                ...(dateThreshold && { createdAt: dateFilter }),
              },
            },
          },
          {
            examples: {
              some: {
                definition: {
                  phrase: {
                    languageId: languageIdNum,
                  },
                },
                ...(dateThreshold && { createdAt: dateFilter }),
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        phrases: {
          where: {
            languageId: languageIdNum,
            ...(dateThreshold && { createdAt: dateFilter }),
          },
          select: { id: true },
        },
        definitions: {
          where: {
            phrase: {
              languageId: languageIdNum,
            },
            ...(dateThreshold && { createdAt: dateFilter }),
          },
          select: { id: true },
        },
        examples: {
          where: {
            definition: {
              phrase: {
                languageId: languageIdNum,
              },
            },
            ...(dateThreshold && { createdAt: dateFilter }),
          },
          select: { id: true },
        },
      },
    });

    // Transform data and calculate totals
    const contributorStats = contributors
      .map((user) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        phraseCount: user.phrases.length,
        definitionCount: user.definitions.length,
        exampleCount: user.examples.length,
        totalContributions: user.phrases.length + user.definitions.length + user.examples.length,
      }))
      .filter((contributor) => contributor.totalContributions > 0)
      .sort((a, b) => b.totalContributions - a.totalContributions)
      .slice(0, 10); // Top 10 contributors

    return NextResponse.json(contributorStats);
  } catch (error) {
    console.error("Error fetching contributors:", error);
    return NextResponse.json(
      { error: "Failed to fetch contributors" },
      { status: 500 }
    );
  }
}