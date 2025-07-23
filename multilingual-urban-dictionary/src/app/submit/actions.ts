"use server";

import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import slugify from "@/lib/slugify";
import type { Session } from "next-auth";
import { updateUserReputation } from "@/lib/reputation";

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
    phrase: formData.get("phrase") as string | null,
    definition: formData.get("definition") as string | null,
    partOfSpeech: formData.get("partOfSpeech") as string | null,
    languageId: formData.get("languageId") as string | null,
    example: formData.get("example") as string | null,
    exampleTranslation: formData.get("exampleTranslation") as string | null,
    definitionId: formData.get("definitionId") as string | null,
    transliteration: formData.get("transliteration") as string | null,
  };

  // Extract tag IDs from form data
  const tagIds: number[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('tagIds[') && value) {
      tagIds.push(parseInt(value as string));
    }
  }

  // Check if this is adding an example to existing definition
  const isAddingExample = data.definitionId && data.definitionId.trim() !== "";

  let result;
  
  if (isAddingExample) {
    // Validate required data for examples
    if (!data.example || !data.example.trim()) {
      throw new Error("Example text is required");
    }
    if (!data.definitionId) {
      throw new Error("Definition ID is required");
    }
    
    // Adding example to existing definition - simple operation
    await prisma.example.create({
      data: {
        text: data.example.trim(),
        translation: data.exampleTranslation && data.exampleTranslation.trim() ? data.exampleTranslation.trim() : null,
        authorId: userId,
        definitionId: parseInt(data.definitionId),
      },
    });
    
    // Return the existing phrase for consistency
    result = await prisma.phrase.findFirst({
      where: { 
        textOriginal: data.phrase || "",
        languageId: parseInt(data.languageId || "0") 
      },
      include: {
        language: {
          select: { isoCode: true }
        }
      }
    });
  } else {
    // Creating new phrase/definition - use minimal transaction
    result = await prisma.$transaction(async (tx) => {
      // Validate required data
      if (!data.phrase || !data.phrase.trim()) {
        throw new Error("Phrase text is required");
      }
      if (!data.definition || !data.definition.trim()) {
        throw new Error("Definition is required");
      }
      if (!data.languageId) {
        throw new Error("Language is required");
      }
      
      const phraseText = data.phrase.trim();
      
      // First check if phrase exists
      const existingPhrase = await tx.phrase.findFirst({
        where: {
          normalized: phraseText.toLowerCase(),
          languageId: parseInt(data.languageId),
        }
      });

      let phrase;
      if (existingPhrase) {
        phrase = existingPhrase;
      } else {
        phrase = await tx.phrase.create({
          data: {
            textOriginal: phraseText,
            normalized: phraseText.toLowerCase(),
            slug: slugify(data.transliteration || phraseText),
            partOfSpeech: data.partOfSpeech,
            transliteration: data.transliteration && data.transliteration.trim() ? data.transliteration.trim() : null,
            languageId: parseInt(data.languageId),
            authorId: userId,
          },
        });
      }

      const definition = await tx.definition.create({
        data: {
          phraseId: phrase.id,
          body: data.definition.trim(),
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
    });

    // Add language data to result for URL construction
    if (result && !('language' in result)) {
      result = await prisma.phrase.findUnique({
        where: { id: result.id },
        include: {
          language: {
            select: { isoCode: true }
          }
        }
      }) || result;
    }
  }

  // Update user reputation outside transaction
  try {
    await updateUserReputation(userId);
  } catch (error) {
    console.warn('Failed to update user reputation:', error);
  }

  // Create tag associations outside the main transaction to avoid blocking it
  if (result && !isAddingExample && tagIds.length > 0) {
    try {
      for (const tagId of tagIds) {
        await prisma.$executeRaw`
          INSERT INTO "PhraseTag" ("phraseId", "tagId", "createdAt")
          VALUES (${result.id}, ${tagId}, NOW())
          ON CONFLICT ("phraseId", "tagId") DO NOTHING
        `;
      }
    } catch (error) {
      console.warn('Failed to create some tag associations:', error);
      // Don't throw error here - phrase was created successfully
    }
  }

  // Always return complete phrase data with language for URL construction
  if (result) {
    return await prisma.phrase.findUnique({
      where: { id: result.id },
      include: {
        language: {
          select: { isoCode: true }
        }
      }
    });
  }
  
  return result;
}
