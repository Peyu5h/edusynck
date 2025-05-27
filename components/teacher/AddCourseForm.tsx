"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useToast } from "~/components/ui/use-toast";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

const addCourseSchema = yup.object().shape({
  name: yup.string().required("Course name is required"),
  classId: yup.string().required("Class is required"),
  googleClassroomId: yup.string().required("Google Classroom ID is required"),
  professorName: yup.string(),
  professorProfilePicture: yup.string(),
});

const AddCourseForm = () => {
  const { toast } = useToast();
  const user = useSelector((state: any) => state.user.user);
  const taughtClasses = user?.taughtClasses || [];
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      classId: taughtClasses[0]?.id || "",
      googleClassroomId: "",
      professorName: user?.name || "",
      professorProfilePicture: "",
    },
    validationSchema: addCourseSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/courses`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${document.cookie.split("token=")[1]?.split(";")[0]}`,
            },
            body: JSON.stringify(values),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to add course");
        }

        toast({
          title: "Success",
          description: "Course added successfully",
        });

        resetForm();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to add course",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Course</CardTitle>
        <CardDescription>Create a new course for your class</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Course Name</Label>
            <Input
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter course name"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-sm">{formik.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="classId">Class</Label>
            <Select
              name="classId"
              value={formik.values.classId}
              onValueChange={(value) => formik.setFieldValue("classId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {taughtClasses.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {formik.touched.classId && formik.errors.classId && (
              // @ts-ignore
              <p className="text-red-500 text-sm">{formik.errors.classId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="googleClassroomId">Google Classroom ID</Label>
            <Input
              id="googleClassroomId"
              name="googleClassroomId"
              value={formik.values.googleClassroomId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter Google Classroom ID"
            />
            {formik.touched.googleClassroomId &&
              formik.errors.googleClassroomId && (
                <p className="text-red-500 text-sm">
                  {formik.errors.googleClassroomId}
                </p>
              )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="professorName">Professor Name</Label>
            <Input
              id="professorName"
              name="professorName"
              value={formik.values.professorName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter professor name"
            />
            {formik.touched.professorName && formik.errors.professorName && (
              <p className="text-red-500 text-sm">
                {/* @ts-ignore */}
                {formik.errors.professorName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="professorProfilePicture">
              Professor Profile Picture URL
            </Label>
            <Input
              id="professorProfilePicture"
              name="professorProfilePicture"
              value={formik.values.professorProfilePicture}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter profile picture URL (optional)"
            />
            {formik.touched.professorProfilePicture &&
              formik.errors.professorProfilePicture && (
                <p className="text-red-500 text-sm">
                  {formik.errors.professorProfilePicture}
                </p>
              )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Course...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Course
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddCourseForm;
