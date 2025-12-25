"use client"

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { AchievementNotificationService } from '@/lib/achievementNotificationService';

// Global state to track if user has performed actions that might trigger achievements
let hasRecentActivity = false;
let activityTimeout: NodeJS.Timeout | null = null;
let pollPromise: Promise<void> | null = null;

// Session storage keys
const LAST_POLL_KEY = 'achievement_last_poll';
const POLL_COOLDOWN_MS = 120000; // Only poll once per 2 minutes across page navigations

// Export function to trigger achievement polling when user performs actions
export function triggerAchievementPolling() {
  hasRecentActivity = true;

  // Clear existing timeout
  if (activityTimeout) {
    clearTimeout(activityTimeout);
  }

  // Stop polling after 20 seconds of no activity
  activityTimeout = setTimeout(() => {
    hasRecentActivity = false;
  }, 20000);
}

export function useAchievementPolling() {
  const { data: session, status } = useSession();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const hasPolledRef = useRef(false);

  const pollAchievements = useCallback(async () => {
    // Prevent concurrent polls
    if (pollPromise) return;

    pollPromise = (async () => {
      try {
        const response = await fetch('/api/achievements/poll');
        if (response.ok) {
          const data = await response.json();
          if (data.achievements && data.achievements.length > 0) {
            AchievementNotificationService.handleServerActionAchievements(data.achievements);
          }
        }
        // Update last poll time
        sessionStorage.setItem(LAST_POLL_KEY, Date.now().toString());
      } catch (error) {
        console.error('Achievement polling failed:', error);
      } finally {
        pollPromise = null;
      }
    })();

    return pollPromise;
  }, []);

  useEffect(() => {
    // Don't do anything while session is loading
    if (status === 'loading') return;

    if (!session?.user) {
      // Clear polling if user logs out
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
      hasRecentActivity = false;
      hasPolledRef.current = false;
      return;
    }

    // Check if we recently polled (within cooldown period)
    const lastPoll = sessionStorage.getItem(LAST_POLL_KEY);
    const now = Date.now();
    if (lastPoll && now - parseInt(lastPoll) < POLL_COOLDOWN_MS && !hasRecentActivity) {
      // Skip polling - already polled recently and no new activity
      return;
    }

    // Only start polling if there's been recent activity that might trigger achievements
    if (hasRecentActivity && !hasPolledRef.current) {
      hasPolledRef.current = true;

      // Single poll after a delay (most achievements are awarded inline via server actions)
      // This is just a backup for edge cases
      pollingRef.current = setTimeout(() => {
        pollAchievements();
      }, 3000);
    }

    // Cleanup on unmount
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [session?.user, status, pollAchievements]);

  return null;
}