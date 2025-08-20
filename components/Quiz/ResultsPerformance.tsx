"use client";

import React from "react";
import { Card, CardContent } from "~/components/ui/card";

type ResultsPerformanceProps = {
  percentage: number;
  gradeText: string;
};

export default function ResultsPerformance({
  percentage,
  gradeText,
}: ResultsPerformanceProps) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="w-full overflow-hidden rounded-xl border bg-bground2 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <svg className="h-32 w-32 -rotate-90 transform">
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted-foreground/20"
              />
              {/* Progress circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-primary transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <div className="text-green-700 dark:text-green-300 text-2xl font-bold">
                {percentage}%
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-foreground">
              {gradeText}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
