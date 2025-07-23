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
    const { exampleIds, action } = await request.json();

    if (!exampleIds || !Array.isArray(exampleIds) || exampleIds.length === 0) {
      return NextResponse.json({ error: "Invalid example IDs" }, { status: 400 });
    }

    if (!action || !["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const result = await prisma.example.updateMany({
      where: { 
        id: { in: exampleIds },
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
    console.error("Error bulk updating example status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}