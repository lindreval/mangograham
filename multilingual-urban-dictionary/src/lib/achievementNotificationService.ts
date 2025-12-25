// Client-side service for handling achievement notifications
"use client"

import { Achievement } from '@prisma/client';
import { showAchievementNotification, showMultipleAchievementNotifications } from '@/components/achievements/AchievementNotification';

export class AchievementNotificationService {
  
  // Handle achievements returned from server actions
  static handleServerActionAchievements(achievements: Achievement[]) {
    if (achievements.length === 0) return;
    
    // Small delay to ensure UI updates complete before showing notification
    setTimeout(() => {
      showMultipleAchievementNotifications(achievements);
    }, 300);
  }

  // Handle single achievement notification
  static handleSingleAchievement(achievement: Achievement) {
    setTimeout(() => {
      showAchievementNotification(achievement);
    }, 300);
  }

  // Store achievements for cross-page notifications (e.g., after form submission)
  static storeForLaterNotification(achievements: Achievement[]) {
    if (typeof window === 'undefined' || achievements.length === 0) return;
    
    try {
      localStorage.setItem('pendingAchievementNotifications', JSON.stringify(achievements));
    } catch (error) {
      console.error('Failed to store achievements for notification:', error);
    }
  }

  // Check for and display stored achievement notifications
  static checkForStoredNotifications() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('pendingAchievementNotifications');
      if (stored) {
        const achievements: Achievement[] = JSON.parse(stored);
        if (achievements.length > 0) {
          setTimeout(() => {
            showMultipleAchievementNotifications(achievements);
          }, 1000); // Longer delay for page load notifications
          
          localStorage.removeItem('pendingAchievementNotifications');
        }
      }
    } catch (error) {
      console.error('Error checking stored achievement notifications:', error);
      localStorage.removeItem('pendingAchievementNotifications');
    }
  }
}