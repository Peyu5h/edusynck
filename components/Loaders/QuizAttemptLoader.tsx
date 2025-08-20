import React from "react";

const QuizAttemptLoader = () => {
  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-muted"></div>
            <div className="h-6 w-48 animate-pulse rounded-lg bg-muted"></div>
          </div>
          <div className="h-10 w-32 animate-pulse rounded-lg bg-muted"></div>
        </div>

        {/* Progress Bar */}
        <div className="rounded-full bg-muted">
          <div className="h-2 w-1/3 animate-pulse rounded-full bg-muted-foreground/50"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Navigation Sidebar */}
        <div className="order-2 md:order-1">
          <div className="space-y-4">
            <div className="h-10 w-full animate-pulse rounded-lg bg-muted"></div>
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 w-full animate-pulse rounded-lg bg-muted"
                ></div>
              ))}
            </div>
            <div className="h-12 w-full animate-pulse rounded-lg bg-primary/20"></div>
          </div>
        </div>

        {/* Question Area */}
        <div className="order-1 md:order-2 md:col-span-3">
          <div className="space-y-6">
            {/* Question Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-16 animate-pulse rounded-lg bg-muted"></div>
                <div className="h-6 w-8 animate-pulse rounded-lg bg-muted"></div>
              </div>
              <div className="h-8 w-full animate-pulse rounded-lg bg-muted"></div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-14 w-full animate-pulse rounded-lg border bg-muted"
                ></div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <div className="h-10 w-24 animate-pulse rounded-lg bg-muted"></div>
              <div className="h-10 w-24 animate-pulse rounded-lg bg-muted"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAttemptLoader;
