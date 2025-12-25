"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PageCardProps {
  children: React.ReactNode;
  showAccent?: boolean;
  className?: string;
  animate?: boolean;
  delay?: string;
}

export function PageCard({
  children,
  showAccent = true,
  className,
  animate = true,
  delay = "0s",
}: PageCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (animate) {
      setMounted(true);
    }
  }, [animate]);

  return (
    <div
      className={cn(
        "relative rounded-[20px] border-2 border-primary/20 bg-card shadow-card overflow-hidden",
        "transition-all duration-500",
        animate && !mounted && "opacity-0 translate-y-4",
        animate && mounted && "opacity-100 translate-y-0",
        className
      )}
      style={{
        transitionDelay: animate ? delay : "0s",
      }}
    >
      {/* Gradient Accent Bar */}
      {showAccent && (
        <div className="h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />
      )}

      {/* Content */}
      <div className="p-6 md:p-8">{children}</div>
    </div>
  );
}

// Variant for interactive cards (like language cards, contributor cards)
interface InteractiveCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  delay?: string;
}

export function InteractiveCard({
  children,
  onClick,
  href,
  className,
  delay = "0s",
}: InteractiveCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cardClasses = cn(
    "group relative rounded-xl border-2 border-primary/15 bg-[var(--off-white)] shadow-card overflow-hidden",
    "transition-all duration-[var(--duration-hover)] ease-[var(--ease-smooth)]",
    "hover:shadow-card-hover hover:-translate-y-2 hover:border-primary/30",
    "cursor-pointer",
    !mounted && "opacity-0 translate-y-4",
    mounted && "opacity-100 translate-y-0",
    className
  );

  const content = (
    <>
      {/* Gradient Accent Bar - appears on hover */}
      <div className="h-1 bg-gradient-to-r from-primary to-primary/70 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-r from-transparent via-primary/5 to-transparent bg-[length:200%_100%] animate-shimmer" />

      {/* Content */}
      <div className="relative">{children}</div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={cardClasses}
        style={{ transitionDelay: delay }}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cardClasses}
      style={{ transitionDelay: delay }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {content}
    </div>
  );
}
