"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Award } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

type ResultsSummaryProps = {
  title: string;
  courseName: string;
  completedAt: Date | string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completionTimeText: string;
  status: string;
  description?: string | null;
  onLeaderboard: () => void;
  correct: number;
  incorrect: number;
  unanswered: number;
  quizId: string;
};

export default function ResultsSummary({
  title,
  courseName,
  completedAt,
  score,
  totalQuestions,
  percentage,
  completionTimeText,
  status,
  description,
  correct,
  incorrect,
  unanswered,
  quizId,
}: ResultsSummaryProps) {
  const router = useRouter();
  return (
    <Card className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-4 text-2xl font-bold text-foreground">
              <span>{title} - Results</span>
              <Badge
                variant={status === "completed" ? "default" : "secondary"}
                className="border-accent text-sm font-medium"
              >
                {status}
              </Badge>
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              {courseName} • Completed{" "}
              {typeof completedAt === "string"
                ? completedAt
                : new Date(completedAt).toLocaleString()}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            className="text-md"
            onClick={() => router.push(`/quizzes/${quizId}/leaderboard`)}
          >
            View Leaderboard
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="bg-green-50/30 dark:bg-green-950/20 relative flex flex-col items-center justify-center rounded-lg border p-4">
            <Award className="absolute right-4 top-4 text-green" />
            <div className="dark:text-green-300 text-2xl font-bold">
              {score} / {totalQuestions}
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Total Score
            </div>
          </div>
          <div className="bg-green-50/30 dark:bg-green-950/20 relative flex flex-col items-center justify-center rounded-lg border p-4">
            <CheckCircle2 className="absolute right-4 top-4 text-green" />
            <div className="dark:text-green-300 text-2xl font-bold">
              {correct}
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Correct
            </div>
          </div>

          <div className="bg-red-50/30 dark:bg-red-950/20 relative flex flex-col items-center justify-center rounded-lg border p-4">
            <XCircle className="absolute right-4 top-4 font-extralight text-red" />
            <div className="dark:text-red-300 text-2xl font-bold">
              {incorrect}
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Incorrect
            </div>
          </div>

          {/* {unanswered > 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border bg-yellow-50/30 p-4 dark:bg-yellow-950/20">
              <AlertCircle className="text-yellow absolute right-4 top-4" />
              <div className="text-2xl font-bold dark:text-yellow-300">
                {unanswered}
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Unanswered
              </div>
            </div>
          )} */}

          <div className="bg-blue-50/30 dark:bg-blue-950/20 relative flex flex-col items-center justify-center rounded-lg border p-4">
            <Clock className="absolute right-4 top-4 text-blue" />
            <div className="dark:text-blue-300 text-lg font-bold">
              {completionTimeText}
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Time
            </div>
          </div>
        </div>

        {description && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
