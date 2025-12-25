"use client";

import { LandingHero } from "./LandingHero";
import { LandingStats } from "./LandingStats";
import { LandingStatsSkeleton } from "./LandingStatsSkeleton";
import { LandingStatsError } from "./LandingStatsError";
import { LandingCTA } from "./LandingCTA";
import { useEffect, useState } from "react";
import type { Statistics } from "@/lib/stats";

// Type-safe stats state
type StatsState =
  | { status: 'loading' }
  | { status: 'success'; data: Statistics }
  | { status: 'error'; error: string; canRetry: boolean };

export default function LandingPage() {
  const [statsState, setStatsState] = useState<StatsState>({ status: 'loading' });
  const [mounted, setMounted] = useState(false);

  // Fetch stats with comprehensive error handling
  const fetchStats = async () => {
    setStatsState({ status: 'loading' });

    try {
      const response = await fetch('/api/stats');

      // Check HTTP status
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Validate data structure
      if (
        !data ||
        typeof data.languageCount !== 'number' ||
        typeof data.phraseCount !== 'number' ||
        typeof data.exampleCount !== 'number'
      ) {
        throw new Error('Invalid statistics data received');
      }

      setStatsState({ status: 'success', data });
    } catch (error) {
      console.error('Stats fetch error:', error);
      setStatsState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to load statistics',
        canRetry: true,
      });
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, []);

  // "Hello" in different languages/scripts - only languages in database
  const floatingWords = [
    { text: "你好", delay: "2s", duration: "31s", x: "8%", y: "15%" },           // Chinese
    { text: "مرحبا", delay: "7s", duration: "27s", x: "88%", y: "22%" },         // Arabic
    { text: "こんにちは", delay: "1s", duration: "34s", x: "22%", y: "68%" },     // Japanese
    { text: "Привет", delay: "5s", duration: "29s", x: "72%", y: "8%" },        // Russian
    { text: "안녕", delay: "3s", duration: "32s", x: "45%", y: "38%" },           // Korean
    { text: "Hola", delay: "8s", duration: "28s", x: "35%", y: "82%" },         // Spanish
    { text: "नमस्ते", delay: "0s", duration: "30s", x: "62%", y: "52%" },        // Hindi
    { text: "สวัสดี", delay: "6s", duration: "33s", x: "18%", y: "42%" },        // Thai
    { text: "Γεια σου", delay: "4s", duration: "26s", x: "78%", y: "75%" },     // Greek
    { text: "Xin chào", delay: "9s", duration: "31s", x: "28%", y: "18%" },     // Vietnamese
    { text: "Olá", delay: "2s", duration: "29s", x: "92%", y: "58%" },          // Portuguese
    { text: "Hallo", delay: "7s", duration: "32s", x: "5%", y: "72%" },        // German
    { text: "Ciao", delay: "3s", duration: "27s", x: "52%", y: "12%" },         // Italian
    { text: "Bonjour", delay: "5s", duration: "30s", x: "68%", y: "88%" },      // French
    { text: "Halo", delay: "1s", duration: "28s", x: "12%", y: "28%" },         // Indonesian
    { text: "হ্যালো", delay: "8s", duration: "33s", x: "82%", y: "45%" },       // Bengali
    { text: "Kumusta", delay: "4s", duration: "31s", x: "42%", y: "95%" },      // Filipino
  ];

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden">
      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-primary via-primary to-primary/90 pointer-events-none"></div>

      {/* Floating Words Across Entire Page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingWords.map((item, i) => (
          <div
            key={i}
            className="floating-word absolute text-4xl md:text-6xl lg:text-7xl font-bold"
            style={{
              left: item.x,
              top: item.y,
              animationDelay: mounted ? item.delay : "0s",
              animationDuration: item.duration,
              color: "oklch(from var(--off-white) l c h / 0.04)"
            }}
          >
            {item.text}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 pt-8">
        {/* Hero + Search Section */}
        <LandingHero />

        {/* Stats Section with Loading/Error States */}
        <div className="pt-6 pb-4">
          {statsState.status === 'loading' && <LandingStatsSkeleton />}
          {statsState.status === 'success' && <LandingStats stats={statsState.data} />}
          {statsState.status === 'error' && (
            <LandingStatsError
              error={statsState.error}
              onRetry={fetchStats}
            />
          )}
        </div>

        {/* CTA Section */}
        <div className="pb-6">
          <LandingCTA />
        </div>
      </div>

      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/50 to-transparent pointer-events-none"></div>

      <style jsx>{`
        @keyframes floating {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(80px, -60px) rotate(5deg);
          }
          50% {
            transform: translate(120px, 20px) rotate(-3deg);
          }
          75% {
            transform: translate(-40px, 80px) rotate(8deg);
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
        }

        .floating-word {
          animation: floating var(--duration, 25s) infinite ease-in-out;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
