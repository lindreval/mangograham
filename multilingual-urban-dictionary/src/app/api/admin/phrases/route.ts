import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authConfig);
  
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  try {
    const [phrases, totalCount] = await Promise.all([
      prisma.phrase.findMany({
        where: { 
          status: {
            in: ["pending", "needs review"]
          }
        },
        include: {
          language: true,
          definitions: {
            select: { body: true },
          },
        },
        orderBy: { createdAt: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.phrase.count({
        where: { 
          status: {
            in: ["pending", "needs review"]
          }
        }
      })
    ]);

    return NextResponse.json({
      phrases,
      totalCount,
      hasMore: offset + phrases.length < totalCount,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching admin phrases:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}