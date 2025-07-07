"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function voteOnDefinition(definitionId: number, value: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

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

  revalidatePath(`/`); // or use specific path if needed
}

export async function voteOnExample(exampleId: number, value: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

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
