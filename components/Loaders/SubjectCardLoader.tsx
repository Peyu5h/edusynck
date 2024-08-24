import { Separator } from "@radix-ui/react-select";
import React from "react";

const SubjectCardLoader = () => {
  return (
    <div>
      <div className="flex h-48 w-full cursor-pointer flex-col rounded-xl border-[1px] border-transparent bg-bground2 p-6 duration-300 hover:border-[1px] hover:border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1">
            <h1 className="h-6 w-48 animate-pulse rounded-lg bg-bground3 text-xl font-light text-thintext"></h1>
            <p className="h-6 w-64 animate-pulse rounded-lg bg-bground3 text-xl font-thin text-text"></p>
          </div>
          <div className="h-14 w-14 animate-pulse overflow-hidden rounded-lg bg-bground3"></div>
        </div>
        <Separator className="my-4 h-[0.5px] w-full rounded-xl bg-neutral-700" />
        <div className="flex flex-col gap-y-1">
          <h1 className="mt-4 h-6 w-72 animate-pulse rounded-lg bg-bground3 text-xl font-normal text-thintext"></h1>
        </div>
      </div>
    </div>
  );
};

export default SubjectCardLoader;
