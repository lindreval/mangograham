// Achievement definitions for Yung Salita
// Phase 1: Foundation & Immediate Gratification achievements

import { AchievementCategory } from '@prisma/client';

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tier?: number;
  requirements: Record<string, unknown>;
  points: number;
  isHidden?: boolean;
  autoAwarded?: boolean;
}

// Phase 1: Onboarding achievements for immediate gratification
export const PHASE_1_ONBOARDING_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "profile_complete",
    name: "Getting Started",
    description: "Complete your profile setup - add your bio and languages!",
    icon: "👤",
    category: "CONTRIBUTION",
    requirements: { profileCompleted: true },
    points: 5
  },
  {
    id: "first_search",
    name: "Curious Mind",
    description: "You've searched for your first phrase!",
    icon: "🔎",
    category: "LEARNING",
    requirements: { searchesPerformed: 1 },
    points: 2
  },
  {
    id: "first_language_visit",
    name: "Language Explorer",
    description: "You've explored your first language page!",
    icon: "🗺️",
    category: "LEARNING",
    requirements: { languagePagesVisited: 1 },
    points: 3
  },
  {
    id: "welcome_back",
    name: "Welcome Back",
    description: "You've returned to the site - we're glad to see you again!",
    icon: "👋",
    category: "MILESTONE",
    requirements: { returnVisit: true },
    points: 5
  },
  {
    id: "first_upvote_received",
    name: "First Recognition",
    description: "Someone appreciated your contribution with their first upvote!",
    icon: "🌟",
    category: "SOCIAL",
    requirements: { upvotesReceived: 1 },
    points: 8
  }
];

// Phase 1: Basic contribution achievements  
export const PHASE_1_CONTRIBUTION_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first_definition",
    name: "First Definition",
    description: "You've shared your first definition with the community!",
    icon: "🎯",
    category: "CONTRIBUTION",
    requirements: { definitionsCreated: 1 },
    points: 5
  },
  {
    id: "first_example",
    name: "Example Giver",
    description: "You've provided your first usage example!",
    icon: "💡",
    category: "CONTRIBUTION",
    requirements: { examplesCreated: 1 },
    points: 3
  },
  {
    id: "first_vote",
    name: "First Vote",
    description: "You've cast your first vote to help improve content quality!",
    icon: "👍",
    category: "SOCIAL",
    requirements: { votesCast: 1 },
    points: 2
  }
];

// Combine all Phase 1 achievements
export const PHASE_1_ACHIEVEMENTS: AchievementDefinition[] = [
  ...PHASE_1_ONBOARDING_ACHIEVEMENTS,
  ...PHASE_1_CONTRIBUTION_ACHIEVEMENTS
];

// Export for seeding and service use
export const ALL_ACHIEVEMENTS: AchievementDefinition[] = [
  ...PHASE_1_ACHIEVEMENTS
  // Future phases will add more achievements here
];