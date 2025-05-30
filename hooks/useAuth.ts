import { useMutation } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { useToast } from "~/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginUser, logoutUser } from "~/store/slices/userSlice";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useLogin = () => {
  const [cookie, setCookie] = useCookies(["token", "user"]);
  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Update the user's activity streak
      try {
        await fetch(`${backendUrl}/api/user/streak/${data.user.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
        });
      } catch (streakError) {
        console.error("Error updating streak:", streakError);
        // Continue with login even if streak update fails
      }

      setCookie("token", data.token, { path: "/" });
      setCookie("user", JSON.stringify(data.user), { path: "/" });
      localStorage.setItem("user", JSON.stringify(data.user));
      dispatch(loginUser(data.user));

      return data.user;
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Something went wrong";
      toast({
        variant: "destructive",
        description: errorMessage,
      });
    },
  });
};

export const useRegister = () => {
  const { toast } = useToast();
  const router = useRouter();
  const loginMutation = useLogin();

  return useMutation({
    mutationFn: async (values: {
      name: string;
      email: string;
      password: string;
      classNumber: string;
    }) => {
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (data.token) {
        await loginMutation.mutateAsync({
          email: values.email,
          password: values.password,
        });
        router.push("/");
      }

      return data;
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Something went wrong";
      toast({
        variant: "destructive",
        description: errorMessage,
      });
    },
  });
};

export const useLogout = () => {
  const [, , removeCookie] = useCookies(["token", "user"]);
  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async () => {
      try {
        await fetch(`${backendUrl}/api/auth/logout`, {
          method: "POST",
        });

        removeCookie("token", { path: "/" });
        removeCookie("user", { path: "/" });

        dispatch(logoutUser());

        router.push("/sign-in");
      } catch (error) {
        const errorMessage = "Something went wrong";
        toast({
          variant: "destructive",
          description: errorMessage,
        });
      }
    },
  });
};
