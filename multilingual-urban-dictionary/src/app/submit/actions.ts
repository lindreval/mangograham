"use server";

import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function createSubmission(formData: FormData) {
  const session = await getServerSession(authConfig);
  
  if (!session?.user) {
    throw new Error("You must be signed in to submit.");
  }

  const userId = session.user.id;
  
  const data = {
    phrase: formData.get("phrase") as string,
    definition: formData.get("definition") as string,
    partOfSpeech: formData.get("partOfSpeech") as string,
    languageId: formData.get("languageId") as string,
  };

  return await prisma.$transaction(async (tx) => {
    const phrase = await tx.phrase.upsert({
      where: {
        normalized_languageId: {
          normalized: data.phrase.toLowerCase(),
          languageId: parseInt(data.languageId),
        },
      },
      update: {},
      create: {
        textOriginal: data.phrase,
        normalized: data.phrase.toLowerCase(),
        partOfSpeech: data.partOfSpeech,
        languageId: parseInt(data.languageId),
      },
    });

    await tx.definition.create({
      data: {
        phraseId: phrase.id,
        body: data.definition,
        authorId: userId,
      },
    });

    return phrase;
  });
}