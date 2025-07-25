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
    // If not loading and either there's an error or no user, redirect to sign-in
    if (!isLoading && (error || !user)) {
      router.push(redirectTo);
      return;
    }

    // If user exists but doesn't have the required role, redirect to appropriate page
    if (!isLoading && user && !allowedRoles.includes(user.role)) {
      // Redirect teachers to teacher dashboard
      if (user.role === "CLASS_TEACHER" || user.role === "ADMIN") {
        router.push("/teacher/dashboard");
      }
      // Redirect students to student dashboard
      else if (user.role === "STUDENT") {
        router.push("/dashboard");
      }
      // For any other role, redirect to sign-in
      else {
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

  // If there's an error or no user, don't render children
  if (error || !user) {
    return null;
  }

  // If the user doesn't have the required role, don't render children
  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  // If all checks pass, render the children
  return <>{children}</>;
}
