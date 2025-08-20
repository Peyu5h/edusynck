"use client";

import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import { loginUser } from "~/store/slices/userSlice";

const UserProvider = () => {
  const [cookies] = useCookies(["user"]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (cookies.user) {
      try {
        const user = JSON.parse(cookies.user);
        console.log("UserProvider: Parsed user from cookies:", user);
        dispatch(loginUser(user));
      } catch (error) {
        console.error("Failed to parse user cookie:", error);
      }
    } else {
      console.log(
        "UserProvider: No user cookie found, checking localStorage...",
      );
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          dispatch(loginUser(user));
        } catch (error) {
          localStorage.removeItem("user");
        }
      } else {
        console.log("UserProvider: No user data found in localStorage");
      }
    }
  }, [cookies.user, dispatch]);

  return null;
};

export default UserProvider;
