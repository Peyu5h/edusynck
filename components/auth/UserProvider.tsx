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
        dispatch(loginUser(user));
      } catch (error) {
        console.error("Failed to parse user cookie:", error);
      }
    }
  }, [cookies.user, dispatch]);
};

export default UserProvider;
