"use server";

import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import slugify from "@/lib/slugify";
import type { Session } from "next-auth";
import { updateUserReputation } from "@/lib/reputation";
import { AchievementService } from "@/lib/achievements";
import { sanitizeText } from "@/lib/validations";

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
    region: formData.get("region") as string | null,
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
    
    // Adding example to existing definition - simple operation with XSS sanitization
    await prisma.example.create({
      data: {
        text: sanitizeText(data.example.trim()),
        translation: data.exampleTranslation && data.exampleTranslation.trim() ? sanitizeText(data.exampleTranslation.trim()) : null,
        authorId: userId,
        definitionId: parseInt(data.definitionId),
      },
    });

    // Note: Achievement check moved to after reputation update (line ~204) to avoid duplicate calls

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
        // Check if a new region was submitted and update the phrase if needed
        const newRegion = data.region?.trim();
        if (newRegion) {
          const existingRegions = existingPhrase.region
            ? existingPhrase.region.split(',').map(r => r.trim().toLowerCase())
            : [];

          // Only add the region if it's not already in the list
          if (!existingRegions.includes(newRegion.toLowerCase())) {
            const updatedRegion = existingPhrase.region
              ? `${existingPhrase.region}, ${newRegion}`
              : newRegion;

            phrase = await tx.phrase.update({
              where: { id: existingPhrase.id },
              data: { region: updatedRegion }
            });
          } else {
            phrase = existingPhrase;
          }
        } else {
          phrase = existingPhrase;
        }
      } else {
        // Create phrase with XSS sanitization
        phrase = await tx.phrase.create({
          data: {
            textOriginal: sanitizeText(phraseText),
            normalized: phraseText.toLowerCase(),
            slug: slugify(data.transliteration || phraseText),
            partOfSpeech: data.partOfSpeech,
            transliteration: data.transliteration && data.transliteration.trim() ? sanitizeText(data.transliteration.trim()) : null,
            region: data.region && data.region.trim() ? sanitizeText(data.region.trim()) : null,
            languageId: parseInt(data.languageId),
            authorId: userId,
          },
        });
      }

      // Create definition with XSS sanitization
      const definition = await tx.definition.create({
        data: {
          phraseId: phrase.id,
          body: sanitizeText(data.definition.trim()),
          authorId: userId,
        },
      });

      // Create example if provided with XSS sanitization
      if (data.example && data.example.trim()) {
        await tx.example.create({
          data: {
            text: sanitizeText(data.example.trim()),
            translation: data.exampleTranslation && data.exampleTranslation.trim() ? sanitizeText(data.exampleTranslation.trim()) : null,
            authorId: userId,
            definitionId: definition.id,
          },
        });
      }

      return { phrase, definition, createdNewPhrase: !existingPhrase };
    });

    // Add language data to result for URL construction
    if (result && typeof result === 'object' && 'phrase' in result && !('language' in result.phrase)) {
      const phraseWithLanguage = await prisma.phrase.findUnique({
        where: { id: result.phrase.id },
        include: {
          language: {
            select: { isoCode: true }
          }
        }
      });
      if (phraseWithLanguage) {
        result = { ...result, phrase: phraseWithLanguage };
      }
    }
  }

  // Update user reputation outside transaction
  try {
    await updateUserReputation(userId);
  } catch (error) {
    console.warn('Failed to update user reputation:', error);
  }

  // Check achievements outside transaction and collect them
  const achievements = [];
  try {
    if (isAddingExample) {
      // Just added an example
      const exampleAchievements = await AchievementService.checkAndAwardAchievements(userId, 'EXAMPLE_CREATED');
      achievements.push(...exampleAchievements);
    } else {
      // Added definition (and possibly phrase)
      const definitionAchievements = await AchievementService.checkAndAwardAchievements(userId, 'DEFINITION_CREATED');
      achievements.push(...definitionAchievements);
      
      // If we created a new phrase, check phrase creation achievements
      if (result && typeof result === 'object' && 'createdNewPhrase' in result && result.createdNewPhrase) {
        const phraseAchievements = await AchievementService.checkAndAwardAchievements(userId, 'PHRASE_CREATED');
        achievements.push(...phraseAchievements);
      }
    }
  } catch (error) {
    console.warn('Failed to check achievements:', error);
  }

  // Create tag associations outside the main transaction to avoid blocking it
  if (result && !isAddingExample && tagIds.length > 0) {
    try {
      const phraseId = typeof result === 'object' && 'phrase' in result ? result.phrase.id : result.id;
      for (const tagId of tagIds) {
        await prisma.$executeRaw`
          INSERT INTO "PhraseTag" ("phraseId", "tagId", "createdAt")
          VALUES (${phraseId}, ${tagId}, NOW())
          ON CONFLICT ("phraseId", "tagId") DO NOTHING
        `;
      }
    } catch (error) {
      console.warn('Failed to create some tag associations:', error);
      // Don't throw error here - phrase was created successfully
    }
  }

  // Always return complete phrase data with language for URL construction, plus achievements
  if (result) {
    let phraseData;
    if (typeof result === 'object' && 'phrase' in result) {
      // Get the phrase from the complex result
      phraseData = result.phrase;
    } else {
      // Return the phrase directly, adding language data if needed
      phraseData = await prisma.phrase.findUnique({
        where: { id: result.id },
        include: {
          language: {
            select: { isoCode: true }
          }
        }
      });
    }
    
    // Return phrase data with achievements
    return { ...phraseData, achievements };
  }
  
  if (result && typeof result === 'object') {
    return { ...(result as Record<string, unknown>), achievements };
  }
  return { achievements };
}
