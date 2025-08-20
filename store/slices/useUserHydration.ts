"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { hydrateUser } from "~/store/slices/userSlice";

export default function UserHydration() {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("UserHydration: Checking localStorage for user data...");
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log("UserHydration: Found user in localStorage:", user);
        dispatch(hydrateUser(user));
      } catch (error) {
        console.error("UserHydration: Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    } else {
      console.log("UserHydration: No user data found in localStorage");
    }
  }, [dispatch]);

  return null;
}
