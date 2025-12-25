"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoSectionProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  id?: string;
  delay?: string;
}

export function InfoSection({
  title,
  icon: Icon,
  children,
  className,
  id,
  delay = "0s",
}: InfoSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 transition-all duration-500",
        !mounted && "opacity-0 translate-y-4",
        mounted && "opacity-100 translate-y-0",
        className
      )}
      style={{ transitionDelay: delay }}
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
        <h2 className="text-xl md:text-2xl font-semibold text-foreground">
          {title}
        </h2>
      </div>

      {/* Section Content */}
      <div className="text-card-foreground/80 leading-relaxed space-y-4 pl-0 md:pl-11">
        {children}
      </div>
    </section>
  );
}

// Numbered section variant for legal pages
interface NumberedSectionProps {
  number: number;
  title: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  delay?: string;
}

export function NumberedSection({
  number,
  title,
  children,
  className,
  id,
  delay = "0s",
}: NumberedSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 transition-all duration-500",
        !mounted && "opacity-0 translate-y-4",
        mounted && "opacity-100 translate-y-0",
        className
      )}
      style={{ transitionDelay: delay }}
    >
      {/* Section Header with Number Badge */}
      <div className="flex items-start gap-4 mb-4">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
          {number}
        </span>
        <h2 className="text-xl md:text-2xl font-semibold text-foreground pt-0.5">
          {title}
        </h2>
      </div>

      {/* Section Content */}
      <div className="text-card-foreground/80 leading-relaxed space-y-4 pl-12">
        {children}
      </div>
    </section>
  );
}

// List styling helper for legal content
interface InfoListProps {
  items: string[];
  type?: "bullet" | "check" | "number";
  className?: string;
}

export function InfoList({ items, type = "bullet", className }: InfoListProps) {
  const listClass = cn("space-y-2", className);

  if (type === "number") {
    return (
      <ol className={cn(listClass, "list-decimal list-inside")}>
        {items.map((item, index) => (
          <li key={index} className="text-card-foreground/80">
            {item}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ul className={listClass}>
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className="flex-shrink-0 mt-2">
            {type === "check" ? (
              <span className="w-1.5 h-1.5 rounded-full bg-primary block" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 block" />
            )}
          </span>
          <span className="text-card-foreground/80">{item}</span>
        </li>
      ))}
    </ul>
  );
}
