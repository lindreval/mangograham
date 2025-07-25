"use client"

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { AchievementNotificationService } from '@/lib/achievementNotificationService';

// Global state to track if user has performed actions that might trigger achievements
let hasRecentActivity = false;
let activityTimeout: NodeJS.Timeout | null = null;

// Export function to trigger achievement polling when user performs actions
export function triggerAchievementPolling() {
  hasRecentActivity = true;
  
  // Clear existing timeout
  if (activityTimeout) {
    clearTimeout(activityTimeout);
  }
  
  // Stop polling after 30 seconds of no activity
  activityTimeout = setTimeout(() => {
    hasRecentActivity = false;
  }, 30000);
}

export function useAchievementPolling() {
  const { data: session } = useSession();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const pollCountRef = useRef(0);

  useEffect(() => {
    if (!session?.user) {
      // Clear polling if user logs out
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      hasRecentActivity = false;
      return;
    }

    const pollAchievements = async () => {
      // Only poll if there's been recent activity or it's been less than 5 polls
      if (!hasRecentActivity && pollCountRef.current > 5) {
        return;
      }

      pollCountRef.current++;

      try {
        const response = await fetch('/api/achievements/poll');
        if (response.ok) {
          const data = await response.json();
          if (data.achievements && data.achievements.length > 0) {
            AchievementNotificationService.handleServerActionAchievements(data.achievements);
            // Reset poll count when achievements are found
            pollCountRef.current = 0;
          }
        }
      } catch (error) {
        console.error('Achievement polling failed:', error);
      }
    };

    // Start smart polling - more frequent initially, then less frequent
    let pollInterval = 1000; // Start with 1 second
    
    const smartPoll = () => {
      pollAchievements();
      
      // Increase interval gradually: 1s -> 2s -> 5s -> 10s -> stop
      if (pollInterval < 10000) {
        pollInterval = Math.min(pollInterval * 2, 10000);
      }
      
      pollingRef.current = setTimeout(smartPoll, pollInterval);
    };

    // Initial poll after small delay
    setTimeout(smartPoll, 500);

    // Cleanup on unmount
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
      pollCountRef.current = 0;
    };
  }, [session?.user]);

  return null;
}