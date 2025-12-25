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
  const [animatedCount, setAnimatedCount] = useState(0);
  const prevLengthRef = useRef(0);

  // Track which items are new and should animate
  useEffect(() => {
    const currentLength = children.length;
    const prevLength = prevLengthRef.current;

    if (currentLength > prevLength) {
      // New items added - animate them
      setAnimatedCount(prevLength);
      // After animation, mark all as animated
      const timeout = setTimeout(() => {
        setAnimatedCount(currentLength);
      }, (currentLength - prevLength) * staggerDelay + animationDuration);

      prevLengthRef.current = currentLength;
      return () => clearTimeout(timeout);
    } else if (currentLength < prevLength) {
      // Items removed - reset
      setAnimatedCount(currentLength);
      prevLengthRef.current = currentLength;
    }
  }, [children.length, staggerDelay, animationDuration]);

  // On initial mount, animate all items
  useEffect(() => {
    if (prevLengthRef.current === 0 && children.length > 0) {
      prevLengthRef.current = children.length;
      const timeout = setTimeout(() => {
        setAnimatedCount(children.length);
      }, children.length * staggerDelay + animationDuration);
      return () => clearTimeout(timeout);
    }
  }, [children.length, staggerDelay, animationDuration]);

  return (
    <>
      <Component className={className}>
        {children.map((child, index) => {
          const shouldAnimate = index >= animatedCount;
          const delay = shouldAnimate ? (index - animatedCount) * staggerDelay : 0;

          return (
            <div
              key={index}
              className={`staggered-item ${itemClassName}`}
              style={{
                animationDelay: shouldAnimate ? `${delay}ms` : "0ms",
                animationPlayState: shouldAnimate ? "running" : "paused",
                opacity: shouldAnimate ? 0 : 1,
              }}
            >
              {child}
            </div>
          );
        })}
      </Component>

      <style jsx>{`
        @keyframes stagger-fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .staggered-item {
          animation: stagger-fade-in ${animationDuration}ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </>
  );
}
