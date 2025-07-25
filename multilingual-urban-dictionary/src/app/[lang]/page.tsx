// src/app/[lang]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import InfiniteScrollLanguages from "@/components/InfiniteScrollLanguages";
import TopContributors from "@/components/TopContributors";
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

  // Get total count of phrases for this language
  const totalPhraseCount = await prisma.phrase.count({
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
  });

  // Get first 20 phrases for this language with approved definitions
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
    take: 20,
    include: {
      language: {
        select: {
          name: true,
          isoCode: true,
        },
      },
      tags: {
        include: {
          tag: true,
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
          examples: {
            where: {
              status: {
                in: ["approved", "pending"],
              },
            },
            include: {
              votes: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {language.name} Phrases
        </h1>
        <p className="text-muted-foreground">
          {totalPhraseCount} phrase{totalPhraseCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
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
            <InfiniteScrollLanguages 
              mode="phrases"
              initialPhrases={phrases as PhraseWithLang[]}
              languageId={language.id}
            />
          )}
        </div>

        {/* Sidebar with TopContributors - responsive positioning */}
        <aside className="w-full lg:w-80 lg:shrink-0 order-first lg:order-last">
          <TopContributors languageId={language.id} />
        </aside>
      </div>
    </main>
  );
}