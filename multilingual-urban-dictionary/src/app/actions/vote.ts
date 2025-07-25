"use server";

import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { updateUserReputation } from "@/lib/reputation";
import { AchievementService } from "@/lib/achievements";

export async function voteOnDefinition(definitionId: number, value: number) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return { error: "Please sign in to vote" };
    }

    // Parallel queries: check existing vote AND get definition author
    const [existingVote, definition] = await Promise.all([
      prisma.definitionVote.findUnique({
        where: {
          userId_definitionId: {
            userId: session.user.id,
            definitionId,
          },
        },
      }),
      prisma.definition.findUnique({
        where: { id: definitionId },
        select: { authorId: true }
      })
    ]);

    // Fast vote operation
    if (existingVote && existingVote.value === value) {
      // Undo vote (delete)
      await prisma.definitionVote.delete({
        where: {
          userId_definitionId: {
            userId: session.user.id,
            definitionId,
          },
        },
      });
    } else {
      // Create or update vote
      await prisma.definitionVote.upsert({
        where: {
          userId_definitionId: {
            userId: session.user.id,
            definitionId,
          },
        },
        update: { value },
        create: {
          userId: session.user.id,
          definitionId,
          value,
        },
      });
    }

    // Revalidation must be synchronous in server actions
    revalidatePath(`/`);

    // Start all background work immediately (truly non-blocking)
    setImmediate(() => {
      const backgroundWork = [];
      
      if (definition?.authorId) {
        backgroundWork.push(
          updateUserReputation(definition.authorId).catch(err => 
            console.warn('Failed to update author reputation:', err)
          ),
          AchievementService.checkAndAwardAchievements(definition.authorId, 'VOTE_RECEIVED').catch(err =>
            console.warn('Failed to check author achievements:', err)
          )
        );
      }

      backgroundWork.push(
        AchievementService.checkAndAwardAchievements(session.user.id, 'VOTE_CAST').catch(err =>
          console.warn('Failed to check voter achievements:', err)
        )
      );

      // Fire and forget
      Promise.allSettled(backgroundWork);
    });

    return { success: true };
  } catch (error) {
    console.error("Vote error:", error);
    return { error: "Failed to record vote. Please try again." };
  }
}

export async function voteOnExample(exampleId: number, value: number) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return { error: "Please sign in to vote" };
    }

    // Parallel queries: check existing vote AND get example author
    const [existingVote, example] = await Promise.all([
      prisma.exampleVote.findUnique({
        where: {
          userId_exampleId: {
            userId: session.user.id,
            exampleId,
          },
        },
      }),
      prisma.example.findUnique({
        where: { id: exampleId },
        select: { authorId: true }
      })
    ]);

    // Fast vote operation
    if (existingVote && existingVote.value === value) {
      // Undo vote (delete)
      await prisma.exampleVote.delete({
        where: {
          userId_exampleId: {
            userId: session.user.id,
            exampleId,
          },
        },
      });
    } else {
      // Create or update vote
      await prisma.exampleVote.upsert({
        where: {
          userId_exampleId: {
            userId: session.user.id,
            exampleId,
          },
        },
        update: { value },
        create: {
          userId: session.user.id,
          exampleId,
          value,
        },
      });
    }

    // Revalidation must be synchronous in server actions
    revalidatePath(`/`);

    // Start all background work immediately (truly non-blocking)
    setImmediate(() => {
      const backgroundWork = [];
      
      if (example?.authorId) {
        backgroundWork.push(
          updateUserReputation(example.authorId).catch(err => 
            console.warn('Failed to update author reputation:', err)
          ),
          AchievementService.checkAndAwardAchievements(example.authorId, 'VOTE_RECEIVED').catch(err =>
            console.warn('Failed to check author achievements:', err)
          )
        );
      }

      backgroundWork.push(
        AchievementService.checkAndAwardAchievements(session.user.id, 'VOTE_CAST').catch(err =>
          console.warn('Failed to check voter achievements:', err)
        )
      );

      // Fire and forget
      Promise.allSettled(backgroundWork);
    });

    return { success: true };
  } catch (error) {
    console.error("Vote error:", error);
    return { error: "Failed to record vote. Please try again." };
  }
}