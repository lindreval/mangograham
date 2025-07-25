// AchievementsGrid component - displays a grid of achievement badges
import { AchievementCategory, Achievement } from '@prisma/client';
import { UserAchievementWithAchievement } from '@/lib/achievements';
import { AchievementBadge } from './AchievementBadge';
import { cn } from '@/lib/utils';

interface AchievementsGridProps {
  userAchievements: UserAchievementWithAchievement[];
  category?: AchievementCategory;
  showLocked?: boolean;
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  onAchievementClick?: (achievement: Achievement) => void;
  className?: string;
}

export function AchievementsGrid({
  userAchievements,
  category,
  showLocked = true,
  maxDisplay,
  size = 'md',
  onAchievementClick,
  className
}: AchievementsGridProps) {
  // Filter achievements by category if specified
  let filteredAchievements = userAchievements;
  if (category) {
    filteredAchievements = userAchievements.filter(
      ua => ua.achievement.category === category
    );
  }

  // Filter out locked achievements if showLocked is false
  if (!showLocked) {
    filteredAchievements = filteredAchievements.filter(
      ua => ua.isCompleted
    );
  }

  // Sort achievements: completed first, then by unlock date
  filteredAchievements.sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return -1;
    if (!a.isCompleted && b.isCompleted) return 1;
    if (a.isCompleted && b.isCompleted) {
      return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
    }
    return 0;
  });

  // Limit display if maxDisplay is specified
  if (maxDisplay && maxDisplay > 0) {
    filteredAchievements = filteredAchievements.slice(0, maxDisplay);
  }

  if (filteredAchievements.length === 0) {
    return (
      <div className={cn("text-gray-500 text-center py-8", className)}>
        {category 
          ? `No ${category.toLowerCase()} achievements yet`
          : "No achievements yet"
        }
      </div>
    );
  }

  const gridCols = size === 'sm' ? 'grid-cols-6' : size === 'md' ? 'grid-cols-4' : 'grid-cols-3';

  return (
    <div className={cn("grid gap-3", gridCols, className)}>
      {filteredAchievements.map((userAchievement) => (
        <AchievementBadge
          key={userAchievement.id}
          achievement={userAchievement.achievement}
          isCompleted={userAchievement.isCompleted}
          isLocked={!userAchievement.isCompleted}
          progress={userAchievement.progress}
          maxProgress={userAchievement.maxProgress}
          size={size}
          onClick={() => onAchievementClick?.(userAchievement.achievement)}
        />
      ))}
    </div>
  );
}

// Separate component for showing just completed achievements
export function CompletedAchievementsRow({
  userAchievements,
  maxDisplay = 4,
  className
}: {
  userAchievements: UserAchievementWithAchievement[];
  maxDisplay?: number;
  className?: string;
}) {
  const completedAchievements = userAchievements
    .filter(ua => ua.isCompleted)
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, maxDisplay);

  if (completedAchievements.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex gap-2 items-center", className)}>
      {completedAchievements.map((userAchievement) => (
        <AchievementBadge
          key={userAchievement.id}
          achievement={userAchievement.achievement}
          isCompleted={true}
          size="sm"
        />
      ))}
      {userAchievements.filter(ua => ua.isCompleted).length > maxDisplay && (
        <span className="text-sm text-gray-500 ml-2">
          +{userAchievements.filter(ua => ua.isCompleted).length - maxDisplay} more
        </span>
      )}
    </div>
  );
}