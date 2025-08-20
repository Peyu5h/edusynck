import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserDetails, hydrateUser } from "~/store/slices/userSlice";

export const useUser = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);

  const {
    data: fetchedUser,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: () => fetchUserDetails(user?.id || ""),
    enabled: !!user?.id && !user, // Only fetch if we have an ID but no user data
    staleTime: Infinity,
    retry: false, // Don't retry failed requests
  });

  useEffect(() => {
    if (fetchedUser) {
      dispatch(hydrateUser(fetchedUser));
    }
  }, [fetchedUser, dispatch]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && !user) {
      try {
        const parsedUser = JSON.parse(storedUser);
        dispatch(hydrateUser(parsedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Return loading state only if we don't have user data and we're not in the process of loading it
  const isActuallyLoading = isLoading && !user && !localStorage.getItem("user");

  return { user, isLoading: isActuallyLoading, error };
};
