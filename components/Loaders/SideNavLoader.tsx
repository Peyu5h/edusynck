"use client";

import { useAtom } from "jotai";
import React from "react";
import { sidebarExpandedAtom } from "~/context/atom";
import { ny } from "~/lib/utils";

const SideNavLoader = () => {
  return (
    <div>
      <div
        className={ny(
          "w-[270px]",
          "hidden h-[97vh] transform rounded-xl bg-bground2 transition-all duration-300 ease-in-out sm:flex",
        )}
      >
        <aside className="flex h-full w-full columns-1 flex-col overflow-x-hidden break-words px-4">
          <div className="relative mt-4 pb-2">
            <div className="my-4 mb-6 flex items-center justify-center">
              <h1 className="font-robson text-5xl text-pri">EDUSYNC</h1>
            </div>
            <div className="mt-16 flex flex-col gap-y-4">
              <div className="h-10 w-full animate-pulse rounded-lg bg-bground3"></div>
              <div className="h-8 w-full animate-pulse rounded-lg bg-bground3"></div>
              <div className="h-12 w-full animate-pulse rounded-lg bg-bground3"></div>
              <div className="h-9 w-full animate-pulse rounded-lg bg-bground3"></div>
              <div className="h-10 w-full animate-pulse rounded-lg bg-bground3"></div>
              <div className="h-7 w-full animate-pulse rounded-lg bg-bground3"></div>
              <div className="h-11 w-full animate-pulse rounded-lg bg-bground3"></div>
              <div className="h-8 w-full animate-pulse rounded-lg bg-bground3"></div>
              <div className="h-10 w-full animate-pulse rounded-lg bg-bground3"></div>
              <div className="h-9 w-full animate-pulse rounded-lg bg-bground3"></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SideNavLoader;
