"use server";

import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { updateUserReputation } from "@/lib/reputation";
import { AchievementService } from "@/lib/achievements";

type VoteResult = { success: true } | { error: string };

/**
 * Generic vote handler factory to eliminate duplication between definition and example voting.
 * Creates a vote function for any voteable entity type.
 */
function createVoteHandler<TEntityId extends number>(config: {
  entityName: string;
  getExistingVote: (userId: string, entityId: TEntityId) => Promise<{ value: number } | null>;
  deleteVote: (userId: string, entityId: TEntityId) => Promise<void>;
  upsertVote: (userId: string, entityId: TEntityId, value: number) => Promise<void>;
  getAuthorId: (entityId: TEntityId) => Promise<string | null>;
}) {
  return async function vote(entityId: TEntityId, value: number): Promise<VoteResult> {
    try {
      const session = await getServerSession(authConfig);

      if (!session?.user?.id) {
        return { error: "Please sign in to vote" };
      }

      const userId = session.user.id;

      // Parallel queries: check existing vote AND get entity author
      const [existingVote, authorId] = await Promise.all([
        config.getExistingVote(userId, entityId),
        config.getAuthorId(entityId),
      ]);

      // Fast vote operation
      if (existingVote && existingVote.value === value) {
        // Undo vote (delete)
        await config.deleteVote(userId, entityId);
      } else {
        // Create or update vote
        await config.upsertVote(userId, entityId, value);
      }

      // Note: Removed aggressive revalidatePath('/') - optimistic updates handle UI
      // and ISR (60s) handles other users. This reduces unnecessary server load.

      // Start all background work immediately (truly non-blocking)
      setImmediate(() => {
        const backgroundWork = [];

        if (authorId) {
          backgroundWork.push(
            updateUserReputation(authorId).catch((err) =>
              console.warn("Failed to update author reputation:", err)
            ),
            AchievementService.checkAndAwardAchievements(authorId, "VOTE_RECEIVED").catch((err) =>
              console.warn("Failed to check author achievements:", err)
            )
          );
        }

        backgroundWork.push(
          AchievementService.checkAndAwardAchievements(userId, "VOTE_CAST").catch((err) =>
            console.warn("Failed to check voter achievements:", err)
          )
        );

        // Fire and forget
        Promise.allSettled(backgroundWork);
      });

      return { success: true };
    } catch (error) {
      console.error(`${config.entityName} vote error:`, error);
      return { error: "Failed to record vote. Please try again." };
    }
  };
}

// Definition voting - uses the generic factory
export const voteOnDefinition = createVoteHandler<number>({
  entityName: "Definition",
  getExistingVote: (userId, definitionId) =>
    prisma.definitionVote.findUnique({
      where: { userId_definitionId: { userId, definitionId } },
      select: { value: true },
    }),
  deleteVote: (userId, definitionId) =>
    prisma.definitionVote.delete({
      where: { userId_definitionId: { userId, definitionId } },
    }).then(() => {}),
  upsertVote: (userId, definitionId, value) =>
    prisma.definitionVote.upsert({
      where: { userId_definitionId: { userId, definitionId } },
      update: { value },
      create: { userId, definitionId, value },
    }).then(() => {}),
  getAuthorId: async (definitionId) => {
    const definition = await prisma.definition.findUnique({
      where: { id: definitionId },
      select: { authorId: true },
    });
    return definition?.authorId ?? null;
  },
});

// Example voting - uses the generic factory
export const voteOnExample = createVoteHandler<number>({
  entityName: "Example",
  getExistingVote: (userId, exampleId) =>
    prisma.exampleVote.findUnique({
      where: { userId_exampleId: { userId, exampleId } },
      select: { value: true },
    }),
  deleteVote: (userId, exampleId) =>
    prisma.exampleVote.delete({
      where: { userId_exampleId: { userId, exampleId } },
    }).then(() => {}),
  upsertVote: (userId, exampleId, value) =>
    prisma.exampleVote.upsert({
      where: { userId_exampleId: { userId, exampleId } },
      update: { value },
      create: { userId, exampleId, value },
    }).then(() => {}),
  getAuthorId: async (exampleId) => {
    const example = await prisma.example.findUnique({
      where: { id: exampleId },
      select: { authorId: true },
    });
    return example?.authorId ?? null;
  },
});
