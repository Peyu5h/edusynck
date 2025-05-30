"use client";

import React, { useState } from "react";
import InputField from "../InputBox";
import { useFormik } from "formik";
import { teacherRegisterSchema } from "~/lib/validation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "../ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRegisterTeacher } from "~/hooks/useTeacherAuth";

const TeacherRegisterForm = () => {
  const [showPass, setShowPass] = useState(false);
  const { mutate: registerTeacher, error, isPending } = useRegisterTeacher();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      classNumber: "",
    },

    validationSchema: teacherRegisterSchema,
    onSubmit: async (values) => {
      registerTeacher(values);
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
        <form onSubmit={handleSubmit} className="flex w-72 flex-col gap-y-4">
          <InputField
            id="name"
            label="Name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
            touched={touched.name}
            placeholder="Enter your name"
          />

          <div className="select flex w-72 gap-x-4">
            <div>
              <div className="mb-2 flex items-center">
                <label className="text-light-text dark:text-dark-text mb- ml-1 text-xs font-medium text-zinc-400">
                  Class
                </label>
              </div>
              <div>
                <Select
                  onValueChange={(value) => setFieldValue("classNumber", value)}
                  value={values.classNumber}
                >
                  <SelectTrigger className="w-[132px] text-zinc-400">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Class</SelectLabel>
                      <SelectItem value="TE-CMPN">TE-CMPN</SelectItem>
                      <SelectItem value="TE-ECS">TE-ECS</SelectItem>
                      <SelectItem disabled value="TE-INFT">
                        TE-INFT
                      </SelectItem>
                      <SelectItem disabled value="SE-CMPN">
                        SE-CMPN
                      </SelectItem>
                      <SelectItem disabled value="SE-EXTC">
                        SE-EXTC
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
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
              Register as Teacher
            </Button>
          )}
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link className="text-orange hover:underline" href="/sign-in">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherRegisterForm;
