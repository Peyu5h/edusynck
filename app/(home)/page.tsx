"use client";

import React from "react";
import { useSelector } from "react-redux";
import UserButton from "~/components/UserButton/UserButton";

const Page = () => {
  const user = useSelector((state: any) => state.user.user);

  return (
    <div>
      {user ? (
        <>
          <div className="">Welcome, {user?.name}!</div>
          <UserButton user={user} />
        </>
      ) : null}
      <div className="flex">
        <div className="bg-bground1 item-center text-text h-24 w-24">HELO</div>
        <div className="bg-bground2 text-thintext h-24 w-24">HELO</div>
        <div className="bg-bground3 text-pri h-24 w-24"></div>
        <div className="bg-popupbox text-svg h-24 w-24">&</div>
      </div>
    </div>
  );
};

export default Page;
