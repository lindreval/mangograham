import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  try {
    const phrases = await prisma.phrase.findMany({
      where: {
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
          select: {
            id: true,
            name: true,
            isoCode: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        definitions: {
          where: { status: { in: ["approved", "pending"] } },
          include: {
            votes: true,
            author: {
              select: {
                name: true,
                email: true,
              },
            },
            examples: {
              where: { status: { in: ["approved", "pending"] } },
              include: {
                votes: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ phrases, hasMore: phrases.length === limit });
  } catch (error) {
    console.error("Error searching phrases:", error);
    return NextResponse.json({ error: "Failed to search phrases" }, { status: 500 });
  }
}