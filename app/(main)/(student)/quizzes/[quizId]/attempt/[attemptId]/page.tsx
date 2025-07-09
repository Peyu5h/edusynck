"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";

interface Question {
  id: string;
  question: string;
  options: string[];
  order: number;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startTime: string | null;
  endTime: string | null;
  duration: number | null;
  course: {
    name: string;
  };
  questions: Question[];
}

interface Attempt {
  id: string;
  quizId: string;
  startedAt: string;
  status: string;
}

export default function QuizAttemptPage() {
  const { quizId, attemptId } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const router = useRouter();
  const user = useSelector((state: any) => state.user.user);

  const fetchQuizAndAttempt = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch quiz data
      const quizResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/${quizId}?userId=${user?.id}`,
      );
      setQuiz(quizResponse.data);

      // Fetch attempt data
      const attemptResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/attempt/${attemptId}`,
      );
      setAttempt(attemptResponse.data);

      // Fetch any existing answers
      const answersResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/attempt/${attemptId}/answers`,
      );

      if (answersResponse.data.answers) {
        // Convert the answers array to the format we need
        const answersMap: Record<string, number | null> = {};
        answersResponse.data.answers.forEach((answer: any) => {
          answersMap[answer.questionId] = answer.selectedOption;
        });
        setAnswers(answersMap);
      }
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      toast.error("Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  }, [quizId, attemptId, user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchQuizAndAttempt();
    }
  }, [fetchQuizAndAttempt, user?.id]);

  // Timer setup
  useEffect(() => {
    if (!quiz || !attempt) return;

    let timerId: NodeJS.Timeout;

    if (quiz.duration) {
      // Calculate end time based on start time and duration
      const startTime = new Date(attempt.startedAt).getTime();
      const endTime = startTime + quiz.duration * 60 * 1000;
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        // Time's up - submit the quiz
        submitQuiz();
      } else {
        setTimeRemaining(Math.floor(remaining / 1000));

        timerId = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev === null || prev <= 0) {
              clearInterval(timerId);
              submitQuiz();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [quiz, attempt]);

  const handleAnswerSelect = async (
    questionId: string,
    optionIndex: number,
  ) => {
    // Update local state
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));

    // Send to server
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/attempt/${attemptId}/answer`,
        {
          questionId,
          selectedOption: optionIndex,
        },
      );
    } catch (error) {
      console.error("Error saving answer:", error);
      // Don't show an error toast as it would be disruptive during the quiz
    }
  };

  const navigateToQuestion = (index: number) => {
    if (index >= 0 && quiz && index < quiz.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const submitQuiz = async () => {
    if (!quiz || !attempt) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/attempt/${attemptId}/complete`,
      );

      if (response.data) {
        toast.success("Quiz submitted successfully");
        router.push(`/quizzes/${quizId}/results/${attemptId}`);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getQuestionStatusIcon = (questionId: string) => {
    if (answers[questionId] !== undefined && answers[questionId] !== null) {
      return <CheckCircle2 className="text-green-500 h-4 w-4" />;
    }
    return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
  };

  const getCompletionPercentage = (): number => {
    if (!quiz) return 0;
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / quiz.questions.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz || !attempt) {
    return (
      <div className="container mx-auto py-8">
        <div className="border-red-200 bg-red-50 rounded-lg border p-4 text-center">
          <AlertCircle className="text-red-500 mx-auto mb-2 h-10 w-10" />
          <h2 className="text-red-800 text-lg font-semibold">Quiz Not Found</h2>
          <p className="text-red-600">
            The quiz you're looking for doesn't exist or has expired.
          </p>
          <Button className="mt-4" onClick={() => router.push("/quizzes")}>
            Return to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="container mx-auto py-6">
      {/* Quiz header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{quiz.course.name}</span>
            <span>•</span>
            <span>{quiz.questions.length} questions</span>
          </div>
        </div>

        {timeRemaining !== null && (
          <div
            className={`flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 ${timeRemaining < 300 ? "text-red-500" : ""}`}
          >
            <Clock className="h-4 w-4" />
            <span className="font-mono">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-6 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${getCompletionPercentage()}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Question navigation sidebar */}
        <div className="order-2 md:order-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question Navigator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {quiz.questions.map((question, index) => (
                  <Button
                    key={question.id}
                    variant={
                      index === currentQuestionIndex ? "default" : "outline"
                    }
                    className={`h-10 w-10 p-0 ${
                      answers[question.id] !== undefined
                        ? "border-green-500"
                        : ""
                    }`}
                    onClick={() => navigateToQuestion(index)}
                  >
                    <span className="sr-only">Question {index + 1}</span>
                    <span>{index + 1}</span>
                  </Button>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-green-500 h-4 w-4" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span>Unanswered</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                onClick={() => setShowConfirmSubmit(true)}
                className="bg-green-600 hover:bg-green-700 w-full"
              >
                Submit Quiz
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Question and answer area */}
        <div className="order-1 md:order-2 md:col-span-3">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="bg-primary/10 text-primary">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </Badge>
                <Badge variant="outline">
                  {currentQuestion.points}{" "}
                  {currentQuestion.points === 1 ? "point" : "points"}
                </Badge>
              </div>
              <CardTitle className="mt-2 text-xl">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQuestion.options.map((option, oIndex) => (
                <div
                  key={oIndex}
                  className={`flex cursor-pointer items-start space-x-3 rounded-md border p-3 transition-colors ${
                    answers[currentQuestion.id] === oIndex
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => handleAnswerSelect(currentQuestion.id, oIndex)}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      answers[currentQuestion.id] === oIndex
                        ? "border-primary bg-primary text-white"
                        : "border-muted-foreground/20"
                    }`}
                  >
                    {String.fromCharCode(65 + oIndex)}
                  </div>
                  <div className="flex-1">
                    <p>{option}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <Button
                  onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => setShowConfirmSubmit(true)} className="">
                  Finish Quiz
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Submit confirmation */}
          {showConfirmSubmit && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <CardTitle className="text-lg text-yellow-800">
                    Ready to submit?
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-700">
                  You&apos;ve answered {Object.keys(answers).length} of{" "}
                  {quiz.questions.length} questions.
                  {Object.keys(answers).length < quiz.questions.length &&
                    " Some questions are still unanswered."}
                </p>
                <p className="mt-2 text-sm text-yellow-600">
                  Once submitted, you won't be able to change your answers.
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmSubmit(false)}
                >
                  Continue Quiz
                </Button>
                <Button onClick={submitQuiz} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Quiz"
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
