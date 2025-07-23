// src/app/search/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import PhraseCard from "@/components/PhraseCard";

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
  // Next.js injects this prop automatically
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
      definitions: {
        where: { status: { in: ["approved", "pending"] } },
        include: {
          votes: true,
          author: {
            select: {
              name: true,
              email: true,
            },
          },
          examples: {
            where: { status: { in: ["approved", "pending"] } },
            include: {
              votes: true,
            },
          },
        },
      },
    },
  });

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4">
      <h1 className="text-xl font-semibold">
        Results for “{query}” ({results.length})
      </h1>

      {results.length === 0 ? (
        <p>
          Nothing yet.{" "}
          <Link
            href={`/submit?prefill=${encodeURIComponent(query)}`}
            className="underline"
          >
            Add it?
          </Link>
        </p>
      ) : (
        <div className="space-y-4 transition-transform duration-300 hover:scale-102">
          {results.map((phrase) => (
            <PhraseCard key={phrase.id} phrase={phrase} />
          ))}
        </div>
      )}
    </main>
  );
}
