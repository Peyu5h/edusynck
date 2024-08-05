"use client";

import React, { useState } from "react";
import RegisterForm from "~/components/auth/RegisterForm";

const Page = () => {
  return (
    <div style={{ zIndex: 5 }}>
      <RegisterForm />
    </div>
  );
};

export default Page;
