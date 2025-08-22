import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { hydrateUser } from "~/store/slices/userSlice";

export const useUser = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run this once on mount to hydrate from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser && !user) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("useUser: Hydrating user from localStorage:", parsedUser);
        dispatch(hydrateUser(parsedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, [dispatch]); // Remove user dependency to prevent loops

  useEffect(() => {
    // Sync user to localStorage when it changes
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  return { user, isLoading, error: null };
};
