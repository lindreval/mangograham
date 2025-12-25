// src/app/[lang]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, MessageSquareText } from "lucide-react";
import InfiniteScrollLanguages from "@/components/InfiniteScrollLanguages";
import TopContributors from "@/components/TopContributors";
import type { PhraseWithLang } from "@/components/PhraseCard";
import { PageHeader, PageBadge } from "@/components/ui/page-header";

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
          id: true,
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
            select: { name: true, email: true, username: true },
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
    <main className="mx-auto max-w-7xl p-4 md:p-6">
      <PageHeader
        title={`${language.name}`}
        subtitle={`Explore slang and expressions in ${language.name}`}
        badge={
          <PageBadge>
            <MessageSquareText className="w-3 h-3 mr-1.5" />
            {totalPhraseCount} {totalPhraseCount === 1 ? "phrase" : "phrases"}
          </PageBadge>
        }
        action={
          <Link
            href={`/submit?lang=${lang}`}
            className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-semibold text-sm shadow-card hover:shadow-card-hover transition-all duration-[var(--duration-hover)] ease-[var(--ease-smooth)] hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Add Phrase
          </Link>
        }
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {phrases.length === 0 ? (
            <div className="text-center py-16 animate-page-enter">
              {/* Empty state illustration */}
              <div className="relative mb-8 inline-block">
                <div className="w-32 h-32 rounded-full bg-primary/5 flex items-center justify-center">
                  <MessageSquareText className="w-12 h-12 text-primary/30" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-float">
                  <span className="text-2xl">✨</span>
                </div>
              </div>

              <h2 className="font-maragsa text-2xl md:text-3xl text-foreground mb-3">
                No phrases yet
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Be the first to add a phrase in {language.name}! Help build this
                community-driven dictionary.
              </p>

              <Link
                href={`/submit?lang=${lang}`}
                className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold shadow-card hover:shadow-card-hover transition-all duration-[var(--duration-hover)] ease-[var(--ease-smooth)] hover:-translate-y-1"
              >
                <Plus className="w-5 h-5" />
                Add the first phrase
              </Link>
            </div>
          ) : (
            <div className="animate-page-enter">
              <InfiniteScrollLanguages
                mode="phrases"
                initialPhrases={phrases as PhraseWithLang[]}
                languageId={language.id}
              />
            </div>
          )}
        </div>

        {/* Sidebar with TopContributors */}
        <aside className="w-full lg:w-80 lg:shrink-0 order-first lg:order-last">
          <TopContributors languageId={language.id} />
        </aside>
      </div>
    </main>
  );
}
