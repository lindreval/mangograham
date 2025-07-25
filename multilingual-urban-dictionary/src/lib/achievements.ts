// Core Achievement Service for Yung Salita
import { prisma } from './prisma';
import { Achievement, UserAchievement, Prisma } from '@prisma/client';
import { ALL_ACHIEVEMENTS } from './achievement-definitions';

// Type for UserAchievement with included Achievement
export type UserAchievementWithAchievement = UserAchievement & {
  achievement: Achievement;
};

export interface AchievementProgress {
  achievement: Achievement;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  unlockedAt?: Date;
}

export interface UserStats {
  // Basic user info
  reputation: number;
  daysSinceMembership: number;
  
  // Content creation stats
  definitionsCreated: number;
  examplesCreated: number;
  phrasesCreated: number;
  
  // Social interaction stats
  votesCast: number;
  totalVotesReceived: number;
  upvotesReceived: number;
  
  // Learning & exploration stats
  phrasesViewed: number;
  languagesExplored: number;
  languagePagesVisited: number;
  searchesPerformed: number;
  
  // Profile & onboarding stats
  profileCompleted: boolean;
  returnVisit: boolean;
}

export class AchievementService {
  /**
   * Initialize achievement progress for a new user
   */
  static async initializeUserAchievements(userId: string): Promise<void> {
    try {
      // Create UserAchievement records for all available achievements
      const achievements = await prisma.achievement.findMany();
      
      const userAchievementData = achievements.map(achievement => ({
        userId,
        achievementId: achievement.id,
        progress: 0,
        maxProgress: this.getMaxProgressFromRequirements(achievement.requirements as Record<string, unknown>),
        isCompleted: false,
        notified: false
      }));

      await prisma.userAchievement.createMany({
        data: userAchievementData,
        skipDuplicates: true
      });
    } catch (error) {
      console.error('Error initializing user achievements:', error);
    }
  }

  /**
   * Ensure user has achievement records initialized (safe for existing users)
   */
  static async ensureUserInitialized(userId: string): Promise<void> {
    try {
      const existingCount = await prisma.userAchievement.count({
        where: { userId }
      });
      
      if (existingCount === 0) {
        await this.initializeUserAchievements(userId);
        
        // For existing users, immediately check all achievements they might have earned
        setTimeout(async () => {
          try {
            await this.checkAndAwardAchievements(userId, 'INITIALIZATION');
          } catch (error) {
            console.error('Error during user initialization achievement check:', error);
          }
        }, 1000); // Delay to avoid blocking the current operation
      }
    } catch (error) {
      console.error('Error ensuring user initialized:', error);
    }
  }

  /**
   * Check and award achievements for a user based on trigger type
   */
  static async checkAndAwardAchievements(userId: string, triggerType: string): Promise<Achievement[]> {
    try {
      // Ensure user is initialized before checking achievements
      if (triggerType !== 'INITIALIZATION') {
        await this.ensureUserInitialized(userId);
      }
      
      const userStats = await this.getUserStats(userId);
      const newAchievements: Achievement[] = [];

      // Get all incomplete achievements for this user
      const incompleteAchievements = await prisma.userAchievement.findMany({
        where: {
          userId,
          isCompleted: false
        },
        include: {
          achievement: true
        }
      });

      // Check each incomplete achievement
      for (const userAchievement of incompleteAchievements) {
        const achievement = userAchievement.achievement;
        const requirements = achievement.requirements as Record<string, unknown>;
        
        // Calculate current progress
        const progress = this.calculateProgress(requirements, userStats);
        const maxProgress = this.getMaxProgressFromRequirements(requirements);
        
        // Update progress
        await prisma.userAchievement.update({
          where: { id: userAchievement.id },
          data: {
            progress,
            maxProgress
          }
        });

        // Check if achievement should be awarded
        if (this.evaluateRequirements(requirements, userStats) && !userAchievement.isCompleted) {
          await this.awardAchievement(userId, achievement.id);
          newAchievements.push(achievement);
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  /**
   * Award a specific achievement to a user
   */
  static async awardAchievement(userId: string, achievementId: string): Promise<boolean> {
    try {
      const achievement = await prisma.achievement.findUnique({
        where: { id: achievementId }
      });

      if (!achievement) return false;

      // Update UserAchievement to completed
      await prisma.userAchievement.update({
        where: {
          userId_achievementId: {
            userId,
            achievementId
          }
        },
        data: {
          isCompleted: true,
          unlockedAt: new Date(),
          notified: false // Will be set to true when user is notified
        }
      });

      // Update user's achievement stats
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalAchievements: {
            increment: 1
          },
          achievementPoints: {
            increment: achievement.points
          },
          lastAchievementAt: new Date()
        }
      });

      return true;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return false;
    }
  }

  /**
   * Get all achievements for a user with progress
   */
  static async getUserAchievements(userId: string): Promise<UserAchievementWithAchievement[]> {
    try {
      return await prisma.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: true
        },
        orderBy: {
          unlockedAt: 'desc'
        }
      });
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  /**
   * Get achievement progress for dashboard display
   */
  static async getAchievementProgress(userId: string): Promise<AchievementProgress[]> {
    try {
      const userAchievements = await this.getUserAchievements(userId);
      
      return userAchievements.map(ua => ({
        achievement: ua.achievement,
        progress: ua.progress,
        maxProgress: ua.maxProgress,
        isCompleted: ua.isCompleted,
        unlockedAt: ua.unlockedAt
      }));
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return [];
    }
  }

