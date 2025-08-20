import React from "react";

const QuizResultsLoader = () => {
  return (
    <div className="container mx-auto pb-8">
      {/* Back Button */}
      <div className="mb-4 mt-4">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-muted"></div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Results Summary */}
        <div className="lg:col-span-2">
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
        </div>

        {/* Performance Chart */}
        <div className="flex justify-center lg:justify-start">
          <div className="w-full overflow-hidden rounded-xl border bg-bground2 shadow-sm">
            <div className="p-4">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative flex h-32 w-32 items-center justify-center">
                  <div className="h-32 w-32 animate-pulse rounded-full bg-muted/20"></div>
                  <div className="absolute flex flex-col items-center justify-center">
                    <div className="h-8 w-16 animate-pulse rounded-lg bg-muted"></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="h-6 w-24 animate-pulse rounded-lg bg-muted"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Review Section */}
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-lg border p-4">
              <div className="h-6 w-full animate-pulse rounded-lg bg-muted"></div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="h-4 w-full animate-pulse rounded-lg bg-muted"
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizResultsLoader;
