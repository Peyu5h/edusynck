"use client";

import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useState, useMemo } from "react";
import AssignmentCard from "~/components/AssignmentCard";
import AssignmentLoader from "~/components/Loaders/AssignmentLoader";
import { Button } from "~/components/ui/button";
import { sidebarExpandedAtom } from "~/context/atom";
import { useUser } from "~/hooks/useUser";

function formatCourseName(name: string): string {
  return name
    .replace(/TE|SE|FE|BR|CMPN|INFT|ECS|EXTC|-|\d+|%20/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 2)
    .join("-");
}

export default function Assignments() {
  const [isSidebarExpanded, setIsSidebarExpanded] =
    useAtom(sidebarExpandedAtom);
  const [isClient, setIsClient] = useState(false);
  const [sortBy, setSortBy] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const { user } = useUser();
  const classId = user?.classId;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    setIsSidebarExpanded(true);
    setIsClient(true);
  }, [setIsSidebarExpanded]);

  const {
    data: assignments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["assignments", classId],
    queryFn: async () => {
      if (!classId) return [];
      const response = await fetch(
        `${backendUrl}/api/admin/class/${classId}/assignments`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch assignments");
      }
      return response.json();
    },
    enabled: !!classId && isClient,
    staleTime: 10 * 60 * 1000, //10 min
  });

  const sortedAndFilteredAssignments = useMemo(() => {
    if (!assignments) return [];

    let filtered = assignments;

    // Filter by subject
    if (selectedSubject !== "all") {
      filtered = filtered.filter(
        (assignment: any) =>
          formatCourseName(assignment.courseName) === selectedSubject,
      );
    }

    // Sort
    switch (sortBy) {
      case "recent":
        return [...filtered].sort((a, b) =>
          b.googleId.localeCompare(a.googleId),
        );
      case "deadline":
        return [...filtered].sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
      default:
        return filtered;
    }
  }, [assignments, sortBy, selectedSubject]);

  const subjects = useMemo(() => {
    if (!assignments) return [];
    const subjectSet = new Set(
      assignments.map((a: any) => formatCourseName(a.courseName)),
    );
    return ["all", ...Array.from(subjectSet)] as const;
  }, [assignments]);

  if (!isClient) {
    return <AssignmentLoader />;
  }

  return (
    <div>
      <div className="">
        <h1 className="pb-4 pt-2 text-3xl font-light text-text">
          All assignments
        </h1>
      </div>
      <div className="mb-4 flex gap-x-4 filter">
        <Button
          className={`px-4 pb-1 ${sortBy === "all" ? "bg-bground2" : ""}`}
          variant={sortBy === "all" ? "secondary" : "outline"}
          onClick={() => setSortBy("all")}
        >
          All
        </Button>
        <Button
          className={`px-4 pb-1 ${sortBy === "recent" ? "bg-bground2" : ""}`}
          variant={sortBy === "recent" ? "secondary" : "outline"}
          onClick={() => setSortBy("recent")}
        >
          Recent
        </Button>
        <Button
          className={`px-4 pb-1 ${sortBy === "deadline" ? "bg-bground2" : ""}`}
          variant={sortBy === "deadline" ? "secondary" : "outline"}
          onClick={() => setSortBy("deadline")}
        >
          Deadline
        </Button>
      </div>
      <div className="scrollbar-hide mb-4 overflow-x-auto">
        <div className="flex gap-x-4 whitespace-nowrap filter">
          {subjects.map((subject: any, index) => (
            <Button
              key={index}
              className={`px-4 pb-1 ${selectedSubject === subject ? "bg-bground2" : ""}`}
              variant={selectedSubject === subject ? "secondary" : "outline"}
              onClick={() => setSelectedSubject(subject)}
            >
              {subject === "all" ? "All Subjects" : subject}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-6">
        {isLoading ? (
          <div>
            <AssignmentLoader />
          </div>
        ) : sortedAndFilteredAssignments.length > 0 ? (
          sortedAndFilteredAssignments.map((assignment: any) => (
            <AssignmentCard key={assignment.googleId} assignment={assignment} />
          ))
        ) : (
          <div>No assignments found</div>
        )}
      </div>
    </div>
  );
}
