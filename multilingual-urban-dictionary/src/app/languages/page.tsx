// src/app/languages/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { Globe, MessageSquareText, ArrowRight } from "lucide-react";
import { PageHeader, PageBadge } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Languages",
  description: "Browse all supported languages and their slang phrases",
};

export const revalidate = 300; // 5-min ISR

export default async function LanguagesPage() {
  let languages: Array<{
    id: number;
    name: string;
    isoCode: string;
    _count: { phrases: number };
  }> = [];

  try {
    languages = await prisma.language.findMany({
      include: { _count: { select: { phrases: true } } },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.warn("Database not available during build:", error);
  }

  const totalPhrases = languages.reduce((sum, l) => sum + l._count.phrases, 0);

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-6">
      <PageHeader
        title="Languages"
        subtitle="Explore slang and expressions from around the world"
        badge={
          <PageBadge>
            <Globe className="w-3 h-3 mr-1.5" />
            {languages.length} languages
          </PageBadge>
        }
      />

      {/* Stats summary */}
      <div className="mb-8 flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span>
            <strong className="text-foreground">{languages.length}</strong>{" "}
            languages
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 text-primary" />
          <span>
            <strong className="text-foreground">
              {totalPhrases.toLocaleString()}
            </strong>{" "}
            phrases
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {languages.map((l, index) => (
          <Link key={l.id} href={`/${l.isoCode}`} className="block">
            <article
              id={l.isoCode}
              className="group relative rounded-xl border-2 border-primary/15 bg-[var(--off-white)] shadow-card overflow-hidden transition-all duration-[var(--duration-hover)] ease-[var(--ease-smooth)] hover:shadow-card-hover hover:-translate-y-2 hover:border-primary/30 cursor-pointer animate-scale-up"
              style={{
                animationDelay: `${Math.min(index * 0.05, 0.5)}s`,
                animationFillMode: "backwards",
              }}
            >
              {/* Gradient accent bar on hover */}
              <div className="h-1 bg-gradient-to-r from-primary to-primary/70 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />

              {/* Shimmer effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-r from-transparent via-primary/5 to-transparent bg-[length:200%_100%] animate-shimmer" />

              <div className="p-5 relative">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {l.name}
                  </h2>
                  <ArrowRight className="w-4 h-4 text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquareText className="w-4 h-4 text-primary/60" />
                  <span>
                    <strong className="text-foreground font-medium">
                      {l._count.phrases}
                    </strong>{" "}
                    phrases
                  </span>
                </div>

                {/* ISO code badge */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-primary/10 text-primary uppercase tracking-wider">
                    {l.isoCode}
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {languages.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/5 flex items-center justify-center">
            <Globe className="w-8 h-8 text-primary/30" />
          </div>
          <h2 className="font-maragsa text-2xl text-foreground mb-2">
            No languages yet
          </h2>
          <p className="text-muted-foreground">
            Languages will appear here once they&apos;re added to the database.
          </p>
        </div>
      )}
    </main>
  );
}
