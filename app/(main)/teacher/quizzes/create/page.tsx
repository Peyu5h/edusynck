"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useToast } from "~/components/ui/use-toast";
import CreateQuizHeader from "~/components/CreateQuiz/Header";
import DetailsForm from "~/components/CreateQuiz/DetailsForm";
import QuestionsEditor, {
  Question,
} from "~/components/CreateQuiz/QuestionsEditor";
import AiAssistPanel from "~/components/CreateQuiz/AiAssistPanel";
import { Button } from "~/components/ui/button";

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

const CreateQuizPage = () => {
  const [aiEnabled, setAiEnabled] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiContent, setAiContent] = useState("");
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
      setIsSubmitting(true);
      try {
        const payload: Record<string, any> = {
          userId: user.id,
          title: values.title,
          description: values.description,
          courseId: values.courseId,
          questions: values.questions,
          duration: values.isTimeLimited ? parseInt(values.duration) : null,
          isAiGenerated: aiEnabled,
          status: values.status,
        };

        if (aiEnabled) {
          payload.contentForAi = aiContent;
        }
        delete (payload as any).isTimeLimited;

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz`,
          payload,
        );

        if (response.data.success) {
          toast({ title: "Quiz created successfully" });
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
    if (!aiContent) {
      toast({
        title: "Please enter content for AI to generate questions",
      });
      return;
    }

    setIsGeneratingQuestions(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/generate-questions`,
        { content: aiContent },
      );

      if (response.data.success) {
        const drafted: Question[] = response.data.data;
        setGeneratedQuestions(drafted);
        manualFormik.setFieldValue("questions", drafted);
        toast({ title: "Questions generated successfully" });
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
      toast({ title: "You must have at least one question" });
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
    const errors = (manualFormik.errors as any).questions;
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

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <div className="container mx-auto w-full max-w-5xl flex-1 px-4 py-4">
        <CreateQuizHeader />
        <form className="space-y-6 pb-24">
          <DetailsForm
            courses={courses}
            values={manualFormik.values}
            errors={manualFormik.errors as any}
            touched={manualFormik.touched as any}
            onChange={manualFormik.handleChange}
            onBlur={manualFormik.handleBlur}
            setFieldValue={manualFormik.setFieldValue}
            aiEnabled={aiEnabled}
            onToggleAi={(checked) => setAiEnabled(!!checked)}
          />

          {aiEnabled && (
            <AiAssistPanel
              value={aiContent}
              onChange={setAiContent}
              onGenerate={generateQuestionsWithAI}
              isGenerating={isGeneratingQuestions}
              generatedQuestions={generatedQuestions}
            />
          )}

          <QuestionsEditor
            questions={manualFormik.values.questions}
            errors={manualFormik.errors}
            getQuestionError={getQuestionError}
            onChangeField={(path, value) =>
              manualFormik.setFieldValue(path, value)
            }
            onAdd={addQuestion}
            onRemove={removeQuestion}
            onOptionChange={handleOptionChange}
            onCorrectChange={handleCorrectAnswerChange}
          />
        </form>
      </div>

      <div className="fixed inset-x-0 top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-end gap-3 py-3">
            <Button
              type="button"
              className=""
              onClick={() => {
                if (aiEnabled && manualFormik.values.questions.length === 0) {
                  toast({ title: "Please generate questions first" });
                  return;
                }
                manualFormik.handleSubmit();
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Publish Quiz"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizPage;
