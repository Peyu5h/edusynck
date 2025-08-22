"use client";

import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "~/store/slices/userSlice";

const UserProvider = () => {
  const [cookies] = useCookies(["user"]);
  const dispatch = useDispatch();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (hasInitialized) return;

    if (cookies.user) {
      try {
        const user = JSON.parse(cookies.user);
        console.log("UserProvider: Found user in cookies:", user);
        dispatch(loginUser(user));
        setHasInitialized(true);
        return;
      } catch (error) {
        console.error("Failed to parse user cookie:", error);
      }
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log("UserProvider: Found user in localStorage:", user);
        dispatch(loginUser(user));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    } else {
      console.log("UserProvider: No user data found");
    }

    setHasInitialized(true);
  }, [cookies.user, dispatch, hasInitialized]);

  return null;
};

export default UserProvider;
