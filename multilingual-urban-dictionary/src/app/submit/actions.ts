"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// const session = await getServerSession(authConfig);

// const schema = z.object({
//   phrase: z.string().min(1).max(80),
//   languageId: z.string(),
//   definition: z.string().min(1),
//   partOfSpeech: z.string().optional(),
//   example: z.string().optional(),
// });

export async function createSubmission(formData: FormData) {
  const session = await auth();
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


