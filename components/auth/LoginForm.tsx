"use client";

import React, { useState } from "react";
import InputField from "../InputBox";
import { useToast } from "../ui/use-toast";
import { useFormik } from "formik";
import { loginSchema } from "~/lib/validation";

import { Button } from "../ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { ToastAction } from "../ui/toast";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: values.email,
              password: values.password,
            }),
          },
        );

        const data = await response.json();
        console.log(data);
        if (data.token) {
          router.push("/");
        }

        if (!response.ok) {
          console.log(data);
          toast({
            variant: "destructive",
            description: data.error,
          });
          // throw new Error(data.error);
        }
      } catch (err) {
        toast({
          variant: "destructive",
          description: "Something went wrong",
        });
      } finally {
        setLoading(false);
      }
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

          {loading ? (
            <Button className="w-full py-6" disabled>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button className="w-full py-6" type="submit">
              Sign in
            </Button>
          )}
          <div style={{}} className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link className="text-orange-500 hover:underline" href="/sign-up">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
