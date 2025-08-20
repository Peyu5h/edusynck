"use client";

import React from "react";
import { Badge } from "~/components/ui/badge";
import { Users, Award, Clock } from "lucide-react";

type LeaderboardHeaderProps = {
  title: string;
  courseName: string;
  participants: number;
  topScoreText: string;
};

export default function LeaderboardHeader({
  title,
  courseName,
  participants,
  topScoreText,
}: LeaderboardHeaderProps) {
  return (
    <>
      <h1 className="text-3xl font-bold">{title} - Leaderboard</h1>
      <div className="mt-2 flex flex-wrap items-center gap-6">
        <span className="text-base text-muted-foreground">{courseName}</span>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-5 w-5" />
          <span className="text-base text-muted-foreground">
            {participants} participants
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award className="h-5 w-5" />
          <span className="text-base text-muted-foreground">
            Top score: {topScoreText}
          </span>
        </div>
      </div>
    </>
  );
}
