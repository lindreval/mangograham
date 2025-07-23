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
    const { exampleId, action } = await request.json();

    if (!exampleId || !action || !["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    await prisma.example.update({
      where: { id: exampleId },
      data: { status: action },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating example status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}