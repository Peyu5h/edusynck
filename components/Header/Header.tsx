"use client";

import React, { useEffect, useState } from "react";
import UserButton from "./UserButton/UserButton";
import { useSelector } from "react-redux";
import Notification from "./Notification";
import { usePathname } from "next/navigation";

const Header = () => {
  const user = useSelector((state: any) => state.user.user);
  const path = usePathname();

  const [isAssignment, setIsAssignment] = useState(false);

  useEffect(() => {
    setIsAssignment(path.includes("assignments/"));
    console.log(path.includes("assignments/"));
  }, [path]);

  return (
    <div>
      <div className="mb-2 flex w-full items-center justify-between rounded-xl px-4 pt-4">
        {isAssignment ? (
          <div className="">
            <h1 className="mt-2 text-3xl font-light text-text">
              Assignment No-1
            </h1>
            <p className="text-thintext">Submit the assignment before TT1</p>
          </div>
        ) : (
          <div className="font-antic text-4xl">
            Good evening <span className="text-pri">Piyush</span>
          </div>
        )}

        <div className="">
          <div className="user-btn flex gap-x-8">
            <UserButton user={user} />
            <Notification />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
