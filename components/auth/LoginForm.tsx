"use client";

import React, { useState } from "react";
import InputField from "../InputBox";
import { useFormik } from "formik";
import { loginSchema } from "~/lib/validation";
import { Button } from "../ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLogin } from "~/hooks/useAuth";

const LoginForm = () => {
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();
  const [guestLoader, setGuestLoader] = useState(false);
  const [teacherLoader, setTeacherLoader] = useState(false);
  const { mutate: login, error, isPending } = useLogin();

  const guestInfo = { email: "123@gmail.com", password: "12345678" };
  const teacherInfo = { email: "pranali@gmail.com", password: "12345678" };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      console.log("Submitting login form with values:", values);
      login(values, {
        onSuccess: (userData) => {
          console.log("Login successful, user data:", userData);
          console.log("User role:", userData.role);

          // Manually redirect based on role
          if (userData.role === "CLASS_TEACHER") {
            router.push("/teacher");
          } else {
            router.push("/");
          }
        },
      });
    },
  });

  const {
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    values,
  } = formik;

  const handleGuestLogin = () => {
    setGuestLoader(true);

    login(guestInfo, {
      onSuccess: (userData) => {
        console.log("Login successful, user data:", userData);
        console.log("User role:", userData.role);
        setGuestLoader(false);

        // Manually redirect based on role
        if (userData.role === "CLASS_TEACHER") {
          router.push("/teacher");
        } else {
          router.push("/");
        }
      },
    });
  };

  const handleTeacherLogin = () => {
    setTeacherLoader(true);

    login(teacherInfo, {
      onSuccess: (userData) => {
        console.log("Login successful, user data:", userData);
        console.log("User role:", userData.role);
        setTeacherLoader(false);

        // Manually redirect based on role
        if (userData.role === "CLASS_TEACHER") {
          router.push("/teacher");
        } else {
          router.push("/");
        }
      },
    });
  };

  return (
    <div>
      <div className="flex w-full items-center rounded-[1rem] border p-2">
        <form
          onSubmit={handleSubmit}
          className="flex w-80 flex-col gap-y-8 rounded-lg p-8 shadow-lg backdrop-blur-sm"
        >
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
            <Button className="w-full bg-primary/80 py-6" type="submit">
              Sign in
            </Button>
          )}

          <h1 className="text-center text-sm text-muted-foreground">
            OR Continue as Guest
          </h1>
          <div className="flex space-x-2">
            {guestLoader ? (
              <Button className="w-full py-6" disabled>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button
                className="w-full bg-primary/80 py-6"
                type="button"
                onClick={handleGuestLogin}
                disabled={isPending}
              >
                Student
              </Button>
            )}

            {teacherLoader ? (
              <Button className="w-full py-6" disabled>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button
                className="w-full py-6"
                variant="outline"
                onClick={handleTeacherLogin}
                disabled={isPending}
              >
                Teacher
              </Button>
            )}
          </div>

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

export default LoginForm;
