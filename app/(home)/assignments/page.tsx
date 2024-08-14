"use client";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AssignmentCard from "~/components/AssignmentCard";
import { Button } from "~/components/ui/button";
import { sidebarExpandedAtom } from "~/context/atom";

export default function Assignments() {
  const [isSidebarExpanded, setIsSidebarExpanded] =
    useAtom(sidebarExpandedAtom);
  const [assignments, setAssignments] = useState<any[]>([]);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const user = useSelector((state: any) => state.user.user);
  const classId = user?.classId;

  useEffect(() => {
    setIsSidebarExpanded(true);
  }, [setIsSidebarExpanded]);

  useEffect(() => {
    try {
      const fetchData = async () => {
        const response = await fetch(
          `${backendUrl}/api/admin/${classId}/assignments`,
        );
        const data = await response.json();
        setAssignments(data);
      };
      fetchData();
    } catch (error) {
      console.log(error);
    }
  }, []);

  console.log(assignments);

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
        {assignments.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} />
        ))}
      </div>
    </div>
  );
}
