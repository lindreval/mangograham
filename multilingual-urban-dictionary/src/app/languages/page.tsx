// src/app/languages/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Languages",
  description: "Browse all supported languages and their slang phrases",
};

export const revalidate = 300; // 5-min ISR

export default async function LanguagesPage() {
  let languages: Array<{ id: number; name: string; isoCode: string; _count: { phrases: number } }> = [];

  try {
    languages = await prisma.language.findMany({
      include: { _count: { select: { phrases: true } } },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.warn("Database not available during build:", error);
  }

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-4">
      <h1 className="text-2xl font-bold">Languages</h1>

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {languages.map((l) => (
          <Link key={l.id} href={`/${l.isoCode}`}>
            <li
              id={l.isoCode}
              className="rounded-lg border-2 p-3 bg-background shadow-sm transition-transform duration-300 hover:scale-102 hover:bg-accent shadow-elevation-medium hover:shadow-elevation-high transition-shadow cursor-pointer"
            >
              <div className="font-medium">
                {l.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {l._count.phrases} phrases
              </div>
            </li>
          </Link>
        ))}
      </ul>
    </main>
  );
}
