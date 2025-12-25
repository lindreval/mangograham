import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import {
  CalendarDays,
  Trophy,
  TrendingUp,
  Sparkles,
  User,
} from "lucide-react";
import EditProfileModal from "@/components/EditProfileModal";
import InfiniteSortableContributions from "@/components/InfiniteSortableContributions";
import { calculateUserReputation, getReputationLevel } from "@/lib/reputation";
import ReputationInfo from "@/components/ReputationInfo";
import { AchievementService } from "@/lib/achievements";
import { CompletedAchievementsRow } from "@/components/achievements/AchievementsGrid";
import { PageHeader, PageBadge } from "@/components/ui/page-header";
import { ProfileStatsGrid } from "@/components/profile/ProfileStatsGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description: "View and edit your profile, contributions, and reputation",
};

export default async function ProfilePage() {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    redirect("/");
  }

  const userId = session.user.id;

  // Get user data with their contributions, counts, and achievements in parallel
  const [userData, counts, voteStats, userAchievements] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
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
    Promise.all([
      prisma.phrase.count({ where: { authorId: userId } }),
      prisma.definition.count({ where: { authorId: userId } }),
      prisma.example.count({ where: { authorId: userId } }),
    ]),
    prisma.$queryRaw<{ def_score: bigint; ex_score: bigint }[]>`
      SELECT
        COALESCE((
          SELECT SUM(dv.value)
          FROM "Definition" d
          JOIN "DefinitionVote" dv ON d.id = dv."definitionId"
          WHERE d."authorId" = ${userId}
        ), 0) as def_score,
        COALESCE((
          SELECT SUM(ev.value)
          FROM "Example" e
          JOIN "ExampleVote" ev ON e.id = ev."exampleId"
          WHERE e."authorId" = ${userId}
        ), 0) as ex_score
    `,
    (async () => {
      await AchievementService.ensureUserInitialized(userId);
      return AchievementService.getUserAchievements(userId);
    })(),
  ]);

  const [phraseCount, definitionCount, exampleCount] = counts;

  if (!userData) {
    redirect("/");
  }

  const definitionVoteScore = Number(voteStats[0]?.def_score ?? 0);
  const exampleVoteScore = Number(voteStats[0]?.ex_score ?? 0);

  const totalUpvotes = definitionVoteScore + exampleVoteScore;
  const totalContributions = phraseCount + definitionCount + exampleCount;

  const reputationData = await calculateUserReputation(userId);
  const reputationLevel = getReputationLevel(reputationData.totalReputation);

  await prisma.user.update({
    where: { id: userId },
    data: { reputation: reputationData.totalReputation },
  });

  const joinDate = userData.createdAt;
  const completedAchievements = userAchievements.filter((ua) => ua.isCompleted);

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6 space-y-6 md:space-y-8">
      <PageHeader
        title="Your Profile"
        subtitle="Track your contributions and reputation"
        badge={
          <PageBadge>
            <User className="w-3 h-3 mr-1.5" />
            Personal Dashboard
          </PageBadge>
        }
        action={
          <EditProfileModal
            user={{
              name: userData.name,
              username: userData.username,
              bio: userData.bio,
              location: userData.location,
              languagesSpoken: userData.languagesSpoken,
            }}
          />
        }
      />

      {/* Profile Card */}
      <div className="rounded-xl border-2 border-primary/20 bg-card shadow-card overflow-hidden animate-page-enter relative">
        {/* Subtle gradient background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.04] pointer-events-none" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

        <div className="h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />
        <div className="p-6 md:p-8 relative">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {userData.image && (
              <div className="relative mx-auto sm:mx-0 group">
                {/* Decorative glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 via-primary/20 to-primary/40 blur-md scale-110 opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                <div className="absolute inset-0 rounded-full ring-2 ring-primary/30 ring-offset-2 ring-offset-card scale-[1.15]" />
                <Image
                  src={userData.image}
                  alt={userData.name || "User avatar"}
                  width={96}
                  height={96}
                  className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-primary/20 shadow-card transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                  <Trophy className="w-4 h-4" />
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
                  <CalendarDays className="w-4 h-4 text-primary" />
                  Joined {joinDate.toLocaleDateString()}
                </div>

                {userData.location && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-primary">📍</span>
                    {userData.location}
                  </div>
                )}

                {userData.languagesSpoken.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-primary">🗣️</span>
                    {userData.languagesSpoken.join(", ")}
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <ReputationInfo
                    reputationData={reputationData}
                    reputationLevel={reputationLevel}
                  />
                </div>
              </div>

              {/* Achievements Section */}
              {userAchievements.length > 0 && (
                <div className="mt-6 pt-6 border-t border-primary/10">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Achievements ({completedAchievements.length}/
                    {userAchievements.length})
                  </div>
                  {completedAchievements.length > 0 ? (
                    <CompletedAchievementsRow
                      userAchievements={userAchievements}
                      maxDisplay={6}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No achievements completed yet. Start contributing to
                      unlock them!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <ProfileStatsGrid
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
