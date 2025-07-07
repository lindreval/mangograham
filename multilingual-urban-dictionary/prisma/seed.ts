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

  const korean = await prisma.language.upsert({
    where: { isoCode: 'ko' },
    update: {},
    create: {
      name: 'Korean',
      isoCode: 'ko',
    },
  });

  // Create comprehensive slang phrases
  
  // Spanish phrases
  const spanishPhrases = await Promise.all([
    prisma.phrase.create({
      data: {
        textOriginal: 'güey',
        normalized: 'guey',
        partOfSpeech: 'noun',
        languageId: spanish.id,
      },
    }),
    prisma.phrase.create({
      data: {
        textOriginal: 'pinche',
        normalized: 'pinche',
        partOfSpeech: 'adjective',
        languageId: spanish.id,
      },
    }),
    prisma.phrase.create({
      data: {
        textOriginal: 'churro',
        normalized: 'churro',
        partOfSpeech: 'noun',
        languageId: spanish.id,
      },
    }),
    prisma.phrase.create({
      data: {
        textOriginal: 'fresa',
        normalized: 'fresa',
        partOfSpeech: 'noun',
        languageId: spanish.id,
      },
    }),
    prisma.phrase.create({
      data: {
        textOriginal: 'estar cañón',
        normalized: 'estar canon',
        partOfSpeech: 'expression',
        languageId: spanish.id,
      },
    }),
  ]);

  // Tagalog phrases
  const tagalogPhrases = await Promise.all([
    prisma.phrase.create({
      data: {
        textOriginal: 'petmalu',
        normalized: 'petmalu',
        partOfSpeech: 'adjective',
        languageId: tagalog.id,
      },
    }),
    prisma.phrase.create({
      data: {
        textOriginal: 'ghosting',
        normalized: 'ghosting',
        partOfSpeech: 'verb',
        languageId: tagalog.id,
      },
    }),
    prisma.phrase.create({
      data: {
        textOriginal: 'pa-fall',
        normalized: 'pa fall',
        partOfSpeech: 'verb',
        languageId: tagalog.id,
      },
    }),
    prisma.phrase.create({
      data: {
        textOriginal: 'werpa',
        normalized: 'werpa',
        partOfSpeech: 'interjection',
        languageId: tagalog.id,
      },
    }),
    prisma.phrase.create({
      data: {
        textOriginal: 'beshie',
        normalized: 'beshie',
        partOfSpeech: 'noun',
        languageId: tagalog.id,
      },
    }),
  ]);

  // Korean phrases
  const koreanPhrases = await Promise.all([
    prisma.phrase.create({
      data: {
        textOriginal: '대박',
        normalized: '대박',
        partOfSpeech: 'interjection',
        languageId: korean.id,
      },
    }),
    prisma.phrase.create({
      data: {
        textOriginal: '썸타다',
        normalized: '썸타다',
        partOfSpeech: 'verb',
        languageId: korean.id,
      },
    }),
    prisma.phrase.create({
      data: {
        textOriginal: '엄친아',
        normalized: '엄친아',
        partOfSpeech: 'noun',
        languageId: korean.id,
      },
    }),
    prisma.phrase.create({
      data: {
        textOriginal: '헬조선',
        normalized: '헬조선',
        partOfSpeech: 'noun',
        languageId: korean.id,
      },
    }),
    prisma.phrase.create({
      data: {
        textOriginal: '갑분싸',
        normalized: '갑분싸',
        partOfSpeech: 'expression',
        languageId: korean.id,
      },
    }),
  ]);

  // Create comprehensive definitions
  
  // Spanish definitions
  const spanishDefinitions = await Promise.all([
    prisma.definition.create({
      data: {
        body: 'Dude, guy, buddy - casual way to address someone',
        pronunciation: '/ˈɡwei/',
        mediaUrl: 'https://example.com/guey-pronunciation.mp3',
        authorId: users[0].id,
        phraseId: spanishPhrases[0].id,
        status: 'approved',
      },
    }),
    prisma.definition.create({
      data: {
        body: 'Damn, fucking - intensifier used before nouns or adjectives',
        pronunciation: '/ˈpint͡ʃe/',
        authorId: users[1].id,
        phraseId: spanishPhrases[1].id,
        status: 'approved',
      },
    }),
    prisma.definition.create({
      data: {
        body: 'Attractive person, hottie - someone who is good-looking',
        pronunciation: '/ˈt͡ʃuro/',
        authorId: users[2].id,
        phraseId: spanishPhrases[2].id,
        status: 'approved',
      },
    }),
    prisma.definition.create({
      data: {
        body: 'Preppy, posh person - someone from upper class who acts snobbish',
        pronunciation: '/ˈfresa/',
        authorId: users[3].id,
        phraseId: spanishPhrases[3].id,
        status: 'approved',
      },
    }),
    prisma.definition.create({
      data: {
        body: 'To be awesome, cool, or difficult - depends on context',
        pronunciation: '/esˈtar kaˈɲon/',
        authorId: users[4].id,
        phraseId: spanishPhrases[4].id,
        status: 'approved',
      },
    }),
  ]);

  // Tagalog definitions
  const tagalogDefinitions = await Promise.all([
    prisma.definition.create({
      data: {
        body: 'Awesome, cool, amazing - positive slang for something impressive',
        pronunciation: '/ˈpetmalu/',
        authorId: users[5].id,
        phraseId: tagalogPhrases[0].id,
        status: 'approved',
      },
    }),
    prisma.definition.create({
      data: {
        body: 'Suddenly cutting off communication without explanation',
        pronunciation: '/ˈɡoʊstɪŋ/',
        authorId: users[6].id,
        phraseId: tagalogPhrases[1].id,
        status: 'approved',
      },
    }),
    prisma.definition.create({
      data: {
        body: 'To make someone fall in love, to seduce',
        pronunciation: '/pa fal/',
        authorId: users[7].id,
        phraseId: tagalogPhrases[2].id,
        status: 'approved',
      },
    }),
    prisma.definition.create({
      data: {
        body: 'Expression of amazement or excitement, like "wow"',
        pronunciation: '/ˈwerpa/',
        authorId: users[8].id,
        phraseId: tagalogPhrases[3].id,
        status: 'approved',
      },
    }),
    prisma.definition.create({
      data: {
        body: 'Best friend, bestie - close friend',
        pronunciation: '/ˈbɛʃi/',
        authorId: users[9].id,
        phraseId: tagalogPhrases[4].id,
        status: 'approved',
      },
    }),
  ]);

  // Korean definitions
  const koreanDefinitions = await Promise.all([
    prisma.definition.create({
      data: {
        body: 'Awesome, amazing, jackpot - expression of excitement',
        pronunciation: '/tɛˈbak/',
        authorId: users[0].id,
        phraseId: koreanPhrases[0].id,
        status: 'approved',
      },
    }),
    prisma.definition.create({
      data: {
        body: 'To have a "some" relationship - more than friends but not dating',
        pronunciation: '/sʌmˈtʰada/',
        authorId: users[1].id,
        phraseId: koreanPhrases[1].id,
        status: 'approved',
      },
    }),
    prisma.definition.create({
      data: {
        body: 'Perfect son that mothers brag about - abbreviated from "엄마 친구 아들"',
        pronunciation: '/ʌmˈt͡ʃʰina/',
        authorId: users[2].id,
        phraseId: koreanPhrases[2].id,
        status: 'approved',
      },
    }),
    prisma.definition.create({
      data: {
        body: 'Hell Korea - criticizing difficult living conditions in Korea',
        pronunciation: '/hɛlˈt͡ʃoson/',
        authorId: users[3].id,
        phraseId: koreanPhrases[3].id,
        status: 'approved',
      },
    }),
    prisma.definition.create({
      data: {
        body: 'Suddenly awkward atmosphere - when mood becomes uncomfortable',
        pronunciation: '/kapˈbunsʰa/',
        authorId: users[4].id,
        phraseId: koreanPhrases[4].id,
        status: 'approved',
      },
    }),
  ]);

  // Create comprehensive examples for all definitions
  await prisma.example.createMany({
    data: [
      // Spanish examples
      {
        text: '¿Qué onda, güey? ¿Cómo estás?',
        translation: 'What\'s up, dude? How are you?',
        authorId: users[0].id,
        definitionId: spanishDefinitions[0].id,
      },
      {
        text: 'Oye güey, ¿vienes a la fiesta?',
        translation: 'Hey dude, are you coming to the party?',
        authorId: users[5].id,
        definitionId: spanishDefinitions[0].id,
      },
      {
        text: 'Ese pinche examen estuvo muy difícil.',
        translation: 'That damn exam was very difficult.',
        authorId: users[1].id,
        definitionId: spanishDefinitions[1].id,
      },
      {
        text: '¡Pinche tráfico! Voy a llegar tarde.',
        translation: 'Damn traffic! I\'m going to be late.',
        authorId: users[6].id,
        definitionId: spanishDefinitions[1].id,
      },
      {
        text: 'Está bien churro ese actor de telenovelas.',
        translation: 'That soap opera actor is really hot.',
        authorId: users[2].id,
        definitionId: spanishDefinitions[2].id,
      },
      {
        text: 'Mi prima dice que su novio está bien churro.',
        translation: 'My cousin says her boyfriend is really attractive.',
        authorId: users[7].id,
        definitionId: spanishDefinitions[2].id,
      },
      {
        text: 'No me gusta esa chica, es muy fresa.',
        translation: 'I don\'t like that girl, she\'s very snobbish.',
        authorId: users[3].id,
        definitionId: spanishDefinitions[3].id,
      },
      {
        text: 'Los niños fresas de esa escuela privada son insoportables.',
        translation: 'The preppy kids from that private school are unbearable.',
        authorId: users[8].id,
        definitionId: spanishDefinitions[3].id,
      },
      {
        text: 'Está cañón ese videojuego, no puedo pasarlo.',
        translation: 'That video game is tough, I can\'t beat it.',
        authorId: users[4].id,
        definitionId: spanishDefinitions[4].id,
      },
      {
        text: 'Tu carro nuevo está cañón, hermano.',
        translation: 'Your new car is awesome, brother.',
        authorId: users[9].id,
        definitionId: spanishDefinitions[4].id,
      },
      
      // Tagalog examples
      {
        text: 'Petmalu yung concert kagabi!',
        translation: 'Last night\'s concert was amazing!',
        authorId: users[0].id,
        definitionId: tagalogDefinitions[0].id,
      },
      {
        text: 'Petmalu ng new phone mo, pre!',
        translation: 'Your new phone is awesome, bro!',
        authorId: users[5].id,
        definitionId: tagalogDefinitions[0].id,
      },
      {
        text: 'Nag-ghosting nanaman si kuya sa ex niya.',
        translation: 'My brother is ghosting his ex again.',
        authorId: users[1].id,
        definitionId: tagalogDefinitions[1].id,
      },
      {
        text: 'Bakit ka nag-ghosting? Hindi ka man lang nag-reply.',
        translation: 'Why did you ghost me? You didn\'t even reply.',
        authorId: users[6].id,
        definitionId: tagalogDefinitions[1].id,
      },
      {
        text: 'Nag-pa-fall siya sa akin tapos may girlfriend na pala.',
        translation: 'He made me fall for him then turns out he has a girlfriend.',
        authorId: users[2].id,
        definitionId: tagalogDefinitions[2].id,
      },
      {
        text: 'Huwag kang mag-pa-fall kung hindi ka naman serious.',
        translation: 'Don\'t make someone fall for you if you\'re not serious.',
        authorId: users[7].id,
        definitionId: tagalogDefinitions[2].id,
      },
      {
        text: 'Werpa! Nanalo ako sa raffle!',
        translation: 'Awesome! I won the raffle!',
        authorId: users[3].id,
        definitionId: tagalogDefinitions[3].id,
      },
      {
        text: 'Werpa naman yang grade mo sa exam!',
        translation: 'Wow, your exam grade is amazing!',
        authorId: users[8].id,
        definitionId: tagalogDefinitions[3].id,
      },
      {
        text: 'Beshie, tara na, late na tayo!',
        translation: 'Bestie, let\'s go, we\'re already late!',
        authorId: users[4].id,
        definitionId: tagalogDefinitions[4].id,
      },
      {
        text: 'Salamat beshie sa tulong mo.',
        translation: 'Thanks bestie for your help.',
        authorId: users[9].id,
        definitionId: tagalogDefinitions[4].id,
      },
      
      // Korean examples
      {
        text: '대박! 로또에 당첨됐어!',
        translation: 'Awesome! I won the lottery!',
        authorId: users[0].id,
        definitionId: koreanDefinitions[0].id,
      },
      {
        text: '이 영화 진짜 대박이야!',
        translation: 'This movie is really amazing!',
        authorId: users[5].id,
        definitionId: koreanDefinitions[0].id,
      },
      {
        text: '우리 썸타고 있는 것 같은데...',
        translation: 'I think we\'re in a "some" relationship...',
        authorId: users[1].id,
        definitionId: koreanDefinitions[1].id,
      },
      {
        text: '썸타다가 사귀게 된 커플이야.',
        translation: 'They\'re a couple who started dating after a "some" relationship.',
        authorId: users[6].id,
        definitionId: koreanDefinitions[1].id,
      },
      {
        text: '엄친아는 공부도 잘하고 운동도 잘해.',
        translation: 'The perfect son is good at both studying and sports.',
        authorId: users[2].id,
        definitionId: koreanDefinitions[2].id,
      },
      {
        text: '또 엄친아 이야기 하시네, 엄마가.',
        translation: 'Mom is talking about the perfect son again.',
        authorId: users[7].id,
        definitionId: koreanDefinitions[2].id,
      },
      {
        text: '헬조선에서 살기 정말 힘들다.',
        translation: 'It\'s really hard to live in Hell Korea.',
        authorId: users[3].id,
        definitionId: koreanDefinitions[3].id,
      },
      {
        text: '헬조선 탈출하고 싶어.',
        translation: 'I want to escape Hell Korea.',
        authorId: users[8].id,
        definitionId: koreanDefinitions[3].id,
      },
      {
        text: '파티에서 갑분싸 되었어.',
        translation: 'The party suddenly became awkward.',
        authorId: users[4].id,
        definitionId: koreanDefinitions[4].id,
      },
      {
        text: '왜 갑분싸야? 뭔 일 있어?',
        translation: 'Why is it suddenly awkward? What happened?',
        authorId: users[9].id,
        definitionId: koreanDefinitions[4].id,
      },
    ],
  });

  // Create voting data for definitions and examples
  await prisma.definitionVote.createMany({
    data: [
      // Spanish definition votes
      { userId: users[0].id, definitionId: spanishDefinitions[0].id, value: 1 },
      { userId: users[1].id, definitionId: spanishDefinitions[0].id, value: 1 },
      { userId: users[2].id, definitionId: spanishDefinitions[0].id, value: -1 },
      { userId: users[3].id, definitionId: spanishDefinitions[1].id, value: 1 },
      { userId: users[4].id, definitionId: spanishDefinitions[1].id, value: 1 },
      { userId: users[5].id, definitionId: spanishDefinitions[2].id, value: 1 },
      { userId: users[6].id, definitionId: spanishDefinitions[2].id, value: 1 },
      { userId: users[7].id, definitionId: spanishDefinitions[2].id, value: 1 },
      { userId: users[8].id, definitionId: spanishDefinitions[3].id, value: -1 },
      { userId: users[9].id, definitionId: spanishDefinitions[4].id, value: 1 },
      
      // Tagalog definition votes
      { userId: users[1].id, definitionId: tagalogDefinitions[0].id, value: 1 },
      { userId: users[2].id, definitionId: tagalogDefinitions[0].id, value: 1 },
      { userId: users[3].id, definitionId: tagalogDefinitions[0].id, value: 1 },
      { userId: users[4].id, definitionId: tagalogDefinitions[1].id, value: 1 },
      { userId: users[5].id, definitionId: tagalogDefinitions[1].id, value: 1 },
      { userId: users[6].id, definitionId: tagalogDefinitions[2].id, value: 1 },
      { userId: users[7].id, definitionId: tagalogDefinitions[2].id, value: -1 },
      { userId: users[8].id, definitionId: tagalogDefinitions[3].id, value: 1 },
      { userId: users[9].id, definitionId: tagalogDefinitions[3].id, value: 1 },
      { userId: users[0].id, definitionId: tagalogDefinitions[4].id, value: 1 },
      
      // Korean definition votes
      { userId: users[2].id, definitionId: koreanDefinitions[0].id, value: 1 },
      { userId: users[3].id, definitionId: koreanDefinitions[0].id, value: 1 },
      { userId: users[4].id, definitionId: koreanDefinitions[0].id, value: 1 },
      { userId: users[5].id, definitionId: koreanDefinitions[0].id, value: 1 },
      { userId: users[6].id, definitionId: koreanDefinitions[1].id, value: 1 },
      { userId: users[7].id, definitionId: koreanDefinitions[1].id, value: 1 },
      { userId: users[8].id, definitionId: koreanDefinitions[2].id, value: -1 },
      { userId: users[9].id, definitionId: koreanDefinitions[2].id, value: 1 },
      { userId: users[0].id, definitionId: koreanDefinitions[3].id, value: 1 },
      { userId: users[1].id, definitionId: koreanDefinitions[4].id, value: 1 },
    ],
  });

  // Get example IDs for voting (we need to query them since we used createMany)
  const examples = await prisma.example.findMany({
    select: { id: true },
  });

  await prisma.exampleVote.createMany({
    data: [
      // Sample example votes
      { userId: users[0].id, exampleId: examples[0].id, value: 1 },
      { userId: users[1].id, exampleId: examples[0].id, value: 1 },
      { userId: users[2].id, exampleId: examples[1].id, value: 1 },
      { userId: users[3].id, exampleId: examples[1].id, value: -1 },
      { userId: users[4].id, exampleId: examples[2].id, value: 1 },
      { userId: users[5].id, exampleId: examples[3].id, value: 1 },
      { userId: users[6].id, exampleId: examples[4].id, value: 1 },
      { userId: users[7].id, exampleId: examples[5].id, value: 1 },
      { userId: users[8].id, exampleId: examples[6].id, value: 1 },
      { userId: users[9].id, exampleId: examples[7].id, value: -1 },
      { userId: users[0].id, exampleId: examples[8].id, value: 1 },
      { userId: users[1].id, exampleId: examples[9].id, value: 1 },
      { userId: users[2].id, exampleId: examples[10].id, value: 1 },
      { userId: users[3].id, exampleId: examples[11].id, value: 1 },
      { userId: users[4].id, exampleId: examples[12].id, value: 1 },
    ],
  });

  console.log('Database seeded successfully!');
  console.log(`Created ${await prisma.user.count()} users`);
  console.log(`Created ${await prisma.language.count()} languages`);
  console.log(`Created ${await prisma.phrase.count()} phrases`);
  console.log(`Created ${await prisma.definition.count()} definitions`);
  console.log(`Created ${await prisma.example.count()} examples`);
  console.log(`Created ${await prisma.definitionVote.count()} definition votes`);
  console.log(`Created ${await prisma.exampleVote.count()} example votes`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });