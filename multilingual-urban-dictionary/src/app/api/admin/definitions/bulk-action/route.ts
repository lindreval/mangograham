import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authConfig);
  
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { definitionIds, action } = await request.json();

    if (!definitionIds || !Array.isArray(definitionIds) || definitionIds.length === 0) {
      return NextResponse.json({ error: "Invalid definition IDs" }, { status: 400 });
    }

    if (!action || !["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const result = await prisma.definition.updateMany({
      where: { 
        id: { in: definitionIds },
        status: { in: ["pending", "needs review"] }
      },
      data: { status: action },
    });

    return NextResponse.json({ 
      success: true, 
      updatedCount: result.count,
      action: action
    });
  } catch (error) {
    console.error("Error bulk updating definition status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}