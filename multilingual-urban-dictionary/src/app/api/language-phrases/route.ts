import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const languageId = searchParams.get("languageId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  if (!languageId) {
    return NextResponse.json({ error: "Language ID is required" }, { status: 400 });
  }

  try {
    const phrases = await prisma.phrase.findMany({
      where: {
        languageId: parseInt(languageId),
        definitions: {
          some: {
            status: {
              in: ["approved", "pending"],
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        language: {
          select: {
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
          where: {
            status: {
              in: ["approved", "pending"],
            },
          },
          include: {
            votes: true,
            author: {
              select: { name: true, email: true },
            },
            examples: {
              where: {
                status: {
                  in: ["approved", "pending"],
                },
              },
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
    console.error("Error fetching language phrases:", error);
    return NextResponse.json({ error: "Failed to fetch phrases" }, { status: 500 });
  }
}