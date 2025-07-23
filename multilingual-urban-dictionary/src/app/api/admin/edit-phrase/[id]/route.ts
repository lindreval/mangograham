import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import slugify from "@/lib/slugify";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Check if user is admin
  const session = await getServerSession(authConfig);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const data = await request.json();
    const {
      textOriginal,
      transliteration,
      pronunciation,
      partOfSpeech,
      languageId,
      status,
      selectedTags,
      definitions,
    } = data;

    // Get current phrase to check if slug needs updating
    const currentPhrase = await prisma.phrase.findUnique({
      where: { id: parseInt(id) },
    });

    if (!currentPhrase) {
      return NextResponse.json({ error: "Phrase not found" }, { status: 404 });
    }

    // Generate new slug if text changed
    let slug = currentPhrase.slug;
    if (textOriginal !== currentPhrase.textOriginal) {
      slug = slugify(textOriginal);
      
      // Check if slug already exists for a different phrase
      const existingPhrase = await prisma.phrase.findUnique({
        where: { slug },
      });
      
      if (existingPhrase && existingPhrase.id !== parseInt(id)) {
        // Append ID to make unique
        slug = `${slug}-${id}`;
      }
    }

    // Update the phrase
    const updatedPhrase = await prisma.phrase.update({
      where: { id: parseInt(id) },
      data: {
        textOriginal,
        transliteration: transliteration || null,
        pronunciation: pronunciation || null,
        partOfSpeech: partOfSpeech || null,
        languageId: parseInt(languageId),
        status,
        slug,
        normalized: textOriginal.toLowerCase(),
      },
    });

    // Update tags - delete existing and create new ones
    await prisma.phraseTag.deleteMany({
      where: { phraseId: parseInt(id) },
    });

    if (selectedTags && selectedTags.length > 0) {
      await prisma.phraseTag.createMany({
        data: selectedTags.map((tagId: number) => ({
          phraseId: parseInt(id),
          tagId,
        })),
      });
    }

    // Update definitions if provided
    if (definitions && Array.isArray(definitions)) {
      // Process each definition
      for (const definition of definitions) {
        if (definition.id) {
          // Update existing definition
          await prisma.definition.update({
            where: { id: definition.id },
            data: {
              body: definition.body,
              status: definition.status,
            },
          });

          // Handle examples for this definition
          if (definition.examples && Array.isArray(definition.examples)) {
            // Delete existing examples for this definition
            await prisma.example.deleteMany({
              where: { definitionId: definition.id },
            });

            // Create new examples
            for (const example of definition.examples) {
              if (example.text.trim()) {
                await prisma.example.create({
                  data: {
                    text: example.text,
                    translation: example.translation || null,
                    status: example.status,
                    definitionId: definition.id,
                    authorId: session.user.id,
                  },
                });
              }
            }
          }
        } else {
          // Create new definition
          const newDefinition = await prisma.definition.create({
            data: {
              body: definition.body,
              status: definition.status,
              phraseId: parseInt(id),
              authorId: session.user.id,
            },
          });

          // Create examples for new definition
          if (definition.examples && Array.isArray(definition.examples)) {
            for (const example of definition.examples) {
              if (example.text.trim()) {
                await prisma.example.create({
                  data: {
                    text: example.text,
                    translation: example.translation || null,
                    status: example.status,
                    definitionId: newDefinition.id,
                    authorId: session.user.id,
                  },
                });
              }
            }
          }
        }
      }

      // Remove definitions that are no longer in the array
      const definitionIds = definitions
        .filter(d => d.id)
        .map(d => d.id);
      
      if (definitionIds.length > 0) {
        await prisma.definition.deleteMany({
          where: {
            phraseId: parseInt(id),
            id: { notIn: definitionIds },
          },
        });
      } else {
        // If no existing definitions remain, delete all
        await prisma.definition.deleteMany({
          where: { phraseId: parseInt(id) },
        });
      }
    }

    return NextResponse.json(updatedPhrase);
  } catch (error) {
    console.error("Error updating phrase:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to update phrase";
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        errorMessage = "A phrase with this text already exists";
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}