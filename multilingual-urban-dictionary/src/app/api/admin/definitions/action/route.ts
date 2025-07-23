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
    const { definitionId, action } = await request.json();

    if (!definitionId || !action || !["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    await prisma.definition.update({
      where: { id: definitionId },
      data: { status: action },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating definition status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}