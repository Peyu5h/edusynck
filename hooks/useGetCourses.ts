"use client";

import { useQuery, useQueries, UseQueryResult } from "@tanstack/react-query";
import { useUser } from "./useUser";

const fetchCourses = async (classId: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/class/${classId}/courses`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json();
};

export function useCourses() {
  const { user } = useUser();
  return useQuery({
    queryKey: ["courses", user?.classId],
    queryFn: () => fetchCourses(user?.classId),
    // Always refetch on mount and avoid stale caches after mutations
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: "always",
    enabled: !!user?.id && !!user?.classId,
  });
}

export function useCoursesForClasses(classIds: string[]) {
  const queries = useQueries({
    queries: classIds.map((id) => ({
      queryKey: ["courses", id],
      queryFn: () => fetchCourses(id),
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      enabled: !!id,
    })),
  }) as UseQueryResult<any[], Error>[];

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const data = queries.flatMap((q) => q.data || []);

  return { data, isLoading, isError };
}
