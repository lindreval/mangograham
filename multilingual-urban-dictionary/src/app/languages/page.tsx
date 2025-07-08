// src/app/languages/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 300; // 5-min ISR

export default async function LanguagesPage() {
  const languages = await prisma.language.findMany({
    include: { _count: { select: { phrases: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-4">
      <h1 className="text-2xl font-bold">Languages</h1>

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {languages.map((l) => (
          <li
            key={l.id}
            id={l.isoCode}
            className="rounded-lg border p-3 shadow-sm hover:bg-accent"
          >
            <div className="font-medium"><Link
              href={`/${l.isoCode}`}
              className="hover:underline"
            >
              {l.name}
            </Link>
            </div>
            <div className="text-xs text-muted-foreground">
              {l._count.phrases} phrases
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
