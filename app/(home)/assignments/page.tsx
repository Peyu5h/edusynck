"use client";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AssignmentCard from "~/components/AssignmentCard";
import AssignmentLoader from "~/components/Loaders/AssignmentLoader";
import { Button } from "~/components/ui/button";
import { sidebarExpandedAtom } from "~/context/atom";

export default function Assignments() {
  const [isSidebarExpanded, setIsSidebarExpanded] =
    useAtom(sidebarExpandedAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);

  const user = useSelector((state: any) => state.user.user);
  const classId = user?.classId;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    setIsSidebarExpanded(true);
  }, [setIsSidebarExpanded]);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!classId) {
        setAssignments([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      console.log(`${backendUrl}/api/admin/${classId}/assignments`);
      try {
        const response = await fetch(
          `${backendUrl}/api/admin/${classId}/assignments`,
          { cache: "force-cache" },
        );
        const data = await response.json();
        setAssignments(data);
      } catch (error) {
        console.log(error);
        setAssignments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [classId, backendUrl]);

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
        ) : assignments.length > 0 ? (
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
