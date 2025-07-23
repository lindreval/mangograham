import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Trophy, TrendingUp } from "lucide-react";
import InfiniteSortableContributions from "@/components/InfiniteSortableContributions";
import { calculateUserReputation, getReputationLevel } from "@/lib/reputation";
import ReputationInfo from "@/components/ReputationInfo";
import Link from "next/link";

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params;
  const session = await getServerSession(authConfig);
  
  // Get user data by username and total counts
  const [userData, totalCounts] = await Promise.all([
    prisma.user.findUnique({
      where: { username: username },
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
    // Get user by username first to get the ID for counts
    prisma.user.findUnique({ where: { username: username } }).then(async (user) => {
      if (!user) return [[], [], []];
      
      return Promise.all([
        prisma.phrase.findMany({
          where: { authorId: user.id },
          include: {
            definitions: {
              include: {
                votes: true
              }
            }
          }
        }),
        prisma.definition.findMany({
          where: { authorId: user.id },
          include: {
            votes: true
          }
        }),
        prisma.example.findMany({
          where: { authorId: user.id },
          include: {
            votes: true
          }
        })
      ]);
    })
  ]);

  const [allPhrases, allDefinitions, allExamples] = totalCounts;

  if (!userData) {
    notFound();
  }

  // Calculate comprehensive stats using total data
  const definitionVoteScore = allDefinitions.reduce((total, def) => 
    total + def.votes.reduce((sum, vote) => sum + vote.value, 0), 0
  );
  
  const exampleVoteScore = allExamples.reduce((total, ex) => 
    total + ex.votes.reduce((sum, vote) => sum + vote.value, 0), 0
  );

  const totalUpvotes = definitionVoteScore + exampleVoteScore;
  const totalContributions = allPhrases.length + allDefinitions.length + allExamples.length;

  // Calculate actual reputation
  const reputationData = await calculateUserReputation(userData.id);
  const reputationLevel = getReputationLevel(reputationData.totalReputation);

  const joinDate = userData.createdAt;
  const isOwnProfile = session?.user?.id === userData.id;

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
                {isOwnProfile && (
                  <div className="self-center sm:self-auto">
                    <Link href="/profile" className="text-sm text-blue-600 hover:underline">
                      Edit Profile
                    </Link>
                  </div>
                )}
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <Card className="border-4 shadow-elevation-medium">
          <CardContent className="pt-4 md:pt-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-primary">{allPhrases.length}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Phrases Submitted</div>
          </CardContent>
        </Card>
        
        <Card className="border-4 shadow-elevation-medium">
          <CardContent className="pt-4 md:pt-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-primary">{allDefinitions.length}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Definitions Added</div>
          </CardContent>
        </Card>
        
        <Card className="border-4 shadow-elevation-medium">
          <CardContent className="pt-4 md:pt-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-primary">{allExamples.length}</div>
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
        userId={userData.id}
        totalCounts={{
          phrases: allPhrases.length,
          definitions: allDefinitions.length,
          examples: allExamples.length
        }}
      />
    </main>
  );
}