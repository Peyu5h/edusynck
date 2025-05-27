import { useMutation } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { useToast } from "~/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginUser } from "~/store/slices/userSlice";
import { TeacherRegisterValues } from "~/lib/validation";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useRegisterTeacher = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [cookie, setCookie] = useCookies(["token", "user"]);
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (values: TeacherRegisterValues) => {
      const response = await fetch(`${backendUrl}/api/auth/register-teacher`, {
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

      return data;
    },
    onSuccess: (data) => {
      if (data.token) {
        setCookie("token", data.token, { path: "/" });
        setCookie("user", JSON.stringify(data.user), { path: "/" });
        localStorage.setItem("user", JSON.stringify(data.user));
        dispatch(loginUser(data.user));

        // Explicitly navigate to teacher dashboard
        router.push("/teacher");
      }
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
