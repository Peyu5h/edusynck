"use client";

import React from "react";
import UserButton from "./UserButton/UserButton";
import { useSelector } from "react-redux";
import Notification from "./Notification";

const Header = () => {
  const user = useSelector((state: any) => state.user.user);

  return (
    <div>
      <div className="mb-4 flex w-full items-center justify-between rounded-xl p-4">
        <div className="font-antic text-4xl">
          Good evening <span className="text-pri">Piyush</span>
        </div>

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
