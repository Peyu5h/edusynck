import React from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

const TeacherDashboardLoader = () => {
  return (
    <div className="h-full overflow-hidden">
      <div className="mb-6">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-bground3 pb-4 pt-2"></div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="rounded-xl border-[1px] border-transparent bg-bground2 shadow-sm"
          >
            <CardHeader className="pb-2">
              <div className="h-6 w-20 animate-pulse rounded-lg bg-bground3"></div>
              <div className="h-4 w-32 animate-pulse rounded-lg bg-bground3"></div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="h-8 w-12 animate-pulse rounded-lg bg-bground3"></div>
                <div className="h-8 w-8 animate-pulse rounded-lg bg-bground3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid h-[calc(100vh-400px)] grid-cols-1 gap-6 overflow-hidden lg:grid-cols-2">
        <Card className="flex h-full flex-col overflow-hidden rounded-xl border-[1px] border-transparent bg-bground2 shadow-sm">
          <CardHeader className="flex-shrink-0 pb-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 animate-pulse rounded-lg bg-bground3"></div>
              <div className="h-8 w-24 animate-pulse rounded-lg bg-bground3"></div>
            </div>
            <div className="h-4 w-48 animate-pulse rounded-lg bg-bground3"></div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="scrollbar h-full overflow-y-auto px-6 pb-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-zinc-700 bg-bground3 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-48 animate-pulse rounded-lg bg-bground2"></div>
                          <div className="h-5 w-16 animate-pulse rounded-lg bg-bground2"></div>
                        </div>
                        <div className="mt-1 h-4 w-24 animate-pulse rounded-lg bg-bground2"></div>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="h-3 w-20 animate-pulse rounded-lg bg-bground2"></div>
                          <div className="h-3 w-16 animate-pulse rounded-lg bg-bground2"></div>
                          <div className="w-18 h-3 animate-pulse rounded-lg bg-bground2"></div>
                        </div>
                        <div className="mt-2 h-3 w-32 animate-pulse rounded-lg bg-bground2"></div>
                      </div>
                      <div className="h-8 w-16 animate-pulse rounded-lg bg-bground2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex h-full flex-col overflow-hidden rounded-xl border-[1px] border-transparent bg-bground2 shadow-sm">
          <CardHeader className="flex-shrink-0 pb-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 animate-pulse rounded-lg bg-bground3"></div>
              <div className="h-8 w-20 animate-pulse rounded-lg bg-bground3"></div>
            </div>
            <div className="h-4 w-40 animate-pulse rounded-lg bg-bground3"></div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
            <div className="flex-shrink-0 space-y-4 px-6 pb-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <div className="h-10 w-full animate-pulse rounded-lg bg-bground3"></div>
                </div>
                <div className="w-full md:w-48">
                  <div className="h-10 w-full animate-pulse rounded-lg bg-bground3"></div>
                </div>
              </div>
            </div>

            <div className="scrollbar flex-1 overflow-y-auto px-6 pb-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                  <div className="h-4 w-16 animate-pulse rounded-lg bg-bground3"></div>
                  <div className="h-4 w-16 animate-pulse rounded-lg bg-bground3"></div>
                  <div className="h-4 w-16 animate-pulse rounded-lg bg-bground3"></div>
                  <div className="h-4 w-16 animate-pulse rounded-lg bg-bground3"></div>
                </div>

                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-zinc-700 py-3"
                  >
                    <div className="h-4 w-32 animate-pulse rounded-lg bg-bground3"></div>
                    <div className="h-4 w-48 animate-pulse rounded-lg bg-bground3"></div>
                    <div className="h-4 w-24 animate-pulse rounded-lg bg-bground3"></div>
                    <div className="h-8 w-16 animate-pulse rounded-lg bg-bground3"></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboardLoader;
