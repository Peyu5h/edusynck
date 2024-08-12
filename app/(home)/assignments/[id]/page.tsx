"use client";

import { useAtom } from "jotai";
import { useEffect } from "react";
import AssignmentCard from "~/components/AssignmentCard";
import Badge from "~/components/Badge";
import DocView from "~/components/DocView";

import { setSidebarExpandedAtom } from "~/context/atom";

export default function AssignmentPage() {
  const [, setIsSidebarExpanded] = useAtom(setSidebarExpandedAtom);
  useEffect(() => {
    setIsSidebarExpanded(false);
  }, []);
  return (
    <div>
      <div className="flex h-[80vh] w-full cursor-pointer justify-between rounded-lg bg-bground2 p-4">
        <div className="deadline">
          <DocView />
        </div>
      </div>
    </div>
  );
}
