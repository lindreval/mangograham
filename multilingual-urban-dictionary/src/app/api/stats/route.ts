import { NextResponse } from "next/server";
import { getStatistics } from "@/lib/stats";

export async function GET() {
  try {
    const stats = await getStatistics();

    // Validate stats structure
    if (
      typeof stats.languageCount !== 'number' ||
      typeof stats.phraseCount !== 'number' ||
      typeof stats.exampleCount !== 'number'
    ) {
      console.error('Invalid stats structure:', stats);
      return NextResponse.json(
        { error: 'Invalid statistics data structure' },
        { status: 500 }
      );
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to fetch statistics:", error);

    // Determine appropriate error response
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch statistics';
    const isDbError = errorMessage.includes('Database');

    return NextResponse.json(
      {
        error: errorMessage,
        type: isDbError ? 'database' : 'unknown'
      },
      { status: isDbError ? 503 : 500 }
    );
  }
}
