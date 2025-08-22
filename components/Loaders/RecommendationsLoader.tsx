import React from "react";

const RecommendationsLoader = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="h-10 w-80 animate-pulse rounded-lg bg-muted"></div>
        <div className="h-6 w-96 animate-pulse rounded-lg bg-muted"></div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-10 w-32 animate-pulse rounded-full bg-muted"
          ></div>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border bg-card shadow-sm"
          >
            {/* Video Thumbnail */}
            <div className="aspect-video animate-pulse bg-muted"></div>

            {/* Video Info */}
            <div className="space-y-3 p-4">
              <div className="h-5 w-full animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="flex justify-center">
        <div className="h-10 w-40 animate-pulse rounded-lg bg-muted"></div>
      </div>

      {/* Past Topics Section */}
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted"></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="space-y-2 rounded-lg border bg-card p-4"
            >
              <div className="h-5 w-full animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendationsLoader;
