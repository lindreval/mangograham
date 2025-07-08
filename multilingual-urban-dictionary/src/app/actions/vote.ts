"use server";

import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function voteOnDefinition(definitionId: number, value: number) {
  const session = await getServerSession(authConfig);
  
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  // Ensure user exists in database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  
  if (!user) {
    throw new Error("User not found in database. Please sign out and sign back in.");
  }

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

  revalidatePath(`/`);
}

export async function voteOnExample(exampleId: number, value: number) {
  const session = await getServerSession(authConfig);
  
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  // Ensure user exists in database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  
  if (!user) {
    throw new Error("User not found in database. Please sign out and sign back in.");
  }

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

  revalidatePath(`/`);
}