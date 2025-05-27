"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { toast } from "sonner";
import { useSelector } from "react-redux";

interface Question {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface QuizFormValues {
  title: string;
  description: string;
  courseId: string;
  questions: Question[];
  status: string;
  startTime: string;
  endTime: string;
  duration: string;
  isTimeLimited: boolean;
}

export default function EditQuizPage() {
  const { quizId } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

  const user = useSelector((state: any) => state.user.user);
  const isTeacher = user?.role === "TEACHER";

  useEffect(() => {
    if (!isTeacher) {
      router.push("/quizzes");
      return;
    }

    if (user?.taughtClasses) {
      const teacherCourses = user.taughtClasses.flatMap(
        (cls: any) => cls.courses || [],
      );
      setCourses(teacherCourses);
    }

    fetchQuizData();
  }, [quizId, user]);

  const formik = useFormik<QuizFormValues>({
    initialValues: {
      title: "",
      description: "",
      courseId: "",
      questions: [],
      status: "DRAFT",
      startTime: "",
      endTime: "",
      duration: "",
      isTimeLimited: false,
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      courseId: Yup.string().required("Course is required"),
      questions: Yup.array()
        .of(
          Yup.object({
            question: Yup.string().required("Question text is required"),
            options: Yup.array()
              .of(Yup.string().required("Option text is required"))
              .min(4, "All options are required"),
            correctAnswer: Yup.number().required("Correct answer is required"),
            points: Yup.number().min(1, "Points must be at least 1"),
          }),
        )
        .min(1, "At least one question is required"),
    }),
    onSubmit: async (values) => {
      if (values.questions.length === 0) {
        toast.error("You must add at least one question");
        return;
      }

      // Prepare questions
      const questions = values.questions.map((q) => ({
        ...q,
        correctAnswer: Number(q.correctAnswer),
        points: Number(q.points || 1),
      }));

      setIsSubmitting(true);
      try {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/${quizId}`,
          {
            title: values.title,
            description: values.description,
            courseId: values.courseId,
            status: values.status,
            duration: values.isTimeLimited ? parseInt(values.duration) : null,
            startTime: values.startTime || null,
            endTime: values.endTime || null,
            questions: questions,
          },
        );

        if (response.data.success) {
          toast.success("Quiz updated successfully");
          router.push("/teacher/quizzes");
        } else {
          toast.error("Failed to update quiz");
        }
      } catch (error) {
        console.error("Error updating quiz:", error);
        toast.error("Failed to update quiz");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const fetchQuizData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/${quizId}`,
      );

      const quiz = response.data;

      formik.setValues({
        title: quiz.title || "",
        description: quiz.description || "",
        courseId: quiz.courseId || "",
        questions: quiz.questions.map((q: any) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points || 1,
        })),
        status: quiz.status || "DRAFT",
        startTime: quiz.startTime
          ? new Date(quiz.startTime).toISOString().substr(0, 16)
          : "",
        endTime: quiz.endTime
          ? new Date(quiz.endTime).toISOString().substr(0, 16)
          : "",
        duration: quiz.duration ? String(quiz.duration) : "",
        isTimeLimited: !!quiz.duration,
      });
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast.error("Failed to load quiz data");
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestions = [...formik.values.questions];
    newQuestions.push({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 1,
    });
    formik.setFieldValue("questions", newQuestions);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...formik.values.questions];
    newQuestions.splice(index, 1);
    formik.setFieldValue("questions", newQuestions);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/teacher/quizzes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quizzes
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Edit Quiz</h1>
        </div>
        <Button
          onClick={() => formik.handleSubmit()}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="mb-6 text-muted-foreground">
            This is a simplified edit page. For full quiz editing capabilities,
            use the settings page.
          </p>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter quiz title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.title && formik.errors.title && (
                  <p className="text-red-500 text-sm">{formik.errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseId">Course</Label>
                <Select
                  value={formik.values.courseId}
                  onValueChange={(value) =>
                    formik.setFieldValue("courseId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.courseId && formik.errors.courseId && (
                  <p className="text-red-500 text-sm">
                    {formik.errors.courseId}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter quiz description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formik.values.status}
                  onValueChange={(value) =>
                    formik.setFieldValue("status", value)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/teacher/quizzes/${quizId}/settings`)}
              className="w-full"
            >
              Go to Full Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
