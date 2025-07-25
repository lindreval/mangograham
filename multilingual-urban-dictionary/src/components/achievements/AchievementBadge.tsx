// AchievementBadge component - extends the existing Badge with achievement functionality
import { Achievement } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// Extend badge variants for achievement-specific styles
const achievementBadgeVariants = cva(
  "cursor-pointer transition-all duration-200 hover:scale-105 relative group",
  {
    variants: {
      achievementState: {
        completed: "bg-yellow-100 border-yellow-400 text-yellow-800 shadow-md",
        locked: "bg-gray-100 border-gray-300 text-gray-400 cursor-default hover:scale-100",
        inProgress: "bg-blue-50 border-blue-300 text-blue-600"
      },
      size: {
        sm: "px-2 py-1 text-xs min-w-8 min-h-8",
        md: "px-3 py-2 text-sm min-w-12 min-h-12", 
        lg: "px-4 py-3 text-base min-w-16 min-h-16"
      }
    },
    defaultVariants: {
      achievementState: "locked",
      size: "md"
    }
  }
);

interface AchievementBadgeProps extends VariantProps<typeof achievementBadgeVariants> {
  achievement: Achievement;
  isCompleted?: boolean;
  isLocked?: boolean;
  progress?: number;
  maxProgress?: number;
  showTooltip?: boolean;
  onClick?: () => void;
  className?: string;
}

export function AchievementBadge({
  achievement,
  isCompleted = false,
  isLocked = true,
  progress = 0,
  maxProgress = 1,
  showTooltip = true,
  onClick,
  size = "md",
  className
}: AchievementBadgeProps) {
  const achievementState = isCompleted 
    ? "completed" 
    : isLocked 
      ? "locked" 
      : "inProgress";

  const displayIcon = isLocked && !isCompleted ? "🔒" : achievement.icon;
  
  // Calculate progress percentage for in-progress achievements
  const progressPercentage = maxProgress > 0 ? (progress / maxProgress) * 100 : 0;

  const badgeContent = (
    <Badge
      variant="outline"
      className={cn(
        achievementBadgeVariants({ achievementState, size }),
        "flex flex-col items-center justify-center gap-1 rounded-lg",
        className
      )}
      onClick={onClick}
    >
      <span className={size === "sm" ? "text-base" : size === "md" ? "text-xl" : "text-2xl"}>
        {displayIcon}
      </span>
      {size !== "sm" && (
        <span className="text-xs font-medium text-center leading-tight">
          {achievement.name}
        </span>
      )}
      {!isCompleted && !isLocked && progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      )}
    </Badge>
  );

  if (showTooltip) {
    return (
      <div className="relative group">
        {badgeContent}
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 max-w-xs">
          <div className="font-semibold text-center">{achievement.name}</div>
          <div className="text-xs text-gray-300 text-center mt-1">
            {achievement.description}
          </div>
          {achievement.points > 0 && (
            <div className="text-xs text-yellow-300 text-center mt-1">
              +{achievement.points} points
            </div>
          )}
          {!isCompleted && !isLocked && (
            <div className="text-xs text-blue-300 text-center mt-1">
              Progress: {progress}/{maxProgress}
            </div>
          )}
          {isCompleted && (
            <div className="text-xs text-green-300 text-center mt-1">
              ✅ Completed!
            </div>
          )}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  return badgeContent;
}