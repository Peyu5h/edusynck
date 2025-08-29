import React from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

const CoursesPageLoader = () => {
  return (
    <div className="h-full overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-bground3"></div>
        <div className="flex gap-3">
          <div className="h-10 w-32 animate-pulse rounded-lg bg-bground3"></div>
          <div className="h-10 w-28 animate-pulse rounded-lg bg-bground3"></div>
        </div>
      </div>

      <Card className="h-[calc(100vh-200px)] overflow-hidden rounded-xl border-[1px] border-transparent bg-bground2 shadow-sm">
        <CardHeader className="flex-shrink-0 pb-4">
          <div className="h-6 w-40 animate-pulse rounded-lg bg-bground3"></div>
          <div className="h-4 w-64 animate-pulse rounded-lg bg-bground3"></div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="scrollbar h-full overflow-y-auto px-6 pb-6">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-700 pb-3">
              <div className="h-4 w-24 animate-pulse rounded-lg bg-bground3"></div>
              <div className="h-4 w-20 animate-pulse rounded-lg bg-bground3"></div>
              <div className="h-4 w-32 animate-pulse rounded-lg bg-bground3"></div>
              <div className="h-4 w-16 animate-pulse rounded-lg bg-bground3"></div>
            </div>

            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-zinc-700 py-4"
                >
                  <div className="h-4 w-48 animate-pulse rounded-lg bg-bground3"></div>
                  <div className="h-4 w-32 animate-pulse rounded-lg bg-bground3"></div>
                  <div className="h-4 w-40 animate-pulse rounded-lg bg-bground3"></div>
                  <div className="h-4 w-24 animate-pulse rounded-lg bg-bground3"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoursesPageLoader;
