// Achievement notification system using toast notifications
'use client';

import { Achievement } from '@prisma/client';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import safeConfetti from '@/lib/confetti';

// Helper function to show achievement notification
export function showAchievementNotification(achievement: Achievement) {
  // Trigger confetti based on achievement tier
  safeConfetti.achievement(achievement.tier || 1);

  toast({
    variant: "achievement",
    duration: 6000, // Show for 6 seconds
    title: `🎉 Achievement Unlocked!`,
    description: (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl animate-bounce">{achievement.icon}</span>
          <span className="font-medium">{achievement.name}</span>
        </div>
        <div className="text-sm opacity-90 mb-2">{achievement.description}</div>
        {achievement.points > 0 && (
          <div className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
            +{achievement.points} points earned
          </div>
        )}
      </div>
    ),
    action: (
      <ToastAction
        altText="View Profile"
        onClick={() => window.location.href = '/profile'}
      >
        View Profile
      </ToastAction>
    ),
  });
}

// Helper function to show multiple achievements at once
export function showMultipleAchievementNotifications(achievements: Achievement[]) {
  if (achievements.length === 0) return;

  if (achievements.length === 1) {
    showAchievementNotification(achievements[0]);
    return;
  }

  // Trigger milestone confetti for multiple achievements
  safeConfetti.milestone();

  // Show summary notification for multiple achievements
  const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);

  toast({
    variant: "achievement",
    duration: 8000, // Show longer for multiple achievements
    title: `🎉 ${achievements.length} Achievements Unlocked!`,
    description: (
      <div>
        <div className="space-y-1 mb-2">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center gap-2 text-sm">
              <span>{achievement.icon}</span>
              <span className="font-medium">{achievement.name}</span>
            </div>
          ))}
        </div>
        {totalPoints > 0 && (
          <div className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
            +{totalPoints} total points earned
          </div>
        )}
      </div>
    ),
    action: (
      <ToastAction
        altText="View Profile"
        onClick={() => window.location.href = '/profile'}
      >
        View Profile
      </ToastAction>
    ),
  });
}

// Simple success notification for other achievements-related actions
export function showAchievementSuccessNotification(message: string) {
  toast({
    variant: "success",
    duration: 3000,
    description: message,
  });
}