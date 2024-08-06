"use client";

import { useAtom } from "jotai";
import React from "react";
import { useSelector } from "react-redux";
import UserButton from "~/components/UserButton/UserButton";

const Page = () => {
  const user = useSelector((state: any) => state.user.user);

  return (
    <div>
      <div className="">Welcome, {user?.name}!</div>
      {user && <UserButton user={user} />}
    </div>
  );
};

export default Page;
