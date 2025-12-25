import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Trophy,
  TrendingUp,
  Sparkles,
  Users,
  ArrowRight,
} from "lucide-react";
import InfiniteSortableContributions from "@/components/InfiniteSortableContributions";
import { calculateUserReputation, getReputationLevel } from "@/lib/reputation";
import ReputationInfo from "@/components/ReputationInfo";
import { AchievementService } from "@/lib/achievements";
import { CompletedAchievementsRow } from "@/components/achievements/AchievementsGrid";
import { PageHeader, PageBadge } from "@/components/ui/page-header";
import { UserProfileStatsGrid } from "@/components/profile/UserProfileStatsGrid";
import type { Metadata } from "next";

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({
  params,
}: UserProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, username: true },
  });

  if (!user) {
    return { title: "User Not Found" };
  }

  return {
    title: `${user.name || user.username} | Community Member`,
    description: `View ${user.name || user.username}'s contributions to the community`,
  };
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const { username } = await params;
  const session = await getServerSession(authConfig);

  // Combined query - removed redundant initial lookup
  // Query directly by username instead of id
  const [userData, counts, voteStats, userAchievements] = await Promise.all([
    prisma.user.findUnique({
      where: { username },
      include: {
        phrases: {
          include: {
            language: true,
            definitions: {
              include: {
                votes: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        definitions: {
          include: {
            phrase: {
              include: {
                language: true,
              },
            },
            votes: true,
            examples: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        examples: {
          include: {
            definition: {
              include: {
                phrase: {
                  include: {
                    language: true,
                  },
                },
              },
            },
            votes: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    }),
    // Get counts using _count instead of separate queries
    prisma.user
      .findUnique({
        where: { username },
        select: {
          _count: {
            select: { phrases: true, definitions: true, examples: true },
          },
        },
      })
      .then((user) =>
        user
          ? [user._count.phrases, user._count.definitions, user._count.examples]
          : [0, 0, 0]
      ),
    // Use username in raw query to avoid extra lookup
    prisma.$queryRaw<{ def_score: bigint; ex_score: bigint }[]>`
      SELECT
        COALESCE((
          SELECT SUM(dv.value)
          FROM "Definition" d
          JOIN "DefinitionVote" dv ON d.id = dv."definitionId"
          WHERE d."authorId" = (SELECT id FROM "User" WHERE username = ${username})
        ), 0) as def_score,
        COALESCE((
          SELECT SUM(ev.value)
          FROM "Example" e
          JOIN "ExampleVote" ev ON e.id = ev."exampleId"
          WHERE e."authorId" = (SELECT id FROM "User" WHERE username = ${username})
        ), 0) as ex_score
    `,
    // Initialize achievements using username lookup
    (async () => {
      const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });
      if (!user) return [];
      await AchievementService.ensureUserInitialized(user.id);
      return AchievementService.getUserAchievements(user.id);
    })(),
  ]);

  if (!userData) {
    notFound();
  }

  const [phraseCount, definitionCount, exampleCount] = counts;

  const definitionVoteScore = Number(voteStats[0]?.def_score ?? 0);
  const exampleVoteScore = Number(voteStats[0]?.ex_score ?? 0);

  const totalUpvotes = definitionVoteScore + exampleVoteScore;
  const totalContributions = phraseCount + definitionCount + exampleCount;

  const reputationData = await calculateUserReputation(userData.id);
  const reputationLevel = getReputationLevel(reputationData.totalReputation);

  const joinDate = userData.createdAt;
  const isOwnProfile = session?.user?.id === userData.id;
  const completedAchievements = userAchievements.filter((ua) => ua.isCompleted);

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6 space-y-6 md:space-y-8">
      <PageHeader
        title={userData.name || userData.username || "Community Member"}
        subtitle={`Community contributor since ${joinDate.toLocaleDateString()}`}
        badge={
          <PageBadge>
            <Users className="w-3 h-3 mr-1.5" />
            Community Member
          </PageBadge>
        }
        action={
          isOwnProfile ? (
            <Link
              href="/profile"
              className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-semibold text-sm shadow-card hover:shadow-card-hover transition-all duration-[var(--duration-hover)] ease-[var(--ease-smooth)] hover:-translate-y-0.5"
            >
              Edit Profile
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : null
        }
      />

      {/* Profile Card - Observer View */}
      <div className="rounded-xl border-2 border-primary/20 bg-card shadow-card overflow-hidden animate-page-enter relative">
        {/* Subtle gradient background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] via-transparent to-primary/[0.03] pointer-events-none" />
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/[0.02] rounded-full blur-3xl -translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
        <div className="p-6 md:p-8 relative">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {userData.image ? (
              <div className="relative mx-auto sm:mx-0 group">
                {/* Subtle decorative glow for community members */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 via-primary/15 to-primary/30 blur-md scale-105 opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                <Image
                  src={userData.image}
                  alt={userData.name || "User avatar"}
                  width={96}
                  height={96}
                  className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-primary/10 shadow-card transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="relative mx-auto sm:mx-0 group">
                <div className="absolute inset-0 rounded-full bg-primary/10 blur-md scale-105 opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                  <Users className="w-10 h-10 text-primary/50" />
                </div>
              </div>
            )}

            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  {userData.name || "Anonymous User"}
                </h2>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white self-center sm:self-auto ${reputationLevel.color}`}
                >
                  <Trophy className="w-3 h-3 mr-1" />
                  {reputationLevel.level}
                </span>
              </div>

              {userData.username && (
                <p className="text-lg text-muted-foreground mb-2">
                  @{userData.username}
                </p>
              )}

              {userData.bio && (
                <p className="text-card-foreground/80 mb-4 max-w-xl">
                  {userData.bio}
                </p>
              )}

              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-primary/60" />
                  Joined {joinDate.toLocaleDateString()}
                </div>

                {userData.location && (
                  <div className="flex items-center gap-1.5">
                    <span>📍</span>
                    {userData.location}
                  </div>
                )}

                {userData.languagesSpoken.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span>🗣️</span>
                    {userData.languagesSpoken.join(", ")}
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-primary/60" />
                  <ReputationInfo
                    reputationData={reputationData}
                    reputationLevel={reputationLevel}
                  />
                </div>
              </div>

              {/* Achievements - Compact Display */}
              {completedAchievements.length > 0 && (
                <div className="mt-6 pt-6 border-t border-primary/10">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                    <Sparkles className="w-4 h-4 text-primary/60" />
                    Achievements Unlocked ({completedAchievements.length})
                  </div>
                  <CompletedAchievementsRow
                    userAchievements={userAchievements}
                    maxDisplay={8}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Community Impact Stats - Emphasis on contributions */}
      <UserProfileStatsGrid
        phraseCount={phraseCount}
        definitionCount={definitionCount}
        exampleCount={exampleCount}
        totalUpvotes={totalUpvotes}
        totalContributions={totalContributions}
      />

      {/* Contributions Section */}
      <div className="animate-page-enter" style={{ animationDelay: "0.4s" }}>
        <InfiniteSortableContributions
          initialPhrases={userData.phrases}
          initialDefinitions={userData.definitions}
          initialExamples={userData.examples}
          userId={userData.id}
          totalCounts={{
            phrases: phraseCount,
            definitions: definitionCount,
            examples: exampleCount,
          }}
        />
      </div>
    </main>
  );
}
