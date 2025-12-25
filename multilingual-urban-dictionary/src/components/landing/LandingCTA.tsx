"use client";

import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export function LandingCTA() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative px-4 mt-12">
      <div className="max-w-4xl mx-auto text-center">
        {/* Get Started Button */}
        <div
          className={`${mounted ? "animate-scale-up" : "opacity-0"}`}
          style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
        >
          <button
            onClick={() => signIn("google", { callbackUrl: "/home" })}
            className="cta-button group relative inline-flex items-center gap-3 px-10 py-5 text-lg md:text-xl font-bold text-primary rounded-xl shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 active:scale-95 overflow-hidden"
          >
            {/* Animated gradient background on hover */}
            <div className="cta-gradient absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Shimmer effect */}
            <div className="cta-shimmer absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <span className="relative z-10">Get Started</span>
            <ArrowRight className="relative z-10 w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-up {
          animation: scale-up 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cta-button {
          background-color: var(--off-white);
        }

        .cta-gradient {
          background: linear-gradient(
            to right,
            var(--off-white),
            oklch(from var(--accent) l c h / 0.1),
            var(--off-white)
          );
        }

        .cta-shimmer {
          background: linear-gradient(
            to right,
            transparent,
            oklch(from var(--off-white) l c h / 0.3),
            transparent
          );
        }

        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 10px 30px -10px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </section>
  );
}
