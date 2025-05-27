"use client";

import React, { useEffect, useState } from "react";
import UserButton from "./UserButton/UserButton";
import Notification from "./Notification";
import { usePathname } from "next/navigation";
import { useUser } from "~/hooks/useUser";
import MobileHamburger from "./MobileHamburger";

const Header = () => {
  const path = usePathname();
  const { user, isLoading, error } = useUser();
  const [isAssignment, setIsAssignment] = useState(false);
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    setIsAssignment(path.includes("assignments/"));

    const currentHour = new Date().getHours();
    setGreeting(
      currentHour >= 12 && currentHour < 18
        ? "Good afternoon"
        : currentHour >= 18
          ? "Good evening"
          : "Good morning",
    );
  }, [path]);

  const firstName = user?.name.split(" ")[0];

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
          <div className="font-antic text-2xl sm:text-4xl">
            {greeting} <span className="text-pri">{firstName}</span>
          </div>
        )}
        <div>
          <div className="user-btn hidden gap-x-8 md:flex">
            <UserButton user={user} />
            <Notification />
          </div>
          <div className="mb-12 flex items-center justify-center">
            <MobileHamburger />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
