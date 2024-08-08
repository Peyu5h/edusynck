"use client";

import React from "react";
import { useSelector } from "react-redux";
import UserButton from "~/components/Header/UserButton/UserButton";

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
        <div className="item-center h-24 w-24 bg-bground1 text-text">HELO</div>
        <div className="h-24 w-24 bg-bground2 text-thintext">HELO</div>
        <div className="h-24 w-24 bg-bground3 text-pri"></div>
        <div className="h-24 w-24 bg-popupbox text-svg">&</div>
      </div>
    </div>
  );
};

export default Page;
