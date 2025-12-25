import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { feedbackSchema, validateRequestBody, sanitizeText } from "@/lib/validations";

// TODO: Add rate limiting (Upstash Redis) - limit to 5 submissions/day per user

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Validate request body with Zod
    const validation = await validateRequestBody(request, feedbackSchema);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { type, subject, message, email } = validation.data;

    // Save feedback to database with XSS sanitization
    await prisma.feedback.create({
      data: {
        type,
        subject: sanitizeText(subject),
        message: sanitizeText(message),
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