"use client";

import React from "react";
import { Separator } from "./ui/separator";
import { ny } from "~/lib/utils";
import Image from "next/image";

const SubjectCard = () => {
  return (
    <div>
      <div className="flex h-48 w-full cursor-pointer flex-col rounded-xl border-[1px] border-transparent bg-bground2 p-6 duration-300 hover:border-[1px] hover:border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1">
            <h1 className="text-xl font-light text-thintext">Professor</h1>
            <p className="text-xl font-thin text-text">Shobha D&apos;mello</p>
          </div>
          <div className="h-14 w-14 overflow-hidden rounded-md">
            <Image
              src="https://lh3.googleusercontent.com/a-/ALV-UjWJGmTFJhpRlfAKQ0z_rJPl745XNrESSlBJL9UCwbUVgP1VOIf6"
              alt="Professor picture"
              width={5}
              height={5}
              layout="responsive"
            />
          </div>
        </div>
        <Separator
          className={ny("my-4 h-[0.5px] w-full rounded-xl bg-neutral-700")}
        />
        <div className="flex flex-col gap-y-1">
          <h1 className="mt-4 text-xl font-normal text-thintext">
            SOFTWARE ENGINEERING TE-1 & 2
          </h1>

          {/* <p className="text-xl font-thin text-text">Shobha D&apos;mello</p> */}
        </div>
      </div>
    </div>
  );
};

export default SubjectCard;
