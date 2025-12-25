"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface StaggeredListProps {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
  staggerDelay?: number; // ms between each item
  animationDuration?: number; // ms for the animation
  as?: "div" | "ul" | "section";
}

export default function StaggeredList({
  children,
  className = "",
  itemClassName = "",
  staggerDelay = 50,
  animationDuration = 400,
  as: Component = "div",
}: StaggeredListProps) {
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const prevLengthRef = useRef(0);

  // Trigger mount animation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate items in sequence
  useEffect(() => {
    if (!mounted) return;

    const currentLength = children.length;
    const prevLength = prevLengthRef.current;

    // New items added or initial load
    if (currentLength > prevLength) {
      // Stagger the visibility of new items
      let count = prevLength;
      const interval = setInterval(() => {
        count++;
        setVisibleCount(count);
        if (count >= currentLength) {
          clearInterval(interval);
        }
      }, staggerDelay);

      prevLengthRef.current = currentLength;
      return () => clearInterval(interval);
    } else if (currentLength < prevLength) {
      // Items removed
      setVisibleCount(currentLength);
      prevLengthRef.current = currentLength;
    }
  }, [mounted, children.length, staggerDelay]);

  return (
    <Component className={className}>
      {children.map((child, index) => {
        const isVisible = mounted && index < visibleCount;

        return (
          <div
            key={index}
            className={itemClassName}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(8px)",
              transition: `opacity ${animationDuration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${animationDuration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
            }}
          >
            {child}
          </div>
        );
      })}
    </Component>
  );
}
