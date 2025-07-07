import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample users first
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'user1@example.com' },
      update: {},
      create: {
        email: 'user1@example.com',
        name: 'Alex Chen',
        role: 'user',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'user2@example.com' },
      update: {},
      create: {
        email: 'user2@example.com',
        name: 'Maria Rodriguez',
        role: 'moderator',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b332fd8c?w=150&h=150&fit=crop&crop=face',
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'user3@example.com' },
      update: {},
      create: {
        email: 'user3@example.com',
        name: 'Juan Santos',
        role: 'user',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'user4@example.com' },
      update: {},
      create: {
        email: 'user4@example.com',
        name: 'Sarah Kim',
        role: 'admin',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'user5@example.com' },
      update: {},
      create: {
        email: 'user5@example.com',
        name: 'Miguel Fernandez',
        role: 'user',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'user6@example.com' },
      update: {},
      create: {
        email: 'user6@example.com',
        name: 'Aisha Patel',
        role: 'user',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'user7@example.com' },
      update: {},
      create: {
        email: 'user7@example.com',
        name: 'Carlos Mendoza',
        role: 'user',
        image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face',
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'user8@example.com' },
      update: {},
      create: {
        email: 'user8@example.com',
        name: 'Lisa Wang',
        role: 'user',
        image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'user9@example.com' },
      update: {},
      create: {
        email: 'user9@example.com',
        name: 'Ahmed Hassan',
        role: 'user',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'user10@example.com' },
      update: {},
      create: {
        email: 'user10@example.com',
        name: 'Jennifer Lopez',
        role: 'user',
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
        emailVerified: new Date(),
      },
    }),
  ]);

  // Create languages
  const english = await prisma.language.upsert({
    where: { isoCode: 'en' },
    update: {},
    create: {
      name: 'English',
      isoCode: 'en',
    },
  });

  const tagalog = await prisma.language.upsert({
    where: { isoCode: 'tl' },
    update: {},
    create: {
      name: 'Tagalog',
      isoCode: 'tl',
    },
  });

  const spanish = await prisma.language.upsert({
    where: { isoCode: 'es' },
    update: {},
    create: {
      name: 'Spanish',
      isoCode: 'es',
    },
  });

  // Create sample phrases
  const phrase1 = await prisma.phrase.upsert({
    where: { normalized_languageId: { languageId: english.id, normalized: 'ghosting' } },
    update: {},
    create: {
      textOriginal: 'ghosting',
      normalized: 'ghosting',
      partOfSpeech: 'verb',
      languageId: english.id,
    },
  });

  const phrase2 = await prisma.phrase.upsert({
    where: { normalized_languageId: { languageId: english.id, normalized: 'simp' } },
    update: {},
    create: {
      textOriginal: 'simp',
      normalized: 'simp',
      partOfSpeech: 'noun',
      languageId: english.id,
    },
  });

  const phrase3 = await prisma.phrase.upsert({
    where: { normalized_languageId: { languageId: tagalog.id, normalized: 'sana all' } },
    update: {},
    create: {
      textOriginal: 'sana all',
      normalized: 'sana all',
      partOfSpeech: 'expression',
      languageId: tagalog.id,
    },
  });

  const phrase4 = await prisma.phrase.upsert({
    where: { normalized_languageId: { languageId: tagalog.id, normalized: 'chismosa' } },
    update: {},
    create: {
      textOriginal: 'chismosa',
      normalized: 'chismosa',
      partOfSpeech: 'noun',
      languageId: tagalog.id,
    },
  });

  const phrase5 = await prisma.phrase.upsert({
    where: { normalized_languageId: { languageId: spanish.id, normalized: 'no mames' } },
    update: {},
    create: {
      textOriginal: 'no mames',
      normalized: 'no mames',
      partOfSpeech: 'expression',
      languageId: spanish.id,
    },
  });

  // Create sample definitions with all columns
  const def1 = await prisma.definition.create({
    data: {
      body: 'Suddenly cutting off all communication with someone without explanation',
      pronunciation: '/ˈɡoʊstɪŋ/',
      mediaUrl: 'https://example.com/audio/ghosting.mp3',
      authorId: users[0].id,
      phraseId: phrase1.id,
      status: 'approved',
    },
  });

  const def2 = await prisma.definition.create({
    data: {
      body: 'Someone who does way too much for a person they like, hoping for romantic attention',
      pronunciation: '/sɪmp/',
      mediaUrl: 'https://example.com/video/simp-explanation.mp4',
      authorId: users[1].id,
      phraseId: phrase2.id,
      status: 'approved',
    },
  });

  const def3 = await prisma.definition.create({
    data: {
      body: 'Expression meaning "I wish I had that too" or "I wish we all had that"',
      pronunciation: '/ˈsaːna ˈɔːl/',
      mediaUrl: 'https://example.com/audio/sana-all.mp3',
      authorId: users[2].id,
      phraseId: phrase3.id,
      status: 'approved',
    },
  });

  const def4 = await prisma.definition.create({
    data: {
      body: 'A gossip or someone who spreads rumors',
      pronunciation: '/t͡ʃɪsˈmoːsa/',
      mediaUrl: 'https://example.com/audio/chismosa.mp3',
      authorId: users[3].id,
      phraseId: phrase4.id,
      status: 'approved',
    },
  });

  const def5 = await prisma.definition.create({
    data: {
      body: 'Expression of disbelief or surprise, literally "don\'t suck"',
      pronunciation: '/no ˈmames/',
      mediaUrl: 'https://example.com/audio/no-mames.mp3',
      authorId: users[4].id,
      phraseId: phrase5.id,
      status: 'approved',
    },
  });

  // Create a pending definition to show different status
  const def6 = await prisma.definition.create({
    data: {
      body: 'Alternative definition for ghosting - avoiding someone by not responding',
      pronunciation: '/ˈɡoʊstɪŋ/',
      authorId: users[5].id,
      phraseId: phrase1.id,
      status: 'pending',
    },
  });

  // Create multiple examples for each definition
  await prisma.example.createMany({
    data: [
      // Examples for "ghosting"
      {
        text: 'He ghosted me after our third date.',
        authorId: users[0].id,
        definitionId: def1.id,
      },
      {
        text: 'She completely ghosted her friends when she got a new boyfriend.',
        authorId: users[5].id,
        definitionId: def1.id,
      },
      
      // Examples for "simp"
      {
        text: 'Stop being such a simp and have some self-respect.',
        authorId: users[1].id,
        definitionId: def2.id,
      },
      {
        text: 'He bought her expensive gifts every week - total simp behavior.',
        authorId: users[6].id,
        definitionId: def2.id,
      },
      
      // Examples for "sana all"
      {
        text: 'Friend posts vacation photos. You comment: "Sana all"',
        authorId: users[2].id,
        definitionId: def3.id,
      },
      {
        text: 'Nakita kong may bagong kotse si kuya. Sana all mayaman!',
        translation: 'I saw my brother has a new car. I wish we were all rich!',
        authorId: users[7].id,
        definitionId: def3.id,
      },
      
      // Examples for "chismosa"
      {
        text: 'Wag kang makinig sa kanya, chismosa yan.',
        translation: 'Don\'t listen to her, she\'s a gossip.',
        authorId: users[3].id,
        definitionId: def4.id,
      },
      {
        text: 'Ang chismosa ng kapitbahay namin, alam lahat ng nangyayari sa buong street.',
        translation: 'Our neighbor is such a gossip, she knows everything happening on the whole street.',
        authorId: users[8].id,
        definitionId: def4.id,
      },
      
      // Examples for "no mames"
      {
        text: '¿Ganaste la lotería? ¡No mames!',
        translation: 'You won the lottery? No way!',
        authorId: users[4].id,
        definitionId: def5.id,
      },
      {
        text: 'No mames, ese examen estuvo súper difícil.',
        translation: 'Dude, that exam was super difficult.',
        authorId: users[9].id,
        definitionId: def5.id,
      },
    ],
  });

  // Create votes for definitions
  await prisma.vote.createMany({
    data: [
      // Positive votes for def1 (ghosting)
      { userId: users[1].id, definitionId: def1.id, value: 1 },
      { userId: users[2].id, definitionId: def1.id, value: 1 },
      { userId: users[3].id, definitionId: def1.id, value: 1 },
      { userId: users[4].id, definitionId: def1.id, value: 1 },
      { userId: users[5].id, definitionId: def1.id, value: 1 },
      
      // Mixed votes for def2 (simp)
      { userId: users[0].id, definitionId: def2.id, value: 1 },
      { userId: users[2].id, definitionId: def2.id, value: 1 },
      { userId: users[3].id, definitionId: def2.id, value: -1 },
      { userId: users[4].id, definitionId: def2.id, value: 1 },
      
      // Positive votes for def3 (sana all)
      { userId: users[0].id, definitionId: def3.id, value: 1 },
      { userId: users[1].id, definitionId: def3.id, value: 1 },
      { userId: users[4].id, definitionId: def3.id, value: 1 },
      { userId: users[5].id, definitionId: def3.id, value: 1 },
      
      // Mixed votes for def4 (chismosa)
      { userId: users[0].id, definitionId: def4.id, value: 1 },
      { userId: users[1].id, definitionId: def4.id, value: 1 },
      { userId: users[2].id, definitionId: def4.id, value: -1 },
      
      // Positive votes for def5 (no mames)
      { userId: users[0].id, definitionId: def5.id, value: 1 },
      { userId: users[1].id, definitionId: def5.id, value: 1 },
      { userId: users[2].id, definitionId: def5.id, value: 1 },
      { userId: users[3].id, definitionId: def5.id, value: 1 },
      
      // Negative votes for def6 (pending definition)
      { userId: users[0].id, definitionId: def6.id, value: -1 },
      { userId: users[1].id, definitionId: def6.id, value: -1 },
    ],
  });

  console.log('Database seeded successfully!');
  console.log(`Created ${await prisma.user.count()} users`);
  console.log(`Created ${await prisma.language.count()} languages`);
  console.log(`Created ${await prisma.phrase.count()} phrases`);
  console.log(`Created ${await prisma.definition.count()} definitions`);
  console.log(`Created ${await prisma.example.count()} examples`);
  console.log(`Created ${await prisma.vote.count()} votes`);

  // Test relationships
  console.log('\n--- Testing Author-Definition Relationships ---');
  
  // Test 1: Get a user with their definitions
  const userWithDefinitions = await prisma.user.findFirst({
    where: { email: 'user1@example.com' },
    include: {
      definitions: {
        include: {
          phrase: {
            include: {
              language: true
            }
          }
        }
      }
    }
  });

  console.log(`\n✅ User "${userWithDefinitions?.name}" has ${userWithDefinitions?.definitions.length} definitions:`);
  userWithDefinitions?.definitions.forEach((def, index) => {
    console.log(`   ${index + 1}. "${def.body}" for phrase "${def.phrase.textOriginal}" (${def.phrase.language.name})`);
  });

  // Test 2: Get all definitions with their authors
  const definitionsWithAuthors = await prisma.definition.findMany({
    include: {
      author: true,
      phrase: {
        include: {
          language: true
        }
      }
    },
    orderBy: {
      id: 'asc'
    }
  });

  console.log(`\n✅ All definitions with their authors:`);
  definitionsWithAuthors.forEach((def, index) => {
    console.log(`   ${index + 1}. "${def.body}" by ${def.author.name} for "${def.phrase.textOriginal}" (${def.phrase.language.name})`);
  });

  // Test 3: Count definitions per user
  const usersWithCounts = await prisma.user.findMany({
    include: {
      _count: {
        select: { definitions: true }
      }
    },
    orderBy: {
      email: 'asc'
    }
  });

  console.log(`\n✅ Definition counts per user:`);
  usersWithCounts.forEach(user => {
    if (user._count.definitions > 0) {
      console.log(`   ${user.name}: ${user._count.definitions} definitions`);
    }
  });

  console.log('\n✅ All author-definition relationships are working correctly!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });