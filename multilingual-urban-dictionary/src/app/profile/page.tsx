import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Trophy, TrendingUp } from "lucide-react";
import EditProfileModal from "@/components/EditProfileModal";
import InfiniteSortableContributions from "@/components/InfiniteSortableContributions";
import { calculateUserReputation, getReputationLevel } from "@/lib/reputation";
import ReputationInfo from "@/components/ReputationInfo";
import { AchievementService } from "@/lib/achievements";
import { CompletedAchievementsRow } from "@/components/achievements/AchievementsGrid";
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
  // Use count queries instead of fetching all data for stats
  const [userData, counts, voteStats, userAchievements] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        phrases: {
          include: {
            language: true,
            definitions: {
              include: {
                votes: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        definitions: {
          include: {
            phrase: {
              include: {
                language: true
              }
            },
            votes: true,
            examples: true
          },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        examples: {
          include: {
            definition: {
              include: {
                phrase: {
                  include: {
                    language: true
                  }
                }
              }
            },
            votes: true
          },
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    }),
    // Get counts efficiently using count queries (not fetching all data)
    Promise.all([
      prisma.phrase.count({ where: { authorId: userId } }),
      prisma.definition.count({ where: { authorId: userId } }),
      prisma.example.count({ where: { authorId: userId } })
    ]),
    // Get total vote scores using aggregation
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
    // Get user achievements (with initialization)
    (async () => {
      await AchievementService.ensureUserInitialized(userId);
      return AchievementService.getUserAchievements(userId);
    })()
  ]);

  const [phraseCount, definitionCount, exampleCount] = counts;

  if (!userData) {
    redirect("/");
  }

  // Debug: Log achievement data in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Profile Debug:', {
      userId,
      userAchievementsCount: userAchievements.length,
      completedCount: userAchievements.filter(ua => ua.isCompleted).length
    });
  }

  // Calculate stats from optimized queries
  const definitionVoteScore = Number(voteStats[0]?.def_score ?? 0);
  const exampleVoteScore = Number(voteStats[0]?.ex_score ?? 0);

  const totalUpvotes = definitionVoteScore + exampleVoteScore;
  const totalContributions = phraseCount + definitionCount + exampleCount;

  // Calculate actual reputation
  const reputationData = await calculateUserReputation(userId);
  const reputationLevel = getReputationLevel(reputationData.totalReputation);

  // Update user's reputation in database
  await prisma.user.update({
    where: { id: userId },
    data: { reputation: reputationData.totalReputation },
  });
  const joinDate = userData.createdAt;

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Enhanced User Info Section */}
      <Card className="border-4 shadow-elevation-medium">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
            {userData.image && (
              <Image 
                src={userData.image} 
                alt={userData.name || "User avatar"} 
                width={80}
                height={80}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-primary/20 mx-auto sm:mx-0"
              />
            )}
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold">{userData.name || "Anonymous User"}</h1>
                  <Badge className={`${reputationLevel.color} text-white self-center sm:self-auto`}>
                    <Trophy className="w-3 h-3 mr-1" />
                    {reputationLevel.level}
                  </Badge>
                </div>
                <div className="self-center sm:self-auto">
                  <EditProfileModal user={{
                    name: userData.name,
                    username: userData.username,
                    bio: userData.bio,
                    location: userData.location,
                    languagesSpoken: userData.languagesSpoken
                  }} />
                </div>
              </div>
              
              {userData.username && (
                <p className="text-lg text-muted-foreground mb-1">@{userData.username}</p>
              )}
              
              {userData.bio && (
                <p className="text-muted-foreground mb-3">{userData.bio}</p>
              )}
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  Joined {joinDate.toLocaleDateString()}
                </div>
                
                {userData.location && (
                  <div>📍 {userData.location}</div>
                )}
                
                {userData.languagesSpoken.length > 0 && (
                  <div>🗣️ {userData.languagesSpoken.join(", ")}</div>
                )}
                
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <ReputationInfo reputationData={reputationData} reputationLevel={reputationLevel} />
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Achievements ({userAchievements.length} total, {userAchievements.filter(ua => ua.isCompleted).length} completed)
                </div>
                {userAchievements.filter(ua => ua.isCompleted).length > 0 ? (
                  <CompletedAchievementsRow 
                    userAchievements={userAchievements}
                    maxDisplay={6}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No achievements completed yet. Start by creating definitions or voting on content!
                  </div>
                )}
                {/* Debug info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 text-xs text-gray-400">
                    Debug: {userAchievements.length} achievements loaded
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <Card className="border-4 shadow-elevation-medium">
          <CardContent className="pt-4 md:pt-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-primary">{phraseCount}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Phrases Submitted</div>
          </CardContent>
        </Card>

        <Card className="border-4 shadow-elevation-medium">
          <CardContent className="pt-4 md:pt-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-primary">{definitionCount}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Definitions Added</div>
          </CardContent>
        </Card>

        <Card className="border-4 shadow-elevation-medium">
          <CardContent className="pt-4 md:pt-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-primary">{exampleCount}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Examples Contributed</div>
          </CardContent>
        </Card>
        
        <Card className="border-4 shadow-elevation-medium">
          <CardContent className="pt-4 md:pt-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-green-600">{totalUpvotes}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Total Upvotes</div>
          </CardContent>
        </Card>
        
        <Card className="border-4 shadow-elevation-medium">
          <CardContent className="pt-4 md:pt-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-purple-600">{totalContributions}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Total Contributions</div>
          </CardContent>
        </Card>
      </div>


      {/* Infinite Sortable Contributions Section */}
      <InfiniteSortableContributions
        initialPhrases={userData.phrases}
        initialDefinitions={userData.definitions}
        initialExamples={userData.examples}
        totalCounts={{
          phrases: phraseCount,
          definitions: definitionCount,
          examples: exampleCount
        }}
      />
    </main>
  );
}