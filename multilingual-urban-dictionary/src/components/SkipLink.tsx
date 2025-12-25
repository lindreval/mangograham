"use client";

import { useEffect } from "react";

/**
 * SkipLink Component
 *
 * Provides a keyboard-accessible "Skip to main content" link that allows
 * screen reader users and keyboard navigators to bypass repetitive navigation.
 *
 * Features:
 * - Hidden by default (sr-only)
 * - Visible on keyboard focus with beautiful focus state
 * - Smooth scroll to #main-content
 * - High z-index (z-50) to ensure visibility
 * - Follows WCAG 2.1 guidelines
 * - Uses app's green primary color for focus state
 */
export function SkipLink() {
  useEffect(() => {
    // Ensure smooth scroll behavior for skip link
    const skipLink = document.querySelector('a[href="#main-content"]');

    if (skipLink) {
      skipLink.addEventListener("click", (e) => {
        e.preventDefault();
        const mainContent = document.getElementById("main-content");

        if (mainContent) {
          // Smooth scroll to main content
          mainContent.scrollIntoView({ behavior: "smooth", block: "start" });

          // Set focus to main content for screen readers
          // Make it focusable temporarily if it's not already
          const originalTabIndex = mainContent.getAttribute("tabindex");
          mainContent.setAttribute("tabindex", "-1");
          mainContent.focus();

          // Restore original tabindex after focus
          if (originalTabIndex === null) {
            mainContent.removeAttribute("tabindex");
          } else {
            mainContent.setAttribute("tabindex", originalTabIndex);
          }
        }
      });
    }
  }, []);

  return (
    <a
      href="#main-content"
      className="
        sr-only
        focus:not-sr-only
        focus:fixed
        focus:top-4
        focus:left-4
        focus:z-50
        focus:px-6
        focus:py-3
        focus:bg-primary
        focus:text-primary-foreground
        focus:rounded-lg
        focus:font-medium
        focus:shadow-lg
        focus:outline-none
        focus:ring-4
        focus:ring-primary/30
        focus:ring-offset-2
        focus:ring-offset-background
        transition-all
        duration-200
        hover:focus:scale-105
        hover:focus:shadow-xl
      "
      style={{
        transitionTimingFunction: "var(--ease-smooth)",
      }}
    >
      Skip to main content
    </a>
  );
}
