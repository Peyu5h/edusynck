"use client";

import React, { useState } from "react";
import TextRing from "../../components/TextRing";
import { MdArrowOutward } from "react-icons/md";

const Page = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-bgImage bg-cover bg-center bg-no-repeat">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative z-10 flex flex-col text-center font-robson text-6xl">
        <div className="mb-[-2.7rem] text-9xl leading-snug">CREATE NEW</div>
        <div className="text-effect mb-[-2.65rem] text-9xl">
          EXPERIENCE WITH
        </div>
        <div className="flex items-center justify-center">
          <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              style={{ zIndex: 99 }}
              className="box-shadow relative flex h-[10.5rem] w-[10.5rem] cursor-pointer select-none items-center justify-center rounded-full border-[1px] border-[#CDEA67] bg-[#222222] text-black shadow-xl-black"
            >
              <div
                cursor-pointer
                select-none
                className="m-2 flex h-24 w-24 items-center justify-center rounded-full border-2 border-black bg-[#CDEA67]"
              >
                <MdArrowOutward className="text-[#222222]" />
              </div>
            </div>
            <div
              style={{ zIndex: 100 }}
              className="absolute inset-0 flex cursor-pointer select-none items-center justify-center text-[#CDEA67]"
            >
              <TextRing
                text="CREATE ACCOUNT NOW CREATE ACCOUNT NOW "
                isPaused={isHovered}
              />
            </div>
          </div>
          <div className="text-outline mb-8 ml-[-8px] mt-5 text-9xl text-transparent">
            WAYS OF
          </div>
        </div>
        <div className="mt-[-2.65rem] flex gap-x-4 text-9xl">
          <h1 className="">PERFECT</h1>
          <div className="mt-1 flex items-center justify-center rounded-xl border-2 border-dashed border-[#707EFF] px-4 pb-2 text-[#707EFF]">
            <span>LEARNING</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
