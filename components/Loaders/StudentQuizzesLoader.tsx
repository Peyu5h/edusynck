import React from "react";

const StudentQuizzesLoader = () => {
  return (
    <div className="scrollbar container mx-auto h-full overflow-y-auto rounded-xl bg-bground2 pt-8">
      {/* Header */}
      <div className="">
        <div className="mb-4 h-10 w-48 animate-pulse rounded-lg bg-muted"></div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-muted"></div>
          <div className="ml-2 h-10 w-10 animate-pulse rounded-lg bg-muted"></div>
        </div>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-muted"></div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex space-x-2">
          <div className="h-10 w-32 animate-pulse rounded-lg bg-muted"></div>
          <div className="h-10 w-40 animate-pulse rounded-lg bg-muted"></div>
        </div>

        {/* Active Quizzes Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex h-48 w-full cursor-pointer flex-col rounded-xl border border-transparent bg-bground2 p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="h-6 w-20 animate-pulse rounded-full bg-muted"></div>
                <div className="h-6 w-16 animate-pulse rounded-lg bg-muted"></div>
              </div>
              <div className="mb-4 space-y-2">
                <div className="h-6 w-48 animate-pulse rounded-lg bg-muted"></div>
                <div className="h-4 w-64 animate-pulse rounded-lg bg-muted"></div>
              </div>
              <div className="mt-auto">
                <div className="h-10 w-full animate-pulse rounded-lg bg-muted"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentQuizzesLoader;
