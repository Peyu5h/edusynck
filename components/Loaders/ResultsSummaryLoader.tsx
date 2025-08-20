import React from "react";

const ResultsSummaryLoader = () => {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="h-8 w-64 animate-pulse rounded-lg bg-muted"></div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-muted"></div>
            </div>
            <div className="h-6 w-80 animate-pulse rounded-lg bg-muted"></div>
          </div>
          <div className="h-10 w-32 animate-pulse rounded-lg bg-muted"></div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 px-6 pb-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center justify-center rounded-lg border p-4"
            >
              <div className="absolute right-4 top-4 h-6 w-6 animate-pulse rounded-full bg-muted"></div>
              <div className="mb-2 h-8 w-16 animate-pulse rounded-lg bg-muted"></div>
              <div className="h-5 w-20 animate-pulse rounded-lg bg-muted"></div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="h-5 w-full animate-pulse rounded-lg bg-muted"></div>
        </div>
      </div>
    </div>
  );
};

export default ResultsSummaryLoader;