  /**
   * Get user statistics for achievement evaluation
   */
  private static async getUserStats(userId: string): Promise<UserStats> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          definitions: true,
          examples: true,
          phrases: true,
          definitionVotes: true,
          exampleVotes: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Calculate days since membership
      const daysSinceMembership = Math.floor(
        (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate upvotes received (simplified - would need more complex query in real implementation)
      const upvotesReceived = await prisma.definitionVote.count({
        where: {
          definition: {
            authorId: userId
          },
          value: 1
        }
      });

      // Profile completion check
      const profileCompleted = !!(user.bio && user.languagesSpoken.length > 0);

      // Return visit check (simplified - in real implementation, track sessions)
      const returnVisit = daysSinceMembership > 0;

      return {
        reputation: user.reputation,
        daysSinceMembership,
        definitionsCreated: user.definitions.length,
        examplesCreated: user.examples.length,
        phrasesCreated: user.phrases.length,
        votesCast: user.definitionVotes.length + user.exampleVotes.length,
        totalVotesReceived: upvotesReceived, // Simplified
        upvotesReceived,
        phrasesViewed: 0, // TODO: Implement phrase view tracking
        languagesExplored: 0, // TODO: Implement language exploration tracking
        languagePagesVisited: 0, // TODO: Implement page visit tracking
        searchesPerformed: 0, // TODO: Implement search tracking
        profileCompleted,
        returnVisit
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Evaluate if requirements are met for an achievement
   */
  private static evaluateRequirements(requirements: Record<string, unknown>, userStats: UserStats): boolean {
    for (const [key, requiredValue] of Object.entries(requirements)) {
      const userValue = userStats[key as keyof UserStats];
      
      if (typeof requiredValue === 'number') {
        if (typeof userValue !== 'number' || userValue < requiredValue) {
          return false;
        }
      } else if (typeof requiredValue === 'boolean') {
        if (userValue !== requiredValue) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Calculate current progress toward an achievement
   */
  private static calculateProgress(requirements: Record<string, unknown>, userStats: UserStats): number {
    let totalProgress = 0;

    for (const [key, requiredValue] of Object.entries(requirements)) {
      const userValue = userStats[key as keyof UserStats];
      
      if (typeof requiredValue === 'number' && typeof userValue === 'number') {
        totalProgress += Math.min(userValue, requiredValue);
      } else if (typeof requiredValue === 'boolean' && userValue === requiredValue) {
        totalProgress += 1;
      }
    }

    return totalProgress;
  }

  /**
   * Get max progress value from requirements
   */
  private static getMaxProgressFromRequirements(requirements: Record<string, unknown>): number {
    let maxProgress = 0;
    
    for (const [, requiredValue] of Object.entries(requirements)) {
      if (typeof requiredValue === 'number') {
        maxProgress += requiredValue;
      } else if (typeof requiredValue === 'boolean') {
        maxProgress += 1;
      }
    }
    
    return Math.max(maxProgress, 1);
  }

  /**
   * Seed initial achievements into database
   */
  static async seedAchievements(): Promise<void> {
    try {
      for (const achievementDef of ALL_ACHIEVEMENTS) {
        await prisma.achievement.upsert({
          where: {
            name_tier: {
              name: achievementDef.name,
              tier: achievementDef.tier || 1
            }
          },
          update: {
            description: achievementDef.description,
            icon: achievementDef.icon,
            category: achievementDef.category,
            requirements: achievementDef.requirements as Prisma.JsonObject,
            points: achievementDef.points,
            isHidden: achievementDef.isHidden || false
          },
          create: {
            id: achievementDef.id,
            name: achievementDef.name,
            description: achievementDef.description,
            icon: achievementDef.icon,
            category: achievementDef.category,
            tier: achievementDef.tier || 1,
            requirements: achievementDef.requirements as Prisma.JsonObject,
            points: achievementDef.points,
            isHidden: achievementDef.isHidden || false
          }
        });
      }
      
      console.log(`Seeded ${ALL_ACHIEVEMENTS.length} achievements`);
    } catch (error) {
      console.error('Error seeding achievements:', error);
    }
  }
}