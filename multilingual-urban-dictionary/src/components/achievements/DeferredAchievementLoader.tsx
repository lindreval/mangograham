// Completely defers achievement system loading until after page is idle
// This ensures ZERO achievement code runs during initial page load
"use client"

import { useEffect, useState } from 'react';

// Dynamically import the actual checker only when needed
const loadAchievementChecker = () =>
  import('./AchievementChecker').then(mod => mod.AchievementChecker);

export function DeferredAchievementLoader() {
  const [AchievementChecker, setAchievementChecker] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    // Don't do anything until the page is fully loaded
    const loadWhenReady = () => {
      // Use requestIdleCallback to load during browser idle time
      // This ensures we don't compete with critical page resources
      const load = () => {
        loadAchievementChecker().then(Component => {
          setAchievementChecker(() => Component);
        }).catch(err => {
          console.error('Failed to load achievement system:', err);
        });
      };

      if ('requestIdleCallback' in window) {
        // Load during idle time with a 10 second timeout
        requestIdleCallback(load, { timeout: 10000 });
      } else {
        // Fallback: load after 5 seconds
        setTimeout(load, 5000);
      }
    };

    // Wait for window.onload to fire first
    if (document.readyState === 'complete') {
      // Page already loaded, defer to next idle period
      loadWhenReady();
    } else {
      window.addEventListener('load', loadWhenReady, { once: true });
      return () => window.removeEventListener('load', loadWhenReady);
    }
  }, []);

  // Render nothing until the component is loaded
  if (!AchievementChecker) {
    return null;
  }

  return <AchievementChecker />;
}
