"use client";

import React, { useState } from "react";
import LoginForm from "~/components/auth/LoginForm";
import TeacherRegisterForm from "~/components/auth/TeacherRegisterForm";
import TeacherLoginForm from "~/components/auth/TeacherLoginForm";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const Page = () => {
  const [teacherAction, setTeacherAction] = useState<"login" | "register">(
    "login",
  );

  return (
    <div style={{ zIndex: 5 }}>
      <LoginForm />
    </div>
  );
};

export default Page;
