import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import slugify from "@/lib/slugify";

export const revalidate = 30; // ISR every 30 s

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() ?? "";
  if (!query) notFound();

  // naive substring search for MVP
  const results = await prisma.phrase.findMany({
    where: { normalized: { contains: query.toLowerCase() } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { language: true },
  });

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4">
      <h1 className="text-xl font-semibold">
        Results for “{query}” ({results.length})
      </h1>

      {results.length === 0 && (
        <p>
          Nothing yet.{" "}
          <Link href={`/submit?prefill=${encodeURIComponent(query)}`} className="underline">
            Add it?
          </Link>
        </p>
      )}

      <ul className="space-y-3">
        {results.map((p) => (
          <li key={p.id} className="rounded border p-3">
            <Link
              href={`/${p.language.isoCode}/${slugify(p.textOriginal)}-${p.id}`}
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
    </main>
  );
}
