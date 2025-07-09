"use client";

import Link from "next/link";
import type { Language } from "@prisma/client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  languages: Language[];
}

export default function LanguageSidebar({ languages }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Mobile Language Selector */}
      <div className="md:hidden mb-4">
        <div className="rounded-lg border-4 bg-card text-card-foreground shadow-elevation-medium">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-4 text-left font-semibold hover:bg-card/80 transition-colors"
          >
            <Link
              href={`/languages`}
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Languages
            </Link>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="border-t border-border px-4 pb-4">
              <ul className="space-y-2 text-sm mt-2">
                {languages.map((lang) => (
                  <li key={lang.id}>
                    <Link
                      href={`/${lang.isoCode}`}
                      className="block hover:underline py-1"
                      onClick={() => setIsExpanded(false)}
                    >
                      {lang.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden w-48 shrink-0 md:block">
        <div className="sticky top-18 rounded-lg border-4 bg-card text-card-foreground p-4 shadow-elevation-medium">
          <h2 className="mb-2 font-semibold">
            <Link
                  href={`/languages`}
                  className="hover:underline"
                >
                  Languages
            </Link>
          </h2>
          <ul className="space-y-1 text-sm">
            {languages.map((lang) => (
              <li key={lang.id}>
                <Link
                  href={`/${lang.isoCode}`}
                  className="hover:underline"
                >
                  {lang.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}