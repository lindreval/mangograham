import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Trophy, TrendingUp, Info } from "lucide-react";
import EditProfileModal from "@/components/EditProfileModal";
import SortableContributions from "@/components/SortableContributions";
import { calculateUserReputation, getReputationLevel } from "@/lib/reputation";

export default async function ProfilePage() {
  const session = await getServerSession(authConfig);
  
  if (!session?.user) {
    redirect("/");
  }

  const userId = session.user.id;
  
  // Get user data with their contributions
  const userData = await prisma.user.findUnique({
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
        orderBy: { createdAt: "desc" }
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
        orderBy: { createdAt: "desc" }
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
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!userData) {
    redirect("/");
  }

  // Calculate comprehensive stats
  const definitionVoteScore = userData.definitions.reduce((total, def) => 
    total + def.votes.reduce((sum, vote) => sum + vote.value, 0), 0
  );
  
  const exampleVoteScore = userData.examples.reduce((total, ex) => 
    total + ex.votes.reduce((sum, vote) => sum + vote.value, 0), 0
  );

  const totalUpvotes = definitionVoteScore + exampleVoteScore;
  const totalContributions = userData.phrases.length + userData.definitions.length + userData.examples.length;

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
                  {reputationData.totalReputation} reputation
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
            <div className="text-xl md:text-2xl font-bold text-primary">{userData.phrases.length}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Phrases Submitted</div>
          </CardContent>
        </Card>
        
        <Card className="border-4 shadow-elevation-medium">
          <CardContent className="pt-4 md:pt-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-primary">{userData.definitions.length}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Definitions Added</div>
          </CardContent>
        </Card>
        
        <Card className="border-4 shadow-elevation-medium">
          <CardContent className="pt-4 md:pt-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-primary">{userData.examples.length}</div>
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

      {/* Reputation Breakdown */}
      <Card className="border-4 shadow-elevation-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Reputation Breakdown
          </CardTitle>
          <CardDescription>
            How your reputation of {reputationData.totalReputation} points is calculated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {reputationData.breakdown.fromDefinitions}
              </div>
              <div className="text-sm text-muted-foreground">From Definitions</div>
              <div className="text-xs text-muted-foreground mt-1">
                {reputationData.definitionUpvotes} upvotes (+2 each), {reputationData.definitionDownvotes} downvotes (-1 each)
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {reputationData.breakdown.fromExamples}
              </div>
              <div className="text-sm text-muted-foreground">From Examples</div>
              <div className="text-xs text-muted-foreground mt-1">
                {reputationData.exampleUpvotes} upvotes (+1 each), {reputationData.exampleDownvotes} downvotes (-0.5 each)
              </div>
            </div>
            
            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="text-lg font-semibold text-purple-600">
                {reputationData.breakdown.fromPhrases}
              </div>
              <div className="text-sm text-muted-foreground">From Phrases</div>
              <div className="text-xs text-muted-foreground mt-1">
                {reputationData.approvedPhrases} approved phrases (+1 each)
              </div>
            </div>
          </div>
          
          {reputationLevel.nextLevel && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-sm font-medium mb-1">Next Level: {reputationLevel.nextLevel.name}</div>
              <div className="text-xs text-muted-foreground">
                Need {reputationLevel.nextLevel.minRep - reputationData.totalReputation} more reputation points
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, ((reputationData.totalReputation - reputationLevel.minRep) / (reputationLevel.nextLevel.minRep - reputationLevel.minRep)) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sortable Contributions Section */}
      <SortableContributions 
        phrases={userData.phrases}
        definitions={userData.definitions}
        examples={userData.examples}
      />
    </main>
  );
}