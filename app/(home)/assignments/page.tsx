"use client";

import { useAtom } from "jotai";
import { useEffect } from "react";
import AssignmentCard from "~/components/AssignmentCard";
import SubjectCard from "~/components/SubjectCard";
import { Button } from "~/components/ui/button";
import { setSidebarExpandedAtom } from "~/context/atom";

export default function Assignments() {
  const [, setIsSidebarExpanded] = useAtom(setSidebarExpandedAtom);
  useEffect(() => {
    setIsSidebarExpanded(true);
  }, []);
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
        <AssignmentCard />
        <AssignmentCard />
        <AssignmentCard />
        <AssignmentCard />
        <AssignmentCard />
        <AssignmentCard />
        <AssignmentCard />
      </div>
    </div>
  );
}
