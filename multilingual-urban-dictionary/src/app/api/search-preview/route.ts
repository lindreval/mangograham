import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const results = await prisma.phrase.findMany({
      where: {
        OR: [
          { normalized: { contains: query.toLowerCase() } },
          { transliteration: { contains: query.toLowerCase() } },
          { textOriginal: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        textOriginal: true,
        transliteration: true,
        slug: true,
        language: {
          select: {
            name: true,
            isoCode: true,
          },
        },
      },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search preview error:", error);
    return NextResponse.json([], { status: 500 });
  }
}