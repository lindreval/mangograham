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

    // Ensure user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    
    if (!user) {
      return { error: "User account not found. Please sign out and sign back in." };
    }

    // Check if user already voted with the same value
    const existingVote = await prisma.definitionVote.findUnique({
      where: {
        userId_definitionId: {
          userId: session.user.id,
          definitionId,
        },
      },
    });

    // If same vote exists, remove it (undo vote)
    if (existingVote && existingVote.value === value) {
      await prisma.definitionVote.delete({
        where: {
          userId_definitionId: {
            userId: session.user.id,
            definitionId,
          },
        },
      });
    } else {
      // Otherwise, create or update the vote
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

    // Update the author's reputation after voting
    const definition = await prisma.definition.findUnique({
      where: { id: definitionId },
      select: { authorId: true }
    });

    // Collect all newly awarded achievements
    const achievements = [];
    
    if (definition?.authorId) {
      await updateUserReputation(definition.authorId);
      
      // Check achievements for content author (receiving votes)
      const authorAchievements = await AchievementService.checkAndAwardAchievements(definition.authorId, 'VOTE_RECEIVED');
      achievements.push(...authorAchievements);
    }

    // Check achievements for voter (casting votes)
    const voterAchievements = await AchievementService.checkAndAwardAchievements(session.user.id, 'VOTE_CAST');
    achievements.push(...voterAchievements);

    revalidatePath(`/`);
    return { success: true, achievements };
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

    // Ensure user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    
    if (!user) {
      return { error: "User account not found. Please sign out and sign back in." };
    }

    // Check if user already voted with the same value
    const existingVote = await prisma.exampleVote.findUnique({
      where: {
        userId_exampleId: {
          userId: session.user.id,
          exampleId,
        },
      },
    });

    // If same vote exists, remove it (undo vote)
    if (existingVote && existingVote.value === value) {
      await prisma.exampleVote.delete({
        where: {
          userId_exampleId: {
            userId: session.user.id,
            exampleId,
          },
        },
      });
    } else {
      // Otherwise, create or update the vote
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

    // Update the author's reputation after voting
    const example = await prisma.example.findUnique({
      where: { id: exampleId },
      select: { authorId: true }
    });

    // Collect all newly awarded achievements
    const achievements = [];
    
    if (example?.authorId) {
      await updateUserReputation(example.authorId);
      
      // Check achievements for content author (receiving votes)
      const authorAchievements = await AchievementService.checkAndAwardAchievements(example.authorId, 'VOTE_RECEIVED');
      achievements.push(...authorAchievements);
    }

    // Check achievements for voter (casting votes)
    const voterAchievements = await AchievementService.checkAndAwardAchievements(session.user.id, 'VOTE_CAST');
    achievements.push(...voterAchievements);

    revalidatePath(`/`);
    return { success: true, achievements };
  } catch (error) {
    console.error("Vote error:", error);
    return { error: "Failed to record vote. Please try again." };
  }
}