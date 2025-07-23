-- Add Tag table
CREATE TABLE IF NOT EXISTS "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT DEFAULT '#3B82F6',
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- Add PhraseTag junction table
CREATE TABLE IF NOT EXISTS "PhraseTag" (
    "phraseId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhraseTag_pkey" PRIMARY KEY ("phraseId","tagId")
);

-- Create unique constraint on tag name
CREATE UNIQUE INDEX IF NOT EXISTS "Tag_name_key" ON "Tag"("name");

-- Add foreign key constraints
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PhraseTag" ADD CONSTRAINT "PhraseTag_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "Phrase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PhraseTag" ADD CONSTRAINT "PhraseTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;