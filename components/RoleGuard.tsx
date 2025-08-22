"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "~/hooks/useUser";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export default function RoleGuard({
  children,
  allowedRoles,
  redirectTo = "/sign-in",
}: RoleGuardProps) {
  const { user, isLoading, error } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && !localStorage.getItem("user")) {
      router.push(redirectTo);
      return;
    }

    if (!isLoading && user && !allowedRoles.includes(user.role)) {
      if (user.role === "CLASS_TEACHER" || user.role === "ADMIN") {
        router.push("/teacher/dashboard");
      } else if (user.role === "STUDENT") {
        router.push("/dashboard");
      } else {
        router.push(redirectTo);
      }
    }
  }, [user, isLoading, error, allowedRoles, redirectTo, router]);

  // While loading, show a loading state
  // if (isLoading) {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       Loading...
  //     </div>
  //   );
  // }

  if (error || !user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
