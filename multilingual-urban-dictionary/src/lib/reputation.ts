import { prisma } from "@/lib/prisma";

export interface ReputationBreakdown {
  definitionUpvotes: number;
  definitionDownvotes: number;
  exampleUpvotes: number;
  exampleDownvotes: number;
  approvedPhrases: number;
  totalReputation: number;
  breakdown: {
    fromDefinitions: number;
    fromExamples: number;
    fromPhrases: number;
  };
}

export async function calculateUserReputation(userId: string): Promise<ReputationBreakdown> {
  // Use optimized aggregation queries instead of loading all data
  const [definitionVotes, exampleVotes, approvedPhrasesCount] = await Promise.all([
    // Get definition vote counts using aggregation
    prisma.$queryRaw<{ upvotes: bigint; downvotes: bigint }[]>`
      SELECT
        COALESCE(SUM(CASE WHEN dv.value > 0 THEN 1 ELSE 0 END), 0) as upvotes,
        COALESCE(SUM(CASE WHEN dv.value < 0 THEN 1 ELSE 0 END), 0) as downvotes
      FROM "Definition" d
      LEFT JOIN "DefinitionVote" dv ON d.id = dv."definitionId"
      WHERE d."authorId" = ${userId}
    `,
    // Get example vote counts using aggregation
    prisma.$queryRaw<{ upvotes: bigint; downvotes: bigint }[]>`
      SELECT
        COALESCE(SUM(CASE WHEN ev.value > 0 THEN 1 ELSE 0 END), 0) as upvotes,
        COALESCE(SUM(CASE WHEN ev.value < 0 THEN 1 ELSE 0 END), 0) as downvotes
      FROM "Example" e
      LEFT JOIN "ExampleVote" ev ON e.id = ev."exampleId"
      WHERE e."authorId" = ${userId}
    `,
    // Count approved phrases
    prisma.phrase.count({
      where: {
        authorId: userId,
        status: "approved"
      },
    })
  ]);

  // Extract values from aggregation results
  const definitionUpvotes = Number(definitionVotes[0]?.upvotes ?? 0);
  const definitionDownvotes = Number(definitionVotes[0]?.downvotes ?? 0);
  const exampleUpvotes = Number(exampleVotes[0]?.upvotes ?? 0);
  const exampleDownvotes = Number(exampleVotes[0]?.downvotes ?? 0);

  // Calculate reputation breakdown
  const fromDefinitions = (definitionUpvotes * 2) - (definitionDownvotes * 1);
  const fromExamples = (exampleUpvotes * 1) - (exampleDownvotes * 0.5);
  const fromPhrases = approvedPhrasesCount * 1;

  const totalReputation = Math.max(0, fromDefinitions + fromExamples + fromPhrases);

  return {
    definitionUpvotes,
    definitionDownvotes,
    exampleUpvotes,
    exampleDownvotes,
    approvedPhrases: approvedPhrasesCount,
    totalReputation: Math.round(totalReputation),
    breakdown: {
      fromDefinitions: Math.round(fromDefinitions),
      fromExamples: Math.round(fromExamples),
      fromPhrases: fromPhrases,
    },
  };
}

export async function updateUserReputation(userId: string): Promise<number> {
  const reputationData = await calculateUserReputation(userId);
  
  await prisma.user.update({
    where: { id: userId },
    data: { reputation: reputationData.totalReputation },
  });

  return reputationData.totalReputation;
}

export function getReputationLevel(reputation: number): {
  level: string;
  color: string;
  minRep: number;
  nextLevel?: { name: string; minRep: number };
} {
  if (reputation >= 1000) return { level: "Legend", color: "bg-purple-500", minRep: 1000 };
  if (reputation >= 500) return { 
    level: "Expert", 
    color: "bg-yellow-500", 
    minRep: 500,
    nextLevel: { name: "Legend", minRep: 1000 }
  };
  if (reputation >= 100) return { 
    level: "Contributor", 
    color: "bg-blue-500", 
    minRep: 100,
    nextLevel: { name: "Expert", minRep: 500 }
  };
  if (reputation >= 25) return { 
    level: "Helper", 
    color: "bg-green-500", 
    minRep: 25,
    nextLevel: { name: "Contributor", minRep: 100 }
  };
  
  return { 
    level: "Newbie", 
    color: "bg-gray-500", 
    minRep: 0,
    nextLevel: { name: "Helper", minRep: 25 }
  };
}