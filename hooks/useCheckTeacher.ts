"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { loginUser } from "~/store/slices/userSlice";

export function useCheckTeacher() {
  const user = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isTeacher, setIsTeacher] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTeacherStatus = async () => {
      try {
        // First check if there's a user in Redux
        if (user) {
          if (user.role === "CLASS_TEACHER") {
            setIsTeacher(true);
            setIsLoading(false);
            return;
          } else {
            setIsTeacher(false);
            setIsLoading(false);
            router.push("/");
            return;
          }
        }

        // Try localStorage if no user in Redux
        const storedUserString = localStorage.getItem("user");
        if (storedUserString) {
          const storedUser = JSON.parse(storedUserString);
          if (storedUser.role === "CLASS_TEACHER") {
            dispatch(loginUser(storedUser));
            setIsTeacher(true);
            setIsLoading(false);
            return;
          } else {
            setIsTeacher(false);
            setIsLoading(false);
            router.push("/");
            return;
          }
        }

        // Try to fetch from API using token from cookies
        const cookies = document.cookie.split(";").reduce(
          (acc, cookie) => {
            const [key, value] = cookie.trim().split("=");
            acc[key] = value;
            return acc;
          },
          {} as Record<string, string>,
        );

        const token = cookies.token;
        if (!token) {
          setIsTeacher(false);
          setIsLoading(false);
          router.push("/sign-in");
          return;
        }

        // Fetch user data from API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        dispatch(loginUser(userData));

        if (userData.role === "CLASS_TEACHER") {
          setIsTeacher(true);
        } else {
          setIsTeacher(false);
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking teacher status:", error);
        setIsTeacher(false);
        router.push("/sign-in");
      } finally {
        setIsLoading(false);
      }
    };

    checkTeacherStatus();
  }, [user, dispatch, router]);

  return { isTeacher, isLoading };
}
