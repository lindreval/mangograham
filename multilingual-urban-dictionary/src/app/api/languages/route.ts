import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  try {
    const languages = await prisma.language.findMany({
      include: { _count: { select: { phrases: true } } },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    });

    return NextResponse.json({ languages, hasMore: languages.length === limit });
  } catch (error) {
    console.error("Error fetching languages:", error);
    return NextResponse.json({ error: "Failed to fetch languages" }, { status: 500 });
  }
}