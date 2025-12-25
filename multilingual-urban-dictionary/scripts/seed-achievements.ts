// Script to seed Phase 1 achievements
import { AchievementService } from '../src/lib/achievements';

async function main() {
  console.log('🌱 Seeding Phase 1 achievements...');
  
  try {
    await AchievementService.seedAchievements();
    console.log('✅ Successfully seeded achievements!');
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });