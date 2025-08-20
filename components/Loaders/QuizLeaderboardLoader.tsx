import React from "react";

const QuizLeaderboardLoader = () => {
  return (
    <div className="container mx-auto">
      <div className="mb-4 mt-4">
        {/* Back Button */}
        <div className="mb-4">
          <div className="h-10 w-32 animate-pulse rounded-lg bg-muted"></div>
        </div>

        {/* Header */}
        <div className="space-y-4">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-muted"></div>
          <div className="h-6 w-48 animate-pulse rounded-lg bg-muted"></div>
          <div className="flex gap-4">
            <div className="h-6 w-32 animate-pulse rounded-lg bg-muted"></div>
            <div className="h-6 w-24 animate-pulse rounded-lg bg-muted"></div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table Skeleton */}
      <div className="overflow-hidden rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-4 gap-4 border-b pb-4">
            <div className="h-6 w-20 animate-pulse rounded-lg bg-muted"></div>
            <div className="h-6 w-24 animate-pulse rounded-lg bg-muted"></div>
            <div className="ml-auto h-6 w-16 animate-pulse rounded-lg bg-muted"></div>
            <div className="ml-auto h-6 w-32 animate-pulse rounded-lg bg-muted"></div>
          </div>

          {/* Rows */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-pulse rounded-full bg-muted"></div>
                <div className="h-6 w-8 animate-pulse rounded-lg bg-muted"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-pulse rounded-full bg-muted"></div>
                <div className="h-6 w-32 animate-pulse rounded-lg bg-muted"></div>
                <div className="h-5 w-12 animate-pulse rounded-full bg-muted"></div>
              </div>
              <div className="ml-auto h-6 w-16 animate-pulse rounded-lg bg-muted"></div>
              <div className="ml-auto h-6 w-20 animate-pulse rounded-lg bg-muted"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizLeaderboardLoader;
