"use client";

import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import AssignmentCard from "~/components/AssignmentCard";
import AssignmentLoader from "~/components/Loaders/AssignmentLoader";
import { Button } from "~/components/ui/button";
import { sidebarExpandedAtom } from "~/context/atom";
import { useUser } from "~/hooks/useUser";

export default function Assignments() {
  const [isSidebarExpanded, setIsSidebarExpanded] =
    useAtom(sidebarExpandedAtom);
  const [isClient, setIsClient] = useState(false);

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
        `${backendUrl}/api/admin/${classId}/assignments`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch assignments");
      }
      return response.json();
    },
    enabled: !!classId && isClient,
    staleTime: 10 * 60 * 1000, //10 min
  });

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
        <Button className="bg-bground2 px-4 pb-1" variant="secondary">
          Recent
        </Button>
        <Button className="px-4 pb-1" variant="outline">
          Deadline
        </Button>
        <Button className="px-4 pb-1" variant="outline">
          Solved
        </Button>
      </div>
      <div className="grid w-full grid-cols-1 gap-6">
        {isLoading ? (
          <div>
            <AssignmentLoader />
          </div>
        ) : assignments && assignments.length > 0 ? (
          assignments.map((assignment: any) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))
        ) : (
          <div>No assignments found</div>
        )}
      </div>
    </div>
  );
}
