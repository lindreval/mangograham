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
        name: 'Sample User 1',
        role: 'user',
      },
    }),
    prisma.user.upsert({
      where: { email: 'user2@example.com' },
      update: {},
      create: {
        email: 'user2@example.com',
        name: 'Sample User 2',
        role: 'user',
      },
    }),
    prisma.user.upsert({
      where: { email: 'user3@example.com' },
      update: {},
      create: {
        email: 'user3@example.com',
        name: 'Sample User 3',
        role: 'user',
      },
    }),
    prisma.user.upsert({
      where: { email: 'user4@example.com' },
      update: {},
      create: {
        email: 'user4@example.com',
        name: 'Sample User 4',
        role: 'user',
      },
    }),
    prisma.user.upsert({
      where: { email: 'user5@example.com' },
      update: {},
      create: {
        email: 'user5@example.com',
        name: 'Sample User 5',
        role: 'user',
      },
    }),
    prisma.user.upsert({
      where: { email: 'user6@example.com' },
      update: {},
      create: {
        email: 'user6@example.com',
        name: 'Sample User 6',
        role: 'user',
      },
    }),
    prisma.user.upsert({
      where: { email: 'user7@example.com' },
      update: {},
      create: {
        email: 'user7@example.com',
        name: 'Sample User 7',
        role: 'user',
      },
    }),
    prisma.user.upsert({
      where: { email: 'user8@example.com' },
      update: {},
      create: {
        email: 'user8@example.com',
        name: 'Sample User 8',
        role: 'user',
      },
    }),
    prisma.user.upsert({
      where: { email: 'user9@example.com' },
      update: {},
      create: {
        email: 'user9@example.com',
        name: 'Sample User 9',
        role: 'user',
      },
    }),
    prisma.user.upsert({
      where: { email: 'user10@example.com' },
      update: {},
      create: {
        email: 'user10@example.com',
        name: 'Sample User 10',
        role: 'user',
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
  const phrase1 = await prisma.phrase.create({
    data: {
      textOriginal: 'ghosting',
      normalized: 'ghosting',
      partOfSpeech: 'verb',
      languageId: english.id,
    },
  });

  const phrase2 = await prisma.phrase.create({
    data: {
      textOriginal: 'simp',
      normalized: 'simp',
      partOfSpeech: 'noun',
      languageId: english.id,
    },
  });

  const phrase3 = await prisma.phrase.create({
    data: {
      textOriginal: 'sana all',
      normalized: 'sana all',
      partOfSpeech: 'expression',
      languageId: tagalog.id,
    },
  });

  const phrase4 = await prisma.phrase.create({
    data: {
      textOriginal: 'chismosa',
      normalized: 'chismosa',
      partOfSpeech: 'noun',
      languageId: tagalog.id,
    },
  });

  const phrase5 = await prisma.phrase.create({
    data: {
      textOriginal: 'no mames',
      normalized: 'no mames',
      partOfSpeech: 'expression',
      languageId: spanish.id,
    },
  });

  // Create sample definitions
  const def1 = await prisma.definition.create({
    data: {
      body: 'Suddenly cutting off all communication with someone without explanation',
      pronunciation: '/ˈɡoʊstɪŋ/',
      authorId: users[0].id,
      phraseId: phrase1.id,
      status: 'approved',
    },
  });

  const def2 = await prisma.definition.create({
    data: {
      body: 'Someone who does way too much for a person they like, hoping for romantic attention',
      pronunciation: '/sɪmp/',
      authorId: users[1].id,
      phraseId: phrase2.id,
      status: 'approved',
    },
  });

  const def3 = await prisma.definition.create({
    data: {
      body: 'Expression meaning "I wish I had that too" or "I wish we all had that"',
      pronunciation: '/ˈsaːna ˈɔːl/',
      authorId: users[2].id,
      phraseId: phrase3.id,
      status: 'approved',
    },
  });

  const def4 = await prisma.definition.create({
    data: {
      body: 'A gossip or someone who spreads rumors',
      pronunciation: '/t͡ʃɪsˈmoːsa/',
      authorId: users[3].id,
      phraseId: phrase4.id,
      status: 'approved',
    },
  });

  const def5 = await prisma.definition.create({
    data: {
      body: 'Expression of disbelief or surprise, literally "don\'t suck"',
      pronunciation: '/no ˈmames/',
      authorId: users[4].id,
      phraseId: phrase5.id,
      status: 'approved',
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

  console.log('Database seeded successfully!');
  console.log(`Created ${await prisma.user.count()} users`);
  console.log(`Created ${await prisma.language.count()} languages`);
  console.log(`Created ${await prisma.phrase.count()} phrases`);
  console.log(`Created ${await prisma.definition.count()} definitions`);
  console.log(`Created ${await prisma.example.count()} examples`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });