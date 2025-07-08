// src/app/search/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

export const revalidate = 30;

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
    where: { normalized: { contains: query.toLowerCase() } },
    take: 50,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      textOriginal: true,
      slug: true,
      language: {
        select: {
          name: true,
          isoCode: true,
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
        <ul className="space-y-3">
          {results.map((p) => (
            <li key={p.id} className="rounded border p-3">
              <Link
                href={`/${p.language.isoCode}/${p.slug}`}
                className="font-medium hover:underline"
              >
                {p.textOriginal}
              </Link>
              <span className="ml-2 text-sm text-muted-foreground">
                {p.language.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
