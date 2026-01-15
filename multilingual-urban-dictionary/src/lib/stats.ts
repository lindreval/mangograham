import { prisma } from "@/lib/prisma";

export async function getStatistics() {
  try {
    // Verify database connection
    await prisma.$connect();

    const [languageCount, phraseCount, exampleCount] = await Promise.all([
      prisma.language.count(),
      prisma.phrase.count({
        where: { status: "approved" }
      }),
      prisma.example.count({
        where: { status: "approved" }
      }),
    ]);

    // Disconnect after queries
    await prisma.$disconnect();

    // Log warning if all zeros (potential issue)
    if (languageCount === 0 && phraseCount === 0 && exampleCount === 0) {
      console.warn('Statistics returned all zeros - database may be empty or connection issue');
    }

    return {
      languageCount,
      phraseCount,
      exampleCount,
    };
  } catch (error) {
    console.error("Database error in getStatistics:", error);

    // Attempt to disconnect on error
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Failed to disconnect Prisma:", disconnectError);
    }

    // Re-throw to let API route handle HTTP status
    throw new Error(
      error instanceof Error
        ? `Database error: ${error.message}`
        : 'Unknown database error'
    );
  }
}

// Type export for component usage
export type Statistics = Awaited<ReturnType<typeof getStatistics>>;
