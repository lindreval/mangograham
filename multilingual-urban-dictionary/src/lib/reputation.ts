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
  // Get all user's definitions with their votes
  const definitions = await prisma.definition.findMany({
    where: { authorId: userId },
    include: {
      votes: true,
      phrase: true,
    },
  });

  // Get all user's examples with their votes
  const examples = await prisma.example.findMany({
    where: { authorId: userId },
    include: {
      votes: true,
    },
  });

  // Get all user's approved phrases
  const approvedPhrases = await prisma.phrase.findMany({
    where: { 
      authorId: userId,
      status: "approved"
    },
  });

  // Calculate definition votes
  let definitionUpvotes = 0;
  let definitionDownvotes = 0;
  
  definitions.forEach(def => {
    def.votes.forEach(vote => {
      if (vote.value > 0) definitionUpvotes++;
      if (vote.value < 0) definitionDownvotes++;
    });
  });

  // Calculate example votes
  let exampleUpvotes = 0;
  let exampleDownvotes = 0;
  
  examples.forEach(ex => {
    ex.votes.forEach(vote => {
      if (vote.value > 0) exampleUpvotes++;
      if (vote.value < 0) exampleDownvotes++;
    });
  });

  // Calculate reputation breakdown
  const fromDefinitions = (definitionUpvotes * 2) - (definitionDownvotes * 1);
  const fromExamples = (exampleUpvotes * 1) - (exampleDownvotes * 0.5);
  const fromPhrases = approvedPhrases.length * 1;

  const totalReputation = Math.max(0, fromDefinitions + fromExamples + fromPhrases);

  return {
    definitionUpvotes,
    definitionDownvotes,
    exampleUpvotes,
    exampleDownvotes,
    approvedPhrases: approvedPhrases.length,
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