// Component that automatically checks for new achievements and shows notifications
"use client"

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { AchievementNotificationService } from '@/lib/achievementNotificationService';
import { useAchievementPolling } from '@/hooks/useAchievementPolling';

// Session storage keys
const RETURN_VISIT_CHECKED_KEY = 'achievement_return_visit_checked';
const STORED_NOTIF_CHECKED_KEY = 'achievement_stored_notif_checked';

async function checkWelcomeBackAchievement(userId: string) {
  // Only check once per browser session
  if (sessionStorage.getItem(RETURN_VISIT_CHECKED_KEY)) {
    return;
  }

  try {
    const response = await fetch('/api/achievements/check-return-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    // Mark as checked regardless of result
    sessionStorage.setItem(RETURN_VISIT_CHECKED_KEY, 'true');

    if (response.ok) {
      const data = await response.json();
      if (data.achievements && data.achievements.length > 0) {
        AchievementNotificationService.handleServerActionAchievements(data.achievements);
      }
    }
  } catch (error) {
    console.error('Failed to check welcome back achievement:', error);
  }
}

export function AchievementChecker() {
  const { data: session, status } = useSession();
  const hasCheckedRef = useRef(false);

  // Start background achievement polling (only when there's activity)
  useAchievementPolling();

  // Check for stored notifications once per session (not on every page)
  useEffect(() => {
    // Skip if already checked this session
    if (sessionStorage.getItem(STORED_NOTIF_CHECKED_KEY)) {
      return;
    }

    // Defer to avoid blocking initial render
    const timeoutId = setTimeout(() => {
      AchievementNotificationService.checkForStoredNotifications();
      sessionStorage.setItem(STORED_NOTIF_CHECKED_KEY, 'true');
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Check welcome back achievement when user logs in
  useEffect(() => {
    // Wait for session to be loaded
    if (status === 'loading') return;

    if (session?.user && !hasCheckedRef.current) {
      hasCheckedRef.current = true;

      // Use requestIdleCallback to defer non-critical network request
      const checkAchievements = () => {
        checkWelcomeBackAchievement(session.user.id);
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(checkAchievements, { timeout: 5000 });
      } else {
        // Fallback with longer delay - not critical for page function
        setTimeout(checkAchievements, 3000);
      }
    }
  }, [session?.user, status]);

  return null; // This component doesn't render anything
}