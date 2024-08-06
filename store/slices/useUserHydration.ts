"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { hydrateUser } from "~/store/slices/userSlice";

export default function UserHydration() {
  const dispatch = useDispatch();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      dispatch(hydrateUser(JSON.parse(storedUser)));
    }
  }, [dispatch]);

  return null;
}
