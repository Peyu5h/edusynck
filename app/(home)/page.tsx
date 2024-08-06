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
    </div>
  );
};

export default Page;
