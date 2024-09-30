"use client";

import { useAtom } from "jotai";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

import MaterialView from "~/components/MaterialView";
import { sidebarExpandedAtom } from "~/context/atom";
import { useFile } from "~/hooks/useFile";

const Page = () => {
  const { file_id } = useParams();
  const [, setIsSidebarExpanded] = useAtom(sidebarExpandedAtom);
  const { fileUrl, fileType } = useFile(file_id);

  useEffect(() => {
    setIsSidebarExpanded(false);
  }, [setIsSidebarExpanded]);

  return (
    <div className="scrollbar h-[75vh] w-full p-0 sm:p-4">
      <MaterialView uri={fileUrl} fileType={fileType} />
    </div>
  );
};

export default Page;
