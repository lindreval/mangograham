"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  delay?: string;
  animateCount?: boolean;
  className?: string;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  delay = "0s",
  animateCount = false,
  className,
}: StatCardProps) {
  const [mounted, setMounted] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  const numericValue = typeof value === "number" ? value : parseInt(value, 10);
  const isNumeric = !isNaN(numericValue);

  useEffect(() => {
    setMounted(true);

    if (animateCount && isNumeric) {
      const duration = 1500;
      const steps = 40;
      const interval = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        setAnimatedValue(Math.floor(numericValue * easeOutQuart));

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedValue(numericValue);
        }
      }, interval);

      return () => clearInterval(timer);
    } else if (isNumeric) {
      setAnimatedValue(numericValue);
    }
  }, [animateCount, isNumeric, numericValue]);

  const displayValue = animateCount && isNumeric ? animatedValue : value;

  return (
    <div
      className={cn(
        "group relative",
        mounted ? "animate-scale-up" : "opacity-0",
        className
      )}
      style={{
        animationDelay: mounted ? delay : "0s",
        animationFillMode: "backwards",
      }}
    >
      {/* Card Background */}
      <div className="stat-card-bg relative rounded-xl shadow-card overflow-hidden transition-all duration-500 hover:shadow-card-hover hover:-translate-y-2">
        {/* Gradient Accent Bar - Top */}
        <div className="h-1 bg-gradient-to-r from-primary via-primary to-primary/70 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out" />

        {/* Shimmer Overlay on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-r from-transparent via-primary/5 to-transparent bg-[length:200%_100%] animate-shimmer" />

        {/* Card Content */}
        <div className="p-4 md:p-5">
          {/* Icon */}
          <div className="flex justify-center mb-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm group-hover:shadow-md">
              <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground transition-transform duration-500 group-hover:scale-110" />
            </div>
          </div>

          {/* Number */}
          <div className="text-center mb-1">
            <div className="text-2xl md:text-3xl font-black bg-gradient-to-br from-primary via-primary to-primary/70 bg-clip-text text-transparent transition-all duration-500 group-hover:scale-105 group-hover:tracking-wide tabular-nums">
              {typeof displayValue === "number"
                ? displayValue.toLocaleString()
                : displayValue}
            </div>
          </div>

          {/* Label */}
          <div className="text-center">
            <div className="text-xs md:text-sm font-bold text-foreground">
              {label}
            </div>
          </div>
        </div>
      </div>

      {/* Shadow Layer for Depth */}
      <div className="absolute inset-0 -z-10 bg-primary/5 rounded-xl transform translate-y-1 blur-sm" />
    </div>
  );
}
