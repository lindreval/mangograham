"use client";

import SearchPreview from "@/components/SearchPreview";
import { useState, useEffect } from "react";

export function LandingHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center px-4 pt-12 pb-16">
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-noise"></div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Main Title with staggered animation */}
        <h1
          className={`font-maragsa text-7xl md:text-8xl lg:text-9xl mb-6 leading-[0.9] tracking-tight ${
            mounted ? "animate-slide-up-fade" : "opacity-0"
          }`}
          style={{
            animationDelay: "0.1s",
            animationFillMode: "backwards",
            color: "var(--off-white)"
          }}
        >
          Yung Salita
        </h1>

        {/* Tagline */}
        <p
          className={`text-2xl md:text-3xl lg:text-4xl font-sans font-light mb-8 tracking-wide ${
            mounted ? "animate-slide-up-fade" : "opacity-0"
          }`}
          style={{
            animationDelay: "0.3s",
            animationFillMode: "backwards",
            color: "oklch(from var(--off-white) l c h / 0.9)"
          }}
        >
          The Global Urban Dictionary
        </p>

        {/* Search Bar */}
        <div
          className={`landing-search-wrapper max-w-2xl mx-auto ${
            mounted ? "animate-slide-up-fade" : "opacity-0"
          }`}
          style={{ animationDelay: "0.5s", animationFillMode: "backwards" }}
        >
          <SearchPreview defaultValue="" />
        </div>

      </div>

      <style jsx global>{`
        @keyframes slide-up-fade {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up-fade {
          animation: slide-up-fade 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Landing page search preview styling */
        .landing-search-wrapper {
          position: relative;
        }

        .landing-search-wrapper form > div {
          position: relative;
          background-color: oklch(from var(--off-white) l c h / 0.95);
          backdrop-filter: blur(12px);
          border-radius: 0.75rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 2px solid oklch(from var(--off-white) l c h / 0.5);
          transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0.5rem;
        }

        .landing-search-wrapper form > div:hover {
          border-color: var(--off-white);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
        }

        .landing-search-wrapper form > div:focus-within {
          border-color: var(--off-white);
          box-shadow:
            0 30px 60px -12px rgba(0, 0, 0, 0.4),
            0 0 0 4px oklch(from var(--off-white) l c h / 0.25),
            0 0 40px oklch(from var(--off-white) l c h / 0.15);
          transform: translateY(-2px);
        }

        .landing-search-wrapper input[type="search"] {
          height: 3.5rem;
          font-size: 1.125rem;
          padding-left: 1.5rem;
          padding-right: 3rem;
          background: transparent;
          border: none;
        }

        .landing-search-wrapper input[type="search"]::placeholder {
          color: oklch(from var(--primary) l c h / 0.5);
        }

        .landing-search-wrapper button[type="submit"] {
          position: absolute;
          right: 0.75rem;
          height: 2.5rem;
          width: 2.5rem;
          padding: 0;
          background-color: var(--primary);
          border-radius: 0.5rem;
          transition: all 300ms;
        }

        .landing-search-wrapper button[type="submit"]:hover {
          background-color: oklch(from var(--primary) calc(l * 0.9) c h);
          transform: scale(1.05);
        }

        .landing-search-wrapper button[type="submit"] svg {
          color: var(--off-white);
          width: 1.25rem;
          height: 1.25rem;
        }

        /* Dropdown styling for landing page */
        .landing-search-wrapper > div > div:last-child {
          background-color: var(--off-white);
          border: 2px solid oklch(from var(--off-white) calc(l * 0.92) c h);
          margin-top: 0.75rem;
          box-shadow:
            0 20px 40px -12px rgba(0, 0, 0, 0.3),
            0 0 0 1px oklch(from var(--off-white) calc(l * 0.95) c h);
          border-radius: 0.625rem;
          backdrop-filter: blur(8px);
        }

        .landing-search-wrapper > div > div:last-child a {
          transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 0.375rem;
        }

        .landing-search-wrapper > div > div:last-child a:hover {
          background-color: oklch(from var(--primary) l c h / 0.12);
          transform: translateX(4px);
        }

        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>
    </section>
  );
}
