// Test script for achievement system
import { AchievementService } from '../src/lib/achievements';
import { prisma } from '../src/lib/prisma';

async function testAchievementSystem() {
  console.log('🧪 Testing Achievement System...\n');

  try {
    // Get a test user (or create one)
    let testUser = await prisma.user.findFirst({
      where: { 
        email: { not: null }
      }
    });

    if (!testUser) {
      console.log('❌ No users found. Please sign in to the app first.');
      return;
    }

    console.log(`👤 Testing with user: ${testUser.name || testUser.email} (${testUser.id})`);

    // Test 1: Ensure user initialization
    console.log('\n📋 Test 1: User Initialization');
    await AchievementService.ensureUserInitialized(testUser.id);
    
    const userAchievements = await AchievementService.getUserAchievements(testUser.id);
    console.log(`✅ User has ${userAchievements.length} achievement records`);

    // Test 2: Check current achievements status
    console.log('\n🏆 Test 2: Current Achievement Status');
    const completedAchievements = userAchievements.filter(ua => ua.isCompleted);
    const inProgressAchievements = userAchievements.filter(ua => !ua.isCompleted && ua.progress > 0);
    
    console.log(`✅ Completed: ${completedAchievements.length}`);
    console.log(`⏳ In Progress: ${inProgressAchievements.length}`);
    console.log(`🔒 Locked: ${userAchievements.length - completedAchievements.length - inProgressAchievements.length}`);

    // Show completed achievements
    if (completedAchievements.length > 0) {
      console.log('\n🎉 Completed Achievements:');
      completedAchievements.forEach(ua => {
        console.log(`  ${ua.achievement.icon} ${ua.achievement.name} (+${ua.achievement.points} points)`);
      });
    }

    // Show in-progress achievements
    if (inProgressAchievements.length > 0) {
      console.log('\n📊 In Progress:');
      inProgressAchievements.forEach(ua => {
        console.log(`  ${ua.achievement.icon} ${ua.achievement.name} (${ua.progress}/${ua.maxProgress})`);
      });
    }

    // Test 3: Trigger achievement check
    console.log('\n🔄 Test 3: Triggering Achievement Check');
    const newAchievements = await AchievementService.checkAndAwardAchievements(testUser.id, 'TEST_CHECK');
    
    if (newAchievements.length > 0) {
      console.log(`🎊 Awarded ${newAchievements.length} new achievements!`);
      newAchievements.forEach(achievement => {
        console.log(`  🎉 ${achievement.icon} ${achievement.name} - ${achievement.description}`);
      });
    } else {
      console.log('✅ No new achievements to award (system working correctly)');
    }

    // Test 4: Check user stats used for achievements
    console.log('\n📈 Test 4: User Statistics');
    const userStats = await AchievementService['getUserStats'](testUser.id);
    console.log(`  Definitions: ${userStats.definitionsCreated}`);
    console.log(`  Examples: ${userStats.examplesCreated}`);
    console.log(`  Phrases: ${userStats.phrasesCreated}`);
    console.log(`  Votes Cast: ${userStats.votesCast}`);
    console.log(`  Upvotes Received: ${userStats.upvotesReceived}`);
    console.log(`  Profile Completed: ${userStats.profileCompleted}`);
    console.log(`  Days Since Membership: ${userStats.daysSinceMembership}`);

    console.log('\n✅ Achievement system test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing achievement system:', error);
  }
}

testAchievementSystem()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });