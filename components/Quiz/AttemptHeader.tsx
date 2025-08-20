"use client";

import React from "react";
import { Clock } from "lucide-react";

type AttemptHeaderProps = {
  title: string;
  courseName: string;
  questionCount: number;
  timeRemaining: number | null;
  formatTime: (seconds: number) => string;
};

export default function AttemptHeader({
  title,
  courseName,
  questionCount,
  timeRemaining,
  formatTime,
}: AttemptHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{courseName}</span>
          <span>•</span>
          <span>{questionCount} questions</span>
        </div>
      </div>

      {timeRemaining !== null && (
        <div
          className={`flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 ${timeRemaining < 300 ? "text-red-500" : ""}`}
        >
          <Clock className="h-4 w-4" />
          <span className="font-mono">{formatTime(timeRemaining)}</span>
        </div>
      )}
    </div>
  );
}
