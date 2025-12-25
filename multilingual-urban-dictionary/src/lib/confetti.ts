/**
 * Confetti celebration utilities for Yung Salita
 *
 * Premium, tasteful confetti animations for success moments
 * Uses the app's color scheme for brand consistency
 */

import confetti from 'canvas-confetti';

// Color scheme from the app (converted from oklch to hex approximations)
const APP_COLORS = {
  primary: '#2d8659',      // oklch(0.4228 0.1001 147.05) - main green
  accent: '#b8e6cf',       // oklch(0.9371 0.0651 122.64) - light green
  secondary: '#f5f5f7',    // oklch(0.968 0.007 247.896) - light gray
  gold: '#ffd700',         // gold for achievements
  silver: '#c0c0c0',       // silver for achievements
  bronze: '#cd7f32',       // bronze for achievements
};

/**
 * Standard success confetti - subtle and elegant
 * Perfect for form submissions, content creation
 */
export function celebrateSuccess() {
  const count = 100;
  const defaults = {
    origin: { y: 0.7 },
    colors: [APP_COLORS.primary, APP_COLORS.accent, APP_COLORS.secondary],
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Subtle burst pattern
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

/**
 * Milestone celebration - more dramatic for significant achievements
 * Perfect for unlocking major milestones, reaching reputation levels
 */
export function celebrateMilestone() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 9999,
    colors: [APP_COLORS.primary, APP_COLORS.accent, APP_COLORS.gold],
  };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Fire from two sides
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}

/**
 * Achievement unlock celebration - colored confetti with special flair
 * Perfect for unlocking achievements with tier-based colors
 *
 * @param tier - The achievement tier (1 = bronze, 2 = silver, 3+ = gold)
 */
export function celebrateAchievement(tier: number = 1) {
  // Determine colors based on tier
  let tierColors: string[];
  if (tier === 1) {
    tierColors = [APP_COLORS.bronze, APP_COLORS.accent, APP_COLORS.primary];
  } else if (tier === 2) {
    tierColors = [APP_COLORS.silver, APP_COLORS.accent, APP_COLORS.primary];
  } else {
    tierColors = [APP_COLORS.gold, APP_COLORS.accent, APP_COLORS.primary];
  }

  const count = 150;
  const defaults = {
    origin: { y: 0.6 },
    colors: tierColors,
    shapes: ['circle', 'square'] as confetti.Shape[],
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Multi-burst pattern for achievements
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
    startVelocity: 45,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });

  // Extra burst for higher tiers
  if (tier >= 2) {
    setTimeout(() => {
      fire(0.15, {
        spread: 180,
        startVelocity: 60,
        decay: 0.9,
      });
    }, 300);
  }
}

/**
 * Quick burst - minimal, tasteful celebration
 * Perfect for small wins like upvotes, profile updates
 */
export function celebrateQuick() {
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.8 },
    colors: [APP_COLORS.primary, APP_COLORS.accent],
  });
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.8 },
    colors: [APP_COLORS.primary, APP_COLORS.accent],
  });
}

/**
 * Center burst - elegant single burst from center
 * Perfect for modal confirmations, important actions
 */
export function celebrateCenter() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.5 },
    colors: [APP_COLORS.primary, APP_COLORS.accent, APP_COLORS.secondary],
  });
}

/**
 * Feedback celebration - optimized for feedback form submissions
 * Slightly more enthusiastic than standard success
 */
export function celebrateFeedback() {
  const count = 120;
  const defaults = {
    origin: { y: 0.65 },
    colors: [APP_COLORS.primary, APP_COLORS.accent, APP_COLORS.gold],
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.3, {
    spread: 30,
    startVelocity: 50,
  });

  fire(0.25, {
    spread: 70,
    startVelocity: 40,
  });

  fire(0.25, {
    spread: 100,
    decay: 0.91,
    scalar: 0.9,
  });

  fire(0.2, {
    spread: 130,
    startVelocity: 30,
    decay: 0.92,
  });
}

/**
 * Clear all confetti from screen immediately
 * Useful for cleanup or when user navigates away
 */
export function clearConfetti() {
  confetti.reset();
}

/**
 * Check if user prefers reduced motion
 * Returns true if confetti should be disabled for accessibility
 */
export function shouldDisableConfetti(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Safe confetti wrapper that respects accessibility preferences
 * Use this as the default export for automatic a11y handling
 */
export const safeConfetti = {
  success: () => !shouldDisableConfetti() && celebrateSuccess(),
  milestone: () => !shouldDisableConfetti() && celebrateMilestone(),
  achievement: (tier?: number) => !shouldDisableConfetti() && celebrateAchievement(tier),
  quick: () => !shouldDisableConfetti() && celebrateQuick(),
  center: () => !shouldDisableConfetti() && celebrateCenter(),
  feedback: () => !shouldDisableConfetti() && celebrateFeedback(),
  clear: clearConfetti,
};

export default safeConfetti;
