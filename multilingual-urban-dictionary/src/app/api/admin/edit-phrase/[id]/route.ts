import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextRequest, NextResponse } from "next/server";
import slugify from "@/lib/slugify";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Check if user is admin
  const session = await getServerSession(authOptions);
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