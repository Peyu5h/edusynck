"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function TeacherPage() {
  useEffect(() => {
    redirect("/teacher/dashboard");
  }, []);

  return null;
}
