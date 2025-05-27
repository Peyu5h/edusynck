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
    enabled: !!user?.id,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (fetchedUser) {
      dispatch(hydrateUser(fetchedUser));
    }
  }, [fetchedUser, dispatch]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      dispatch(hydrateUser(JSON.parse(storedUser)));
    }
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return { user, isLoading, error };
};
