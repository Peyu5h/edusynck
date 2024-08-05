"use client";

import React, { useState } from "react";
import LoginForm from "~/components/auth/LoginForm";

const Page = () => {
  return (
    <div style={{ zIndex: 5 }}>
      <LoginForm />
    </div>
  );
};

export default Page;
