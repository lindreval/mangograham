"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function LandingStatsSkeleton() {
  const skeletonCards = [
    { delay: "0.2s" },
    { delay: "0.4s" },
    { delay: "0.6s" },
  ];

  return (
    <section className="relative px-4 mt-0">
      <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {skeletonCards.map((card, index) => (
          <div
            key={index}
            className="stat-card animate-scale-up opacity-0"
            style={{
              animationDelay: card.delay,
              animationFillMode: "forwards",
            }}
          >
            <div className="stat-card-bg rounded-lg p-3 md:p-4 relative overflow-hidden">
              {/* Shimmer overlay for loading effect */}
              <div className="shimmer-loading absolute inset-0 pointer-events-none"></div>

              {/* Icon skeleton */}
              <div className="flex justify-center mb-2">
                <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-md skeleton-pulse" />
              </div>

              {/* Number skeleton */}
              <div className="text-center mb-1">
                <Skeleton className="h-8 md:h-10 w-16 mx-auto skeleton-pulse" style={{ animationDelay: "0.1s" }} />
              </div>

              {/* Label skeleton */}
              <div className="text-center">
                <Skeleton className="h-4 w-20 mx-auto skeleton-pulse" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
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

        @keyframes shimmer-loading {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes skeleton-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-scale-up {
          animation: scale-up 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .stat-card-bg {
          background-color: var(--off-white);
        }

        .shimmer-loading {
          background: linear-gradient(
            90deg,
            transparent 0%,
            oklch(from var(--primary) l c h / 0.04) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer-loading 2s ease-in-out infinite;
        }

        :global(.skeleton-pulse) {
          animation: skeleton-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
