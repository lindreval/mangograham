"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  action,
  className,
}: PageHeaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className={cn("mb-8 md:mb-10", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          {/* Badge */}
          {badge && (
            <div
              className={cn(
                "transition-all duration-500",
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              )}
              style={{ transitionDelay: "0.1s" }}
            >
              {badge}
            </div>
          )}

          {/* Title */}
          <h1
            className={cn(
              "font-maragsa text-4xl md:text-5xl lg:text-6xl text-foreground tracking-tight",
              "transition-all duration-500",
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: "0.2s" }}
          >
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p
              className={cn(
                "text-base md:text-lg text-muted-foreground/80 max-w-2xl",
                "transition-all duration-500",
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              )}
              style={{ transitionDelay: "0.3s" }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Action */}
        {action && (
          <div
            className={cn(
              "flex-shrink-0",
              "transition-all duration-500",
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            )}
            style={{ transitionDelay: "0.4s" }}
          >
            {action}
          </div>
        )}
      </div>
    </header>
  );
}

// Pre-styled badge component for consistent use
interface PageBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "admin" | "success";
}

export function PageBadge({ children, variant = "default" }: PageBadgeProps) {
  const variants = {
    default:
      "bg-primary/10 text-primary border-primary/20",
    admin:
      "bg-destructive/10 text-destructive border-destructive/20",
    success:
      "bg-primary/15 text-primary border-primary/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border",
        variants[variant]
      )}
    >
      {children}
    </span>
  );
}
