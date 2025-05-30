"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { Switch } from "~/components/ui/switch";
import { useToast } from "~/components/ui/use-toast";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface ManualFormValues {
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

interface AiFormValues {
  title: string;
  description: string;
  courseId: string;
  contentForAi: string;
  status: string;
  startTime: string;
  endTime: string;
  duration: string;
  isTimeLimited?: boolean;
}

const CreateQuizPage = () => {
  const [isAiTab, setIsAiTab] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const router = useRouter();
  const user = useSelector((state: any) => state.user.user);

  useEffect(() => {
    if (user?.taughtClasses) {
      const teacherCourses = user.taughtClasses.flatMap(
        (cls: any) => cls.courses || [],
      );
      setCourses(teacherCourses);
    }
  }, [user]);

  const manualFormik = useFormik<ManualFormValues>({
    initialValues: {
      title: "",
      description: "",
      courseId: "",
      questions: [
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          points: 1,
        },
      ],
      status: "ACTIVE",
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
      console.log("Manual form submission triggered", values);
      setIsSubmitting(true);
      try {
        const formData = {
          ...values,
          userId: user.id,
          duration: values.isTimeLimited ? parseInt(values.duration) : null,
          isAiGenerated: false,
        };

        const dataToSubmit: Record<string, any> = { ...formData };
        if ("isTimeLimited" in dataToSubmit) {
          delete dataToSubmit.isTimeLimited;
        }

        console.log("Submitting manual quiz data:", dataToSubmit);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz`,
          dataToSubmit,
        );

        console.log("Manual quiz creation response:", response.data);
        if (response.data.success) {
          toast({
            title: "Quiz created successfully",
          });
          router.push("/teacher/quizzes");
        } else {
          toast({
            title: "Failed to create quiz",
            description: response.data.message || "Failed to create quiz",
          });
        }
      } catch (error) {
        console.error("Error creating quiz:", error);
        toast({
          title: "Failed to create quiz",
          description: "Failed to create quiz",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const aiFormik = useFormik<AiFormValues>({
    initialValues: {
      title: "",
      description: "",
      courseId: "",
      contentForAi: "",
      status: "ACTIVE",
      startTime: "",
      endTime: "",
      duration: "",
      isTimeLimited: false,
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      courseId: Yup.string().required("Course is required"),
      contentForAi: Yup.string().required(
        "Content for AI generation is required",
      ),
    }),
    onSubmit: async (values) => {
      console.log("AI form submission triggered", values);
      if (generatedQuestions.length === 0) {
        toast({
          title: "Please generate questions first",
        });
        return;
      }

      setIsSubmitting(true);
      try {
        const dataToSubmit: Record<string, any> = {
          userId: user?.id,
          questions: generatedQuestions,
          duration: values.isTimeLimited ? parseInt(values.duration) : null,
          isAiGenerated: true,
          title: values.title,
          description: values.description,
          courseId: values.courseId,
          contentForAi: values.contentForAi,
          status: values.status,
        };

        if ("isTimeLimited" in dataToSubmit) {
          delete dataToSubmit.isTimeLimited;
        }

        console.log("Submitting AI quiz data:", dataToSubmit);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz`,
          dataToSubmit,
        );

        console.log("AI quiz creation response:", response.data);
        if (response.data.success) {
          toast({
            title: "Quiz created successfully",
          });
          router.push("/teacher/quizzes");
        } else {
          toast({
            title: "Failed to create quiz",
            description: response.data.message || "Failed to create quiz",
          });
        }
      } catch (error) {
        console.error("Error creating quiz:", error);
        toast({
          title: "Failed to create quiz",
          description: "Failed to create quiz",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const generateQuestionsWithAI = async () => {
    const { contentForAi } = aiFormik.values;
    if (!contentForAi) {
      toast({
        title: "Please enter content for AI to generate questions",
      });
      return;
    }

    setIsGeneratingQuestions(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/generate-questions`,
        {
          content: contentForAi,
        },
      );

      if (response.data.success) {
        setGeneratedQuestions(response.data.data);
        toast({
          title: "Questions generated successfully",
        });
      } else {
        toast({
          title: "Failed to generate questions",
          description: response.data.message || "Failed to generate questions",
        });
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({
        title: "Failed to generate questions",
        description:
          "Failed to generate questions. Ensure the content is clear and specific.",
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const addQuestion = () => {
    manualFormik.setFieldValue("questions", [
      ...manualFormik.values.questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        points: 1,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (manualFormik.values.questions.length > 1) {
      const updatedQuestions = [...manualFormik.values.questions];
      updatedQuestions.splice(index, 1);
      manualFormik.setFieldValue("questions", updatedQuestions);
    } else {
      toast({
        title: "You must have at least one question",
      });
    }
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    const updatedQuestions = [...manualFormik.values.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    manualFormik.setFieldValue("questions", updatedQuestions);
  };

  const handleCorrectAnswerChange = (
    questionIndex: number,
    optionIndex: number,
  ) => {
    const updatedQuestions = [...manualFormik.values.questions];
    updatedQuestions[questionIndex].correctAnswer = optionIndex;
    manualFormik.setFieldValue("questions", updatedQuestions);
  };

  const getQuestionError = (index: number, field: string): string => {
    const errors = manualFormik.errors.questions;
    if (Array.isArray(errors) && errors[index]) {
      const fieldError = errors[index];
      if (typeof fieldError !== "string" && fieldError) {
        if (field.includes(".")) {
          const [parentField, childIndex] = field.split(".");
          if (
            parentField === "options" &&
            fieldError.options &&
            Array.isArray(fieldError.options) &&
            fieldError.options[parseInt(childIndex)]
          ) {
            return fieldError.options[parseInt(childIndex)]?.toString() || "";
          }
          return "";
        }

        if (field in fieldError) {
          return fieldError[field as keyof typeof fieldError]?.toString() || "";
        }
      }
    }
    return "";
  };

  const submitManualForm = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Manual form submission triggered via click handler");
    manualFormik.handleSubmit();
  };

  const submitAIForm = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("AI form submission triggered via click handler");

    if (generatedQuestions.length === 0) {
      toast({
        title: "Please generate questions first",
      });
      return;
    }

    aiFormik.handleSubmit();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => router.push("/teacher/quizzes")}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 text-2xl" />
        </Button>
        <h1 className="text-3xl font-bold">Create Quiz</h1>
      </div>

      <div className="mx-auto max-w-3xl">
        <Tabs
          defaultValue="manual"
          onValueChange={(value) => setIsAiTab(value === "ai")}
          className="mb-6"
        >
          <TabsList className="w-full">
            <TabsTrigger value="manual" className="flex-1">
              Manual
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex-1">
              AI-Assisted
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <form onSubmit={submitManualForm} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={manualFormik.values.title}
                      onChange={manualFormik.handleChange}
                      onBlur={manualFormik.handleBlur}
                      placeholder="Enter quiz title"
                    />
                    {manualFormik.touched.title && manualFormik.errors.title ? (
                      <div className="text-red-500 mt-1 text-sm">
                        {manualFormik.errors.title}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={manualFormik.values.description}
                      onChange={manualFormik.handleChange}
                      placeholder="Enter quiz description"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="courseId">Course</Label>
                    <select
                      id="courseId"
                      name="courseId"
                      value={manualFormik.values.courseId}
                      onChange={manualFormik.handleChange}
                      onBlur={manualFormik.handleBlur}
                      className="w-full rounded-md border p-2"
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                    {manualFormik.touched.courseId &&
                    manualFormik.errors.courseId ? (
                      <div className="text-red-500 mt-1 text-sm">
                        {manualFormik.errors.courseId}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isTimeLimited"
                          checked={manualFormik.values.isTimeLimited}
                          onCheckedChange={(checked) =>
                            manualFormik.setFieldValue("isTimeLimited", checked)
                          }
                        />
                        <Label htmlFor="isTimeLimited">Time limited quiz</Label>
                      </div>

                      {manualFormik.values.isTimeLimited && (
                        <div className="mt-4">
                          <Label htmlFor="duration">Duration (minutes)</Label>
                          <Input
                            id="duration"
                            name="duration"
                            type="number"
                            value={manualFormik.values.duration}
                            onChange={manualFormik.handleChange}
                            placeholder="Enter quiz duration in minutes"
                            min="1"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="startTime">Start Time (Optional)</Label>
                        <Input
                          id="startTime"
                          name="startTime"
                          type="datetime-local"
                          value={manualFormik.values.startTime}
                          onChange={manualFormik.handleChange}
                        />
                      </div>

                      <div>
                        <Label htmlFor="endTime">End Time (Optional)</Label>
                        <Input
                          id="endTime"
                          name="endTime"
                          type="datetime-local"
                          value={manualFormik.values.endTime}
                          onChange={manualFormik.handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Questions</CardTitle>
                  <Button type="button" variant="outline" onClick={addQuestion}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {manualFormik.values.questions.map((question, qIndex) => (
                    <div
                      key={qIndex}
                      className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-lg font-medium">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            {qIndex + 1}
                          </span>
                          Question {qIndex + 1}
                        </h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mb-4 space-y-2">
                        <Label htmlFor={`question-${qIndex}`}>
                          Question Text
                        </Label>
                        <Textarea
                          id={`question-${qIndex}`}
                          name={`questions[${qIndex}].question`}
                          value={question.question}
                          onChange={manualFormik.handleChange}
                          placeholder="Enter your question here"
                          className="min-h-[80px]"
                        />
                        {getQuestionError(qIndex, "question") && (
                          <div className="text-red-500 text-sm">
                            {getQuestionError(qIndex, "question")}
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <div className="mb-2 flex items-center justify-between">
                          <Label>Options</Label>
                          <div className="text-sm text-muted-foreground">
                            Select the correct answer
                          </div>
                        </div>

                        <div className="grid gap-3">
                          {question.options.map((option, oIndex) => (
                            <div
                              key={oIndex}
                              className={`flex items-center gap-3 rounded-md border p-3 transition-colors ${
                                question.correctAnswer === oIndex
                                  ? "border-primary bg-primary/5"
                                  : "hover:bg-muted"
                              }`}
                            >
                              <div className="flex-shrink-0">
                                <Checkbox
                                  id={`question-${qIndex}-option-${oIndex}`}
                                  checked={question.correctAnswer === oIndex}
                                  onCheckedChange={() =>
                                    handleCorrectAnswerChange(qIndex, oIndex)
                                  }
                                />
                              </div>
                              <div className="flex-grow">
                                <Input
                                  value={option}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      qIndex,
                                      oIndex,
                                      e.target.value,
                                    )
                                  }
                                  placeholder={`Option ${oIndex + 1}`}
                                  className={`border-none bg-transparent p-0 shadow-none focus-visible:ring-0 ${
                                    question.correctAnswer === oIndex
                                      ? "font-medium"
                                      : ""
                                  }`}
                                />
                              </div>
                            </div>
                          ))}
                          {getQuestionError(qIndex, "options") && (
                            <div className="text-red-500 text-sm">
                              {getQuestionError(qIndex, "options")}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`points-${qIndex}`}>Points</Label>
                        <Input
                          id={`points-${qIndex}`}
                          name={`questions[${qIndex}].points`}
                          type="number"
                          value={question.points}
                          onChange={manualFormik.handleChange}
                          min="1"
                          className="mt-1 w-24"
                        />
                      </div>
                    </div>
                  ))}

                  {manualFormik.touched.questions &&
                    typeof manualFormik.errors.questions === "string" && (
                      <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
                        {manualFormik.errors.questions}
                      </div>
                    )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addQuestion}
                    className="mt-2 w-full border-dashed py-6"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Question
                  </Button>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/teacher/quizzes")}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={submitManualForm}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Quiz"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="ai">
            <form onSubmit={submitAIForm} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="ai-title">Title</Label>
                    <Input
                      id="ai-title"
                      name="title"
                      value={aiFormik.values.title}
                      onChange={aiFormik.handleChange}
                      onBlur={aiFormik.handleBlur}
                      placeholder="Enter quiz title"
                    />
                    {aiFormik.touched.title && aiFormik.errors.title ? (
                      <div className="text-red-500 mt-1 text-sm">
                        {aiFormik.errors.title}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <Label htmlFor="ai-description">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="ai-description"
                      name="description"
                      value={aiFormik.values.description}
                      onChange={aiFormik.handleChange}
                      placeholder="Enter quiz description"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="ai-courseId">Course</Label>
                    <select
                      id="ai-courseId"
                      name="courseId"
                      value={aiFormik.values.courseId}
                      onChange={aiFormik.handleChange}
                      onBlur={aiFormik.handleBlur}
                      className="w-full rounded-md border p-2"
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                    {aiFormik.touched.courseId && aiFormik.errors.courseId ? (
                      <div className="text-red-500 mt-1 text-sm">
                        {aiFormik.errors.courseId}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="ai-isTimeLimited"
                          checked={aiFormik.values.isTimeLimited}
                          onCheckedChange={(checked) =>
                            aiFormik.setFieldValue("isTimeLimited", checked)
                          }
                        />
                        <Label htmlFor="ai-isTimeLimited">
                          Time limited quiz
                        </Label>
                      </div>

                      {aiFormik.values.isTimeLimited && (
                        <div className="mt-4">
                          <Label htmlFor="ai-duration">
                            Duration (minutes)
                          </Label>
                          <Input
                            id="ai-duration"
                            name="duration"
                            type="number"
                            value={aiFormik.values.duration}
                            onChange={aiFormik.handleChange}
                            placeholder="Enter quiz duration in minutes"
                            min="1"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="ai-startTime">
                          Start Time (Optional)
                        </Label>
                        <Input
                          id="ai-startTime"
                          name="startTime"
                          type="datetime-local"
                          value={aiFormik.values.startTime}
                          onChange={aiFormik.handleChange}
                        />
                      </div>

                      <div>
                        <Label htmlFor="ai-endTime">End Time (Optional)</Label>
                        <Input
                          id="ai-endTime"
                          name="endTime"
                          type="datetime-local"
                          value={aiFormik.values.endTime}
                          onChange={aiFormik.handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 rounded-md border border-yellow-200 bg-yellow-50 p-4">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
                    <div>
                      <p className="text-sm text-yellow-800">
                        Provide educational content, notes, or a lesson text.
                        The AI will generate quiz questions based on this
                        content. For best results, keep the content focused and
                        include key facts or concepts you want to test.
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contentForAi">
                      Content for AI Generation
                    </Label>
                    <Textarea
                      id="contentForAi"
                      name="contentForAi"
                      value={aiFormik.values.contentForAi}
                      onChange={aiFormik.handleChange}
                      onBlur={aiFormik.handleBlur}
                      placeholder="Enter educational content for AI to generate questions from..."
                      rows={8}
                      className="font-mono"
                    />
                    {aiFormik.touched.contentForAi &&
                    aiFormik.errors.contentForAi ? (
                      <div className="text-red-500 mt-1 text-sm">
                        {aiFormik.errors.contentForAi}
                      </div>
                    ) : null}
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                    onClick={generateQuestionsWithAI}
                    disabled={isGeneratingQuestions}
                  >
                    {isGeneratingQuestions ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Questions with AI
                      </>
                    )}
                  </Button>

                  {generatedQuestions.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h3 className="font-semibold">Generated Questions</h3>
                      {generatedQuestions.map((question, index) => (
                        <div key={index} className="rounded-lg border p-4">
                          <h4 className="mb-2 font-medium">
                            {index + 1}. {question.question}
                          </h4>
                          <ul className="space-y-1">
                            {question.options.map((option, oIndex) => (
                              <li
                                key={oIndex}
                                className={`border-l-2 pl-2 ${
                                  oIndex === question.correctAnswer
                                    ? "border-green-500 text-green-700"
                                    : "border-gray-300"
                                }`}
                              >
                                {option}
                                {oIndex === question.correctAnswer &&
                                  " (Correct)"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/teacher/quizzes")}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={submitAIForm}
                  disabled={isSubmitting || generatedQuestions.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Quiz"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreateQuizPage;
