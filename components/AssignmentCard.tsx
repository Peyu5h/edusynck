import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import Badge from "./Badge";
import Link from "next/link";

const AssignmentCard = () => {
  return (
    <div>
      <Link
        href={"/assignments/sadasdsa"}
        className="flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-lg border-[1px] border-transparent bg-bground2 duration-150 hover:border-[1px] hover:border-zinc-700"
      >
        <div className="left flex gap-x-4">
          <div className="thumbnai w-[6.2rem] overflow-hidden p-2">
            <Image
              src="https://lh3.googleusercontent.com/drive-storage/AJQWtBNOfZ2dtr20FN9mL1t06Zjijl2nrC1yFlt2ZcFsKOgBJYhiex2SSO683BMYbJR_a8PnyFSkwrcXDB_k9Ho9lnIF9lbGNyT8KeyGnjhAL_E-LdQ=s200"
              alt="thumbnail"
              className="rounded-lg"
              width="99"
              height={99}
              layout="responsive"
            />
          </div>
          <div className="description flex flex-col py-4">
            <h1 className="text-2xl font-light text-text">Assignment No-1</h1>
            <p className="text-md font-normal text-thintext">
              Date of Performance- 31/7/2024\nDate of Submission -23/8/2024
            </p>

            <div className="tags mt-2 flex gap-x-2">
              <Badge className="h-8" variant="green" title="Solved" />
              <Badge variant="orange" title="PDF" />
            </div>
          </div>
        </div>
        <div className="deadline px-8">
          <Badge variant="red" title="2 days" />
        </div>
      </Link>
    </div>
  );
};

export default AssignmentCard;
