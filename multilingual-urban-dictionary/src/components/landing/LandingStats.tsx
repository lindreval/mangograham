"use client";

import { useEffect, useState } from "react";
import { Globe, MessageSquareText, FileText } from "lucide-react";
import type { Statistics } from "@/lib/stats";

interface Props {
  stats: Statistics;
}

export function LandingStats({ stats }: Props) {
  const [mounted, setMounted] = useState(false);
  const [countsAnimated, setCountsAnimated] = useState({
    languages: 0,
    phrases: 0,
    examples: 0,
  });

  useEffect(() => {
    setMounted(true);

    // Animate numbers counting up
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setCountsAnimated({
        languages: Math.floor(stats.languageCount * easeOutQuart),
        phrases: Math.floor(stats.phraseCount * easeOutQuart),
        examples: Math.floor(stats.exampleCount * easeOutQuart),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCountsAnimated({
          languages: stats.languageCount,
          phrases: stats.phraseCount,
          examples: stats.exampleCount,
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [stats]);

  const statCards = [
    {
      icon: Globe,
      count: countsAnimated.languages,
      label: "Languages",
      colorClass: "stat-gradient-1",
      delay: "0.2s",
    },
    {
      icon: MessageSquareText,
      count: countsAnimated.phrases,
      label: "Phrases",
      colorClass: "stat-gradient-2",
      delay: "0.4s",
    },
    {
      icon: FileText,
      count: countsAnimated.examples,
      label: "Examples",
      colorClass: "stat-gradient-3",
      delay: "0.6s",
    },
  ];

  return (
    <section className="relative px-4 mt-0">
      {/* Stats Grid */}
      <div className="max-w-3xl mx-auto grid grid-cols-3 gap-3 md:gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`stat-card group relative ${
              mounted ? "animate-scale-up" : "opacity-0"
            }`}
            style={{
              animationDelay: mounted ? card.delay : "0s",
              animationFillMode: "backwards",
            }}
          >
            {/* Card Background */}
            <div
              className="stat-card-bg relative rounded-lg shadow-md overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2"
            >
              {/* Gradient Accent Bar - Top */}
              <div
                className={`h-1 ${card.colorClass} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out`}
              ></div>

              {/* Shimmer Overlay on Hover */}
              <div className="shimmer-overlay absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

              {/* Card Content */}
              <div className="p-3 md:p-4">
                {/* Icon */}
                <div className="flex justify-center mb-2">
                  <div
                    className={`stat-icon w-8 h-8 md:w-10 md:h-10 rounded-md ${card.colorClass} flex items-center justify-center transform transition-all duration-500 group-hover:scale-[1.15] group-hover:rotate-12 shadow-sm group-hover:shadow-md`}
                  >
                    <card.icon className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-500 group-hover:scale-110" />
                  </div>
                </div>

                {/* Number */}
                <div className="text-center mb-1">
                  <div className="text-2xl md:text-3xl font-black bg-gradient-to-br from-primary via-primary to-primary/70 bg-clip-text text-transparent transition-all duration-500 group-hover:scale-110 group-hover:tracking-wide">
                    {card.count.toLocaleString()}
                  </div>
                </div>

                {/* Label */}
                <div className="text-center">
                  <div className="text-xs md:text-sm font-bold text-foreground">
                    {card.label}
                  </div>
                </div>
              </div>
            </div>

            {/* Shadow Layer for Depth */}
            <div className="absolute inset-0 -z-10 bg-white/10 rounded-lg transform translate-y-1 blur-sm"></div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

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

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .animate-scale-up {
          animation: scale-up 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-slide-up-fade {
          animation: slide-up-fade 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .stat-card-bg {
          background-color: var(--off-white);
        }

        .shimmer-overlay {
          background: linear-gradient(
            90deg,
            transparent 0%,
            oklch(from var(--primary) l c h / 0.03) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
        }

        .stat-icon :global(svg) {
          color: var(--off-white);
        }

        /* Unified green gradients for stat cards */
        :global(.stat-gradient-1) {
          background: linear-gradient(
            to bottom right,
            oklch(from var(--primary) calc(l * 1.1) c h),
            var(--primary)
          );
        }

        :global(.stat-gradient-2) {
          background: linear-gradient(
            to bottom right,
            var(--primary),
            oklch(from var(--primary) calc(l * 0.9) c h)
          );
        }

        :global(.stat-gradient-3) {
          background: linear-gradient(
            to bottom right,
            oklch(from var(--primary) calc(l * 1.05) calc(c * 1.1) h),
            oklch(from var(--primary) calc(l * 0.95) calc(c * 0.9) h)
          );
        }

        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </section>
  );
}
