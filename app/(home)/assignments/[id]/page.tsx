"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { sidebarExpandedAtom } from "~/context/atom";
import DocView from "~/components/DocView";
import { useParams } from "next/navigation";
import { useFile } from "~/hooks/useFile";

export default function AssignmentPage() {
  const [isSidebarExpanded, setIsSidebarExpanded] =
    useAtom(sidebarExpandedAtom);
  const { id } = useParams();
  const { fileUrl, fileType } = useFile(id);

  useEffect(() => {
    setIsSidebarExpanded(false);
  }, [setIsSidebarExpanded]);

  return (
    <div>
      <div className="flex h-[80vh] w-full cursor-pointer justify-between rounded-lg bg-bground2 p-4">
        <div className="deadline">
          <DocView uri={fileUrl} fileType={fileType} />
        </div>
      </div>
    </div>
  );
}
