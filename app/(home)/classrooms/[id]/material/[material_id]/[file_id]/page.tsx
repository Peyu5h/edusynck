"use client";

import { useAtom } from "jotai";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import DocView from "~/components/DocView";
import MaterialView from "~/components/MaterialView";
import { sidebarExpandedAtom } from "~/context/atom";
import { useFile } from "~/hooks/useFile";

const Page = () => {
  const { file_id } = useParams();
  const [isSidebarExpanded, setIsSidebarExpanded] =
    useAtom(sidebarExpandedAtom);
  const { fileUrl, fileType } = useFile(file_id);

  useEffect(() => {
    setIsSidebarExpanded(false);
  }, [setIsSidebarExpanded]);

  return (
    <div>
      <div className="flex h-[80vh] w-full cursor-pointer justify-between rounded-lg bg-bground2 p-4">
        <div className="deadline w-full">
          <MaterialView uri={fileUrl} fileType={fileType} />
        </div>
      </div>
    </div>
  );
};

export default Page;
