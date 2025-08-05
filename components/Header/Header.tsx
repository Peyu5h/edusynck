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
  const [isMaterial, setIsMaterial] = useState(false);
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    setIsAssignment(path.includes("assignments/"));
    setIsMaterial(path.includes("material/"));
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
      <div className="flex w-full items-center justify-between rounded-xl px-4">
        {isAssignment || isMaterial ? (
          <div className=""></div>
        ) : (
          <div className="font-antic text-2xl sm:text-4xl">
            {greeting} <span className="text-pri">{firstName}</span>
          </div>
        )}
        <div>
          <div className="mb-12 flex items-center justify-center md:hidden">
            <MobileHamburger />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
