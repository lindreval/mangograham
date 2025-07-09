"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ReputationData {
  totalReputation: number;
  breakdown: {
    fromDefinitions: number;
    fromExamples: number;
    fromPhrases: number;
  };
  definitionUpvotes: number;
  definitionDownvotes: number;
  exampleUpvotes: number;
  exampleDownvotes: number;
  approvedPhrases: number;
}

interface ReputationLevel {
  level: string;
  color: string;
  minRep: number;
  nextLevel?: {
    name: string;
    minRep: number;
  };
}

interface Props {
  reputationData: ReputationData;
  reputationLevel: ReputationLevel;
}

export default function ReputationInfo({ reputationData, reputationLevel }: Props) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1">
        <span>{reputationData.totalReputation} reputation</span>
        <button
          onClick={() => setShowBreakdown(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Reputation Breakdown Modal */}
      {showBreakdown && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="border-4 shadow-elevation-medium max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Reputation Breakdown
                </CardTitle>
                <button
                  onClick={() => setShowBreakdown(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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
        </div>
      )}
    </>
  );
}