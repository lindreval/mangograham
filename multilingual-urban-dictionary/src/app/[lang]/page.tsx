// src/app/[lang]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PhraseCard from "@/components/PhraseCard";
import type { PhraseWithLang } from "@/components/PhraseCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  
  const language = await prisma.language.findUnique({
    where: { isoCode: lang },
  });

  if (!language) {
    return {
      title: "Language not found",
    };
  }

  return {
    title: `${language.name} Phrases`,
    description: `Browse all slang phrases and definitions in ${language.name}`,
  };
}

export default async function LanguagePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // Check if language exists
  const language = await prisma.language.findUnique({
    where: { isoCode: lang },
  });

  if (!language) {
    return notFound();
  }

  // Get all phrases for this language with approved definitions
  const phrases = await prisma.phrase.findMany({
    where: {
      languageId: language.id,
      definitions: {
        some: {
          status: {
            in: ["approved", "pending"],
          },
        },
      },
    },
    include: {
      language: {
        select: {
          name: true,
          isoCode: true,
        },
      },
      definitions: {
        where: {
          status: {
            in: ["approved", "pending"],
          },
        },
        include: {
          votes: true,
          author: {
            select: { name: true, email: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {language.name} Phrases
        </h1>
        <p className="text-muted-foreground">
          {phrases.length} phrase{phrases.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {phrases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No phrases found for {language.name} yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Be the first to add a phrase!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {phrases.map((phrase) => (
            <PhraseCard 
              key={phrase.id} 
              phrase={phrase as PhraseWithLang} 
            />
          ))}
        </div>
      )}
    </main>
  );
}