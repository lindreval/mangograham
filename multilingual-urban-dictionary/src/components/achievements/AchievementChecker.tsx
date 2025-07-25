// Component that automatically checks for new achievements and shows notifications
"use client"

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AchievementNotificationService } from '@/lib/achievementNotificationService';

async function checkWelcomeBackAchievement(userId: string) {
  try {
    const response = await fetch('/api/achievements/check-return-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
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
  const { data: session } = useSession();

  useEffect(() => {
    // Check for stored achievement notifications when component mounts
    AchievementNotificationService.checkForStoredNotifications();
  }, []);

  // Check when user session changes (login/logout)
  useEffect(() => {
    if (session?.user) {
      // Small delay to ensure session is fully loaded
      setTimeout(() => {
        AchievementNotificationService.checkForStoredNotifications();
        
        // Check for welcome back achievement on login
        checkWelcomeBackAchievement(session.user.id);
      }, 500);
    }
  }, [session?.user]);

  return null; // This component doesn't render anything
}