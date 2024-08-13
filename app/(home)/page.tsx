"use client";

import { useAtom } from "jotai";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import UserButton from "~/components/Header/UserButton/UserButton";
import SubjectCard from "~/components/SubjectCard";
import { sidebarExpandedAtom } from "~/context/atom";

const Page = () => {
  const user = useSelector((state: any) => state.user.user);
  const [isSidebarExpanded, setIsSidebarExpanded] =
    useAtom(sidebarExpandedAtom);

  useEffect(() => {
    setIsSidebarExpanded(true);
  }, [setIsSidebarExpanded]);
  return (
    <div>
      <div className="">
        <h1 className="pb-4 pt-2 text-3xl font-light text-text">
          Your classrooms
        </h1>
      </div>
      <div className="grid w-full grid-cols-3 gap-6">
        <SubjectCard />
        <SubjectCard />
        <SubjectCard />
        <SubjectCard />
        <SubjectCard />
      </div>
    </div>
  );
};

export default Page;
