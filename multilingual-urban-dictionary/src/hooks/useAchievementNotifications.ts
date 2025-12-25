"use client"

import { Achievement } from '@prisma/client';
import { showAchievementNotification, showMultipleAchievementNotifications } from '@/components/achievements/AchievementNotification';

// Hook for handling achievement notifications on the client side
export function useAchievementNotifications() {
  
  // Function to trigger achievement notifications
  const triggerAchievementNotifications = (achievements: Achievement[]) => {
    if (achievements.length === 0) return;
    
    // Small delay to ensure the action completes before showing notification
    setTimeout(() => {
      showMultipleAchievementNotifications(achievements);
    }, 500);
  };

  // Function to trigger single achievement notification
  const triggerSingleAchievementNotification = (achievement: Achievement) => {
    setTimeout(() => {
      showAchievementNotification(achievement);
    }, 500);
  };

  return {
    triggerAchievementNotifications,
    triggerSingleAchievementNotification,
  };
}

// Utility function to check for new achievements in localStorage and show notifications
export function checkAndShowStoredAchievements() {
  if (typeof window === 'undefined') return;
  
  const storedAchievements = localStorage.getItem('newAchievements');
  if (storedAchievements) {
    try {
      const achievements: Achievement[] = JSON.parse(storedAchievements);
      if (achievements.length > 0) {
        showMultipleAchievementNotifications(achievements);
        localStorage.removeItem('newAchievements');
      }
    } catch (error) {
      console.error('Error parsing stored achievements:', error);
      localStorage.removeItem('newAchievements');
    }
  }
}

// Store achievements in localStorage to show notifications after page reload/navigation
export function storeAchievementsForNotification(achievements: Achievement[]) {
  if (typeof window === 'undefined' || achievements.length === 0) return;
  
  localStorage.setItem('newAchievements', JSON.stringify(achievements));
}