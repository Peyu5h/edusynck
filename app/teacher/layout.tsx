"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCheckTeacher } from "~/hooks/useCheckTeacher";
import TeacherNavBar from "~/components/teacher/TeacherNavBar";
import TeacherSideNav from "~/components/teacher/TeacherSideNav";

interface TeacherLayoutProps {
  children: React.ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  const { isTeacher, isLoading } = useCheckTeacher();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isTeacher) {
      router.push("/");
    }
  }, [isTeacher, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p>Loading teacher dashboard...</p>
      </div>
    );
  }

  if (!isTeacher && !isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-red-500">
          You don't have permission to access this page
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full overflow-y-hidden bg-bground1 bg-bgImage bg-cover bg-center bg-no-repeat p-2.5 font-khula text-text">
      <div className="sticky top-0 hidden h-screen md:block">
        <TeacherSideNav />
      </div>
      <div className="flex w-full flex-col">
        <div className="sticky top-0 z-10">
          <TeacherNavBar />
        </div>
        <div className="scrollbar h-full flex-1 overflow-y-auto p-4">
          <div className="container mx-auto py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
