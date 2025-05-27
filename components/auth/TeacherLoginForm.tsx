"use client";

import React, { useState } from "react";
import InputField from "../InputBox";
import { useFormik } from "formik";
import { loginSchema } from "~/lib/validation";
import { Button } from "../ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";
import { useToast } from "~/components/ui/use-toast";
import { useDispatch } from "react-redux";
import { loginUser } from "~/store/slices/userSlice";

const TeacherLoginForm = () => {
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [cookie, setCookie] = useCookies(["token", "user"]);
  const { toast } = useToast();
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setIsPending(true);
      try {
        console.log("Starting teacher login request");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          },
        );

        const data = await response.json();
        console.log("Login response received:", {
          status: response.status,
          ok: response.ok,
        });

        if (!response.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        const userData = data.user;
        console.log("Login successful, teacher data:", userData);
        console.log("User role:", userData.role);

        // Only proceed if the user is a teacher
        if (userData.role !== "CLASS_TEACHER") {
          console.log("Role check failed:", userData.role);
          throw new Error("This account is not registered as a teacher");
        }

        console.log("Storing user data in cookies and localStorage");
        // Store user data
        setCookie("token", data.token, { path: "/" });
        setCookie("user", JSON.stringify(userData), { path: "/" });
        localStorage.setItem("user", JSON.stringify(userData));

        console.log("Dispatching loginUser action to Redux");
        dispatch(loginUser(userData));

        // Use setTimeout to ensure state is updated before redirecting
        console.log("Setting up redirect with timeout");
        setTimeout(() => {
          console.log("Redirecting to teacher dashboard...");
          // Use window.location for a hard redirect instead of the Next.js router
          window.location.href = "/teacher";
        }, 1000);
      } catch (error: any) {
        console.error("Login error:", error);
        const errorMessage = error?.message || "Something went wrong";
        toast({
          variant: "destructive",
          description: errorMessage,
        });
      } finally {
        setIsPending(false);
      }
    },
  });

  const { errors, touched, handleChange, handleBlur, handleSubmit, values } =
    formik;

  return (
    <div>
      <div className="flex h-[80vh] w-full items-center rounded-[1rem] p-8">
        <form onSubmit={handleSubmit} className="flex w-72 flex-col gap-y-8">
          <InputField
            id="email"
            label="Email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            touched={touched.email}
            placeholder="Enter your email"
          />

          <InputField
            id="password"
            label="Password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your password"
            showPass={showPass}
            setShowPass={setShowPass}
            error={errors.password}
            touched={touched.password}
          />

          {isPending ? (
            <Button className="w-full py-6" disabled>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button className="w-full py-6" type="submit">
              Sign in as Teacher
            </Button>
          )}

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              className="text-orange-500 text-orange hover:underline"
              href="/sign-up"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherLoginForm;
