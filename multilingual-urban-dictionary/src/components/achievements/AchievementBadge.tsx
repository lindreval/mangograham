// AchievementBadge component - extends the existing Badge with achievement functionality
import { Achievement } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// Extend badge variants for achievement-specific styles
const achievementBadgeVariants = cva(
  "cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md relative group",
  {
    variants: {
      achievementState: {
        completed: "bg-yellow-100 border-yellow-400 text-yellow-800 shadow-md shadow-primary/20",
        locked: "bg-slate-100 border-slate-300 text-slate-400 cursor-default hover:scale-100 hover:shadow-none",
        inProgress: "bg-amber-100 border-amber-300 text-amber-800"
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
        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out"
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
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2.5 bg-card border-2 border-primary/20 text-foreground text-sm rounded-xl shadow-card-hover opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-10 max-w-xs">
          <div className="font-semibold text-center">{achievement.name}</div>
          <div className="text-xs text-muted-foreground text-center mt-1">
            {achievement.description}
          </div>
          {achievement.points > 0 && (
            <div className="text-xs text-primary font-medium text-center mt-1">
              +{achievement.points} points
            </div>
          )}
          {!isCompleted && !isLocked && (
            <div className="text-xs text-amber-600 text-center mt-1">
              Progress: {progress}/{maxProgress}
            </div>
          )}
          {isCompleted && (
            <div className="text-xs text-primary font-medium text-center mt-1">
              Completed!
            </div>
          )}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-card"></div>
        </div>
      </div>
    );
  }

  return badgeContent;
}