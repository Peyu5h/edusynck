"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { BookOpen, Calendar, FileCheck, Timer, Trophy } from "lucide-react";
import { format } from "date-fns";

type Course = { name: string };

export type ActiveQuiz = {
  id: string;
  title: string;
  description: string | null;
  course: Course;
  _count: { questions: number };
  duration: number | null;
  endTime?: string | null;
  startTime?: string | null;
  status: string;
  hasAttempted?: boolean;
  attemptStatus?: string | null;
};

type ActiveQuizCardProps = {
  quiz: ActiveQuiz;
  statusBadge: React.ReactNode;
  onStart: () => void;
  onViewResults: () => void;
  onLeaderboard: () => void;
  actionVariant: "start" | "continue" | "view" | "upcoming" | "expired" | null;
  actionDisabled?: boolean;
  actionLabel?: string;
};

export default function ActiveQuizCard({
  quiz,
  statusBadge,
  onStart,
  onViewResults,
  onLeaderboard,
  actionVariant,
  actionDisabled,
  actionLabel,
}: ActiveQuizCardProps) {
  return (
    <Card
      key={quiz.id}
      className="h-full overflow-hidden rounded-xl border bg-card shadow-sm transition hover:border-gray-600 hover:shadow-md"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-1 tracking-tight">
            {quiz.title}
          </CardTitle>
          {statusBadge}
        </div>
        <CardDescription className="line-clamp-2">
          {quiz.description || "No description provided"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {quiz.course.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {quiz._count.questions} questions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {quiz.duration ? `${quiz.duration} minutes` : "No time limit"}
            </span>
          </div>
          {quiz.endTime && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Ends: {format(new Date(quiz.endTime), "MMM d, h:mm a")}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {actionVariant === "start" && (
          <Button size="sm" onClick={onStart} className="px-4">
            Start Quiz
          </Button>
        )}
        {actionVariant === "continue" && (
          <Button size="sm" onClick={onStart} className="px-4">
            Continue Quiz
          </Button>
        )}
        {actionVariant === "view" && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onViewResults}>
              View Results
            </Button>
            <Button variant="outline" size="sm" onClick={onLeaderboard}>
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </Button>
          </div>
        )}
        {actionVariant === "upcoming" && (
          <Button size="sm" disabled className="px-4">
            {actionLabel}
          </Button>
        )}
        {actionVariant === "expired" && (
          <Button variant="outline" size="sm" disabled>
            Expired
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
