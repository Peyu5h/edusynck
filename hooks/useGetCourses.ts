"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "./useUser";

const fetchCourses = async (userId: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/class/${userId}/courses`,
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
    staleTime: 60 * 60 * 1000, //1 hr
    enabled: !!user?.id,
  });
}
