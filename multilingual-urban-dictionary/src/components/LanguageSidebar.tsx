"use client";

import Link from "next/link";
import type { Language } from "@prisma/client";
import { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";

interface Props {
  languages: Language[];
}

export default function LanguageSidebar({ languages }: Props) {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);

  return (
    <>
      {/* Mobile Language Selector */}
      <div className="md:hidden mb-4">
        <div className="sidebar-card group relative rounded-xl overflow-hidden bg-card shadow-lg">
          {/* Gradient accent bar */}
          <div className={`sidebar-accent h-1 bg-gradient-to-r from-primary via-primary/90 to-primary transform origin-left transition-all duration-500 ${
            isMobileExpanded ? 'scale-x-100' : 'scale-x-0'
          }`}></div>

          {/* Shimmer overlay */}
          <div className="sidebar-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700"></div>

          <button
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="w-full flex items-center justify-between p-3 text-left font-semibold relative z-10 transition-all duration-300 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-xl"
            aria-expanded={isMobileExpanded}
            aria-controls="mobile-language-list"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <Link
                href={`/languages`}
                className="font-semibold bg-gradient-to-br from-primary via-primary to-primary/80 bg-clip-text text-transparent hover:tracking-wide transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                Languages
              </Link>
            </div>
            <ChevronDown className={`h-4 w-4 text-primary transition-all duration-500 ${
              isMobileExpanded ? 'rotate-180 scale-110' : 'rotate-0'
            }`} />
          </button>

          <div className={`overflow-hidden transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
            isMobileExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="border-t border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
              <div className="max-h-[500px] overflow-y-auto px-3 pb-3 scrollbar-thin">
                <ul id="mobile-language-list" className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2">
                {languages.map((lang, index) => (
                  <li
                    key={lang.id}
                    className="lang-item"
                    style={{
                      animationDelay: isMobileExpanded ? `${index * 30}ms` : '0ms'
                    }}
                  >
                    <Link
                      href={`/${lang.isoCode}`}
                      className="block py-1.5 px-2 rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:translate-x-1 relative overflow-hidden group/link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                      onClick={() => setIsMobileExpanded(false)}
                    >
                      <span className="relative z-10">{lang.name}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover/link:translate-x-[100%] transition-transform duration-700"></div>
                    </Link>
                  </li>
                ))}
              </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden w-48 shrink-0 md:block">
        <div className="sidebar-card group relative rounded-xl overflow-hidden bg-card shadow-lg sticky top-20">
          {/* Gradient accent bar */}
          <div className={`sidebar-accent h-1 bg-gradient-to-r from-primary via-primary/90 to-primary transform origin-left transition-all duration-500 ${
            isDesktopExpanded ? 'scale-x-100' : 'scale-x-0'
          }`}></div>

          {/* Shimmer overlay */}
          <div className="sidebar-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700"></div>

          <button
            onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
            className="w-full flex items-center justify-between p-4 text-left relative z-10 transition-all duration-300 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-xl"
            aria-expanded={isDesktopExpanded}
            aria-controls="desktop-language-list"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <Link
                href={`/languages`}
                className="font-semibold bg-gradient-to-br from-primary via-primary to-primary/80 bg-clip-text text-transparent hover:tracking-wide transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                Languages
              </Link>
            </div>
            <ChevronDown className={`h-4 w-4 text-primary transition-all duration-500 ${
              isDesktopExpanded ? 'rotate-180 scale-110' : 'rotate-0'
            }`} />
          </button>

          <div className={`overflow-hidden transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
            isDesktopExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="border-t border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
              <div className="max-h-[500px] overflow-y-auto px-4 pb-4 scrollbar-thin">
                <ul id="desktop-language-list" className="space-y-0.5 text-sm mt-2">
                {languages.map((lang, index) => (
                  <li
                    key={lang.id}
                    className="lang-item"
                    style={{
                      animationDelay: isDesktopExpanded ? `${index * 30}ms` : '0ms'
                    }}
                  >
                    <Link
                      href={`/${lang.isoCode}`}
                      className="block py-1.5 px-2 rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:translate-x-1 relative overflow-hidden group/link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                    >
                      <span className="relative z-10">{lang.name}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover/link:translate-x-[100%] transition-transform duration-700"></div>
                    </Link>
                  </li>
                ))}
              </ul>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <style jsx>{`
        @keyframes lang-fade-in {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .lang-item {
          animation: lang-fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .sidebar-card {
          border: 2px solid oklch(from var(--primary) l c h / 0.15);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sidebar-card:hover {
          border-color: oklch(from var(--primary) l c h / 0.3);
          box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.08),
            0 0 0 1px oklch(from var(--primary) l c h / 0.1);
        }

        .sidebar-accent {
          background: linear-gradient(
            90deg,
            oklch(from var(--primary) calc(l * 1.1) c h),
            var(--primary),
            oklch(from var(--primary) calc(l * 0.9) c h)
          );
        }

        .sidebar-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            oklch(from var(--primary) l c h / 0.03) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        /* Custom scrollbar styling */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: oklch(from var(--primary) l c h / 0.3) transparent;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: oklch(from var(--primary) l c h / 0.3);
          border-radius: 3px;
          transition: background-color 0.3s;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: oklch(from var(--primary) l c h / 0.5);
        }
      `}</style>
    </>
  );
}