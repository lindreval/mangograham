"use client";

import Link from "next/link";
import type { Language } from "@prisma/client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  languages: Language[];
}

export default function LanguageSidebar({ languages }: Props) {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true); // Open by default

  return (
    <>
      {/* Mobile Language Selector - Above content */}
      <div className="md:hidden mb-4">
        <div className="rounded-lg border-4 bg-card text-card-foreground shadow-elevation-medium">
          <button
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="w-full flex items-center justify-between p-3 text-left font-semibold hover:bg-card/80 transition-colors"
          >
            <Link
              href={`/languages`}
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Languages
            </Link>
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ease-in-out ${
              isMobileExpanded ? 'rotate-180' : 'rotate-0'
            }`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="border-t border-border px-3 pb-3">
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2">
                {languages.map((lang) => (
                  <li key={lang.id}>
                    <Link
                      href={`/${lang.isoCode}`}
                      className="block hover:underline hover:text-primary py-1 transition-colors"
                      onClick={() => setIsMobileExpanded(false)}
                    >
                      {lang.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden w-48 shrink-0 md:block">
        <div className="rounded-lg border-4 bg-card text-card-foreground shadow-elevation-medium">
          <button
            onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
            className="w-full flex items-center justify-between p-4 text-left font-semibold hover:bg-card/80 transition-colors"
          >
            <Link
              href={`/languages`}
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Languages
            </Link>
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ease-in-out ${
              isDesktopExpanded ? 'rotate-180' : 'rotate-0'
            }`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isDesktopExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="border-t border-border px-4 pb-4">
              <ul className="space-y-1 text-sm mt-2">
                {languages.map((lang) => (
                  <li key={lang.id}>
                    <Link
                      href={`/${lang.isoCode}`}
                      className="hover:underline hover:text-primary block transition-colors"
                    >
                      {lang.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}