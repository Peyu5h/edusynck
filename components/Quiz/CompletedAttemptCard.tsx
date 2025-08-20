"use client";

import React from "react";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";

type CompletedAttempt = {
  id: string;
  quizId: string;
  status: string;
  score?: number | null;
  startedAt: string;
  completedAt?: string | null;
  quiz: { title: string; course: { name: string } };
};

type CompletedAttemptCardProps = {
  attempt: CompletedAttempt;
  onViewResults: () => void;
  onContinue: () => void;
};

export default function CompletedAttemptCard({
  attempt,
  onViewResults,
  onContinue,
}: CompletedAttemptCardProps) {
  return (
    <Card
      key={attempt.id}
      className="overflow-hidden rounded-xl border bg-accent/50 shadow-sm transition hover:shadow-md"
    >
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-5">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-lg font-semibold">{attempt.quiz.title}</h3>
            <Badge
              variant="outline"
              className={`${
                attempt.status === "COMPLETED"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {attempt.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {attempt.quiz.course.name}
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {format(new Date(attempt.startedAt), "MMM d, yyyy")}
              </span>
            </div>
            {attempt.completedAt && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(attempt.completedAt), "h:mm a")}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-5 text-center md:w-1/4">
          {attempt.status === "COMPLETED" ? (
            <>
              <div className="text-2xl font-bold">{attempt.score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-300/10 bg-accent/50"
                  onClick={onViewResults}
                >
                  View Results
                </Button>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="mb-2 h-6 w-6 text-yellow-500" />
              <div className="text-sm">Incomplete</div>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={onContinue}
              >
                Continue
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
