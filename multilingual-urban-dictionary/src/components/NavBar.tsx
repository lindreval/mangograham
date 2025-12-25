"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import AuthButton from "@/components/AuthButton";
import SubmitButton from "@/components/SubmitButton";
import SearchPreview from "@/components/SearchPreview";
export default function NavBar() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";

  return (
    <header className="navbar-wrapper sticky top-0 z-30 w-full">
      {/* Gradient accent line */}
      <div className="navbar-accent-line h-1 w-full bg-gradient-to-r from-primary via-primary/80 to-primary"></div>

      <div className="navbar-container backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="mx-auto flex h-14 md:h-16 max-w-6xl items-center gap-2 md:gap-4 px-3 md:px-4">
          {/* Site logo / brand */}
          <Link
            href="/"
            className="navbar-logo flex items-center gap-1 md:gap-2 font-semibold shrink-0 group"
          >
            <div className="relative">
              <Image
                src="/yungsalita.png"
                alt="Yung Salita"
                width={32}
                height={32}
                priority
                className="navbar-logo-img rounded w-6 h-6 md:w-8 md:h-8 transition-all duration-300"
              />
              {/* Shimmer ring on hover */}
              <div className="navbar-logo-ring absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="hidden sm:block font-maragsa text-lg md:text-xl bg-gradient-to-br from-primary via-primary to-primary/80 bg-clip-text text-transparent">
              Yung Salita
            </span>
          </Link>

          {/* Search box with live preview */}
          <SearchPreview defaultValue={q} />

          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            <SubmitButton />
            <AuthButton />
          </div>
        </div>
      </div>

      <style jsx>{`
        .navbar-wrapper {
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.05),
            0 0 0 1px oklch(from var(--primary) l c h / 0.08);
        }

        .navbar-accent-line {
          background: linear-gradient(
            90deg,
            oklch(from var(--primary) calc(l * 1.1) c h) 0%,
            var(--primary) 50%,
            oklch(from var(--primary) calc(l * 1.1) c h) 100%
          );
          background-size: 200% 100%;
          animation: accent-shimmer 8s ease-in-out infinite;
        }

        @keyframes accent-shimmer {
          0%, 100% {
            background-position: 0% center;
          }
          50% {
            background-position: 100% center;
          }
        }

        .navbar-logo-img {
          filter: drop-shadow(0 2px 4px oklch(from var(--primary) l c h / 0.1));
        }

        .navbar-logo:hover .navbar-logo-img {
          transform: translateY(-1px) scale(1.05);
          filter: drop-shadow(0 4px 8px oklch(from var(--primary) l c h / 0.2));
        }

        .navbar-logo-ring {
          background: conic-gradient(
            from 0deg,
            oklch(from var(--primary) l c h / 0.3),
            oklch(from var(--primary) l c h / 0),
            oklch(from var(--primary) l c h / 0.3)
          );
          animation: ring-spin 3s linear infinite;
          filter: blur(4px);
        }

        @keyframes ring-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </header>
  );
}
