import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { type, subject, message, email } = await request.json();

    // Validate required fields
    if (!type || !subject || !message) {
      return NextResponse.json(
        { error: "Type, subject, and message are required" },
        { status: 400 }
      );
    }

    // Save feedback to database
    await prisma.feedback.create({
      data: {
        type,
        subject,
        message,
        email: email || session?.user?.email || null,
        userId: session?.user?.id || null,
      },
    });

    return NextResponse.json({ success: true, message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}