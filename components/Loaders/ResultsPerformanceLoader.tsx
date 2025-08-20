import React from "react";

const ResultsPerformanceLoader = () => {
  return (
    <div className="w-full overflow-hidden rounded-xl border bg-bground2 shadow-sm">
      <div className="p-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Circular Progress Skeleton */}
          <div className="relative flex h-32 w-32 items-center justify-center">
            <div className="h-32 w-32 animate-pulse rounded-full bg-muted/20"></div>
            <div className="absolute flex flex-col items-center justify-center">
              <div className="h-8 w-16 animate-pulse rounded-lg bg-muted"></div>
            </div>
          </div>

          {/* Grade Text */}
          <div className="text-center">
            <div className="h-6 w-24 animate-pulse rounded-lg bg-muted"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPerformanceLoader;
