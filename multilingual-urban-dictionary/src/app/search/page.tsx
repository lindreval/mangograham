// src/app/search/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Search, Plus, ArrowRight } from "lucide-react";
import InfiniteScrollSearch from "@/components/InfiniteScrollSearch";
import type { PhraseWithLang } from "@/components/PhraseCard";
import { PageHeader, PageBadge } from "@/components/ui/page-header";

type SearchParams = Record<string, string | string[] | undefined>;

export const revalidate = 30;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const raw = params.q;
  const query = Array.isArray(raw)
    ? raw[0]?.trim() ?? ""
    : raw?.trim() ?? "";

  if (!query) {
    return {
      title: "Search",
      description: "Search for slang and phrases",
    };
  }

  return {
    title: `Search: "${query}"`,
    description: `Search results for "${query}" - Find slang definitions and phrases`,
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const raw = params.q;
  const query = Array.isArray(raw)
    ? raw[0]?.trim() ?? ""
    : raw?.trim() ?? "";

  if (!query) notFound();

  const results = await prisma.phrase.findMany({
    where: {
      OR: [
        { normalized: { contains: query.toLowerCase() } },
        { transliteration: { contains: query.toLowerCase() } }
      ]
    },
    take: 20,
    orderBy: { createdAt: "desc" },
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
        where: { status: "approved" },
        include: {
          votes: true,
          author: {
            select: {
              name: true,
              email: true,
              username: true,
            },
          },
          examples: {
            where: { status: "approved" },
            include: {
              votes: true,
            },
          },
        },
      },
    },
  });

  return (
    <main className="relative mx-auto max-w-5xl p-4 md:p-6">
      {/* Subtle background accent pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>

      <PageHeader
        title={`"${query}"`}
        subtitle="Search results across all languages"
        badge={
          <PageBadge>
            <Search className="w-3 h-3 mr-1.5" />
            {results.length} {results.length === 1 ? "result" : "results"}
          </PageBadge>
        }
      />

      {results.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center text-center animate-page-enter">
          {/* Empty state illustration */}
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full bg-primary/5 flex items-center justify-center transition-transform duration-500 hover:scale-105">
              <Search className="w-12 h-12 text-primary/30" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-float">
              <span className="text-2xl">🤔</span>
            </div>
          </div>

          <h2 className="font-maragsa text-2xl md:text-3xl text-foreground mb-3">
            No results found
          </h2>
          <p className="text-muted-foreground max-w-md mb-8">
            We couldn&apos;t find any phrases matching &quot;{query}&quot;. But
            hey, that means you could be the first to add it!
          </p>

          <Link
            href={`/submit?prefill=${encodeURIComponent(query)}`}
            className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold shadow-card hover:shadow-card-hover transition-all duration-[var(--duration-hover)] ease-[var(--ease-smooth)] hover:-translate-y-1"
          >
            <Plus className="w-5 h-5" />
            Add &quot;{query}&quot;
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      ) : (
        <div className="animate-page-enter space-y-6">
          <InfiniteScrollSearch
            initialPhrases={results as PhraseWithLang[]}
            query={query}
          />
        </div>
      )}
    </main>
  );
}
