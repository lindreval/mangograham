"use server";

import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import slugify from "@/lib/slugify";
import type { Session } from "next-auth";

interface CustomSession extends Session {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id: string;
    role: string;
  };
}

export async function createSubmission(formData: FormData) {
  const session = (await getServerSession(authConfig)) as CustomSession | null;

  if (!session?.user) {
    throw new Error("You must be signed in to submit.");
  }

  const userId = session.user.id;
  
  const data = {
    phrase: formData.get("phrase") as string,
    definition: formData.get("definition") as string,
    partOfSpeech: formData.get("partOfSpeech") as string,
    languageId: formData.get("languageId") as string,
    example: formData.get("example") as string,
    exampleTranslation: formData.get("exampleTranslation") as string,
    definitionId: formData.get("definitionId") as string,
    transliteration: formData.get("transliteration") as string,
  };

  // Check if this is adding an example to existing definition
  const isAddingExample = data.definitionId && data.definitionId.trim() !== "";

  return await prisma.$transaction(async (tx) => {
    if (isAddingExample) {
      // Adding example to existing definition
      await tx.example.create({
        data: {
          text: data.example.trim(),
          translation: data.exampleTranslation && data.exampleTranslation.trim() ? data.exampleTranslation.trim() : null,
          authorId: userId,
          definitionId: parseInt(data.definitionId),
        },
      });
      
      // Return the existing phrase for consistency
      return await tx.phrase.findFirst({
        where: { 
          textOriginal: data.phrase,
          languageId: parseInt(data.languageId) 
        }
      });
    } else {
      // Creating new phrase/definition (existing logic)
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
          slug: slugify(data.transliteration || data.phrase),
          partOfSpeech: data.partOfSpeech,
          transliteration: data.transliteration && data.transliteration.trim() ? data.transliteration.trim() : null,
          languageId: parseInt(data.languageId),
        },
      });

      const definition = await tx.definition.create({
        data: {
          phraseId: phrase.id,
          body: data.definition,
          authorId: userId,
        },
      });

      // Create example if provided
      if (data.example && data.example.trim()) {
        await tx.example.create({
          data: {
            text: data.example.trim(),
            translation: data.exampleTranslation && data.exampleTranslation.trim() ? data.exampleTranslation.trim() : null,
            authorId: userId,
            definitionId: definition.id,
          },
        });
      }

      return phrase;
    }
  });
}
