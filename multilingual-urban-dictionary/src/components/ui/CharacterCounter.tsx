"use client";

import { useMemo } from "react";
import { Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
  showIcon?: boolean;
}

export function CharacterCounter({
  current,
  max,
  className,
  showIcon = true,
}: CharacterCounterProps) {
  // Calculate percentage and states
  const percentage = (current / max) * 100;
  const isValid = current <= max && current > 0;
  const isApproaching = percentage >= 80 && percentage < 100;
  const isExceeding = percentage >= 100;
  const isNearPerfect = percentage >= 60 && percentage < 80;

  // Color states with smooth transitions
  const colorClass = useMemo(() => {
    if (isExceeding) return "text-destructive";
    if (isApproaching) return "text-amber-600 dark:text-amber-400";
    if (isNearPerfect) return "text-primary";
    return "text-muted-foreground";
  }, [isExceeding, isApproaching, isNearPerfect]);

  // Icon component based on state
  const Icon = useMemo(() => {
    if (!showIcon || current === 0) return null;
    if (isExceeding) {
      return <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />;
    }
    if (isValid && percentage >= 20) {
      return (
        <Check
          className={cn(
            "w-3.5 h-3.5 transition-all duration-300",
            isNearPerfect && "scale-110"
          )}
        />
      );
    }
    return null;
  }, [showIcon, current, isExceeding, isValid, percentage, isNearPerfect]);

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium transition-all duration-[var(--duration-hover)] ease-[var(--ease-smooth)]",
        colorClass,
        className
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {Icon}
      <span
        className={cn(
          "tabular-nums transition-all duration-[var(--duration-hover)] ease-[var(--ease-smooth)]",
          isExceeding && "font-bold"
        )}
      >
        {current.toLocaleString()}
      </span>
      <span className="opacity-50">/</span>
      <span className="tabular-nums opacity-70">{max.toLocaleString()}</span>

      {/* Visual progress indicator */}
      {current > 0 && (
        <div
          className={cn(
            "ml-1 h-1 w-12 rounded-full bg-muted overflow-hidden transition-opacity duration-300",
            current === 0 && "opacity-0"
          )}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-[var(--ease-smooth)]",
              isExceeding && "bg-destructive",
              isApproaching && !isExceeding && "bg-amber-500",
              isNearPerfect && "bg-primary",
              !isApproaching && !isExceeding && !isNearPerfect && "bg-muted-foreground"
            )}
            style={{
              width: `${Math.min(percentage, 100)}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

interface CharacterCounterWrapperProps {
  children: React.ReactNode;
  current: number;
  max: number;
  showIcon?: boolean;
  className?: string;
}

/**
 * Wrapper component that positions the character counter
 * relative to the input field
 */
export function CharacterCounterWrapper({
  children,
  current,
  max,
  showIcon = true,
  className,
}: CharacterCounterWrapperProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <div className="flex justify-end mt-1.5">
        <CharacterCounter current={current} max={max} showIcon={showIcon} />
      </div>
    </div>
  );
}
