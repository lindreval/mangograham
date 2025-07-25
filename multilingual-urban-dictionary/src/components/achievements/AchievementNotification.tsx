// AchievementNotification component - toast notification for unlocked achievements
'use client';

import { Achievement } from '@prisma/client';
import { AchievementBadge } from './AchievementBadge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementNotificationProps {
  achievement: Achievement;
  onDismiss: () => void;
  onViewProfile?: () => void;
  className?: string;
}

export function AchievementNotification({
  achievement,
  onDismiss,
  onViewProfile,
  className
}: AchievementNotificationProps) {
  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm",
      "animate-in slide-in-from-right-5 duration-300",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎉</span>
          <h3 className="font-semibold text-gray-900">Achievement Unlocked!</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Achievement Content */}
      <div className="flex items-center gap-3 mb-4">
        <AchievementBadge
          achievement={achievement}
          isCompleted={true}
          showTooltip={false}
          size="lg"
        />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">
            {achievement.name}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            {achievement.description}
          </p>
          {achievement.points > 0 && (
            <div className="text-sm text-yellow-600 font-medium">
              +{achievement.points} reputation points
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onViewProfile && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewProfile}
            className="flex-1"
          >
            View Profile
          </Button>
        )}
        <Button
          variant="secondary" 
          size="sm"
          onClick={onDismiss}
          className="flex-1"
        >
          Close
        </Button>
      </div>
    </div>
  );
}