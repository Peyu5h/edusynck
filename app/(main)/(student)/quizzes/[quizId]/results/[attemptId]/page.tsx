"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  Trophy,
  Loader2,
  BookOpen,
  BarChart,
} from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  order: number;
}

interface Answer {
  id: string;
  questionId: string;
  selectedOption: number | null;
  isCorrect: boolean | null;
  question: Question;
}

interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startedAt: string;
  completedAt: string;
  score: number;
  status: string;
  answers: Answer[];
  quiz: {
    title: string;
    description: string | null;
    course: {
      name: string;
    };
    questions: Question[];
  };
}

export default function QuizResultsPage() {
  const { quizId, attemptId } = useParams();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAttemptResults();
  }, [quizId, attemptId]);

  const fetchAttemptResults = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/attempt/${attemptId}/results`,
      );

      if (response.data) {
        setAttempt(response.data);
      } else {
        toast.error("Failed to load quiz results");
      }
    } catch (error) {
      console.error("Error fetching quiz results:", error);
      toast.error("Failed to load quiz results");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCompletionTime = (): string => {
    if (!attempt || !attempt.completedAt || !attempt.startedAt) return "N/A";

    const startTime = new Date(attempt.startedAt).getTime();
    const endTime = new Date(attempt.completedAt).getTime();
    const durationMs = endTime - startTime;

    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  const calculatePercentage = (): number => {
    if (!attempt || !attempt.quiz.questions.length) return 0;
    return Math.round((attempt.score / attempt.quiz.questions.length) * 100);
  };

  const getGradeText = (percentage: number): string => {
    if (percentage >= 90) return "Excellent!";
    if (percentage >= 80) return "Great job!";
    if (percentage >= 70) return "Good work!";
    if (percentage >= 60) return "Not bad!";
    if (percentage >= 50) return "You passed!";
    return "Keep practicing!";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-xl font-bold">Results not found</h2>
        <p className="mt-2 text-muted-foreground">
          The quiz results you're looking for don't exist or you don't have
          permission to view them.
        </p>
        <Button className="mt-4" onClick={() => router.push("/quizzes")}>
          Return to Quizzes
        </Button>
      </div>
    );
  }

  const percentage = calculatePercentage();
  const totalQuestions = attempt.quiz.questions.length;
  const correctAnswers = attempt.answers.filter((a) => a.isCorrect).length;
  const incorrectAnswers = attempt.answers.filter(
    (a) => a.isCorrect === false,
  ).length;
  const unansweredQuestions =
    totalQuestions - correctAnswers - incorrectAnswers;

  return (
    <div className="container mx-auto py-8">
      <Link href="/quizzes" passHref>
        <Button variant="ghost" className="mb-4 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Quizzes
        </Button>
      </Link>

      {/* Results summary */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{attempt.quiz.title} - Results</CardTitle>
              <CardDescription>
                {attempt.quiz.course.name} • Completed{" "}
                {format(
                  new Date(attempt.completedAt),
                  "MMMM d, yyyy 'at' h:mm a",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold">
                    {attempt.score} / {totalQuestions}
                  </div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold">{percentage}%</div>
                  <div className="text-sm text-muted-foreground">
                    Percentage
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold">
                    {calculateCompletionTime()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Completion Time
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex w-full flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Badge className="px-2 py-1">{attempt.status}</Badge>
                  {attempt.quiz.description && (
                    <span className="text-sm text-muted-foreground">
                      {attempt.quiz.description}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/quizzes/${quizId}/leaderboard`)
                    }
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Leaderboard
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-lg">Performance</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-primary/20">
                  <div className="text-3xl font-bold">{percentage}%</div>
                  <div
                    className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-primary shadow-lg"
                    style={{
                      transform: `rotate(${percentage * 3.6 - 90}deg) translateX(-54px) rotate(-${percentage * 3.6 - 90}deg)`,
                    }}
                  ></div>
                </div>

                <div className="text-center text-xl font-medium">
                  {getGradeText(percentage)}
                </div>

                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-green-500 h-4 w-4" />
                      <span className="text-sm">Correct</span>
                    </div>
                    <span className="text-sm font-medium">
                      {correctAnswers}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="text-red-500 h-4 w-4" />
                      <span className="text-sm">Incorrect</span>
                    </div>
                    <span className="text-sm font-medium">
                      {incorrectAnswers}
                    </span>
                  </div>

                  {unansweredQuestions > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border border-gray-300"></span>
                        <span className="text-sm">Unanswered</span>
                      </div>
                      <span className="text-sm font-medium">
                        {unansweredQuestions}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Questions and answers */}
      <h2 className="mb-4 text-2xl font-bold">Question Review</h2>
      <div className="space-y-6">
        {attempt.answers
          .sort((a, b) => a.question.order - b.question.order)
          .map((answer) => (
            <Card
              key={answer.id}
              className={`border-l-4 ${
                answer.isCorrect
                  ? "border-l-green-500"
                  : answer.selectedOption === null
                    ? "border-l-gray-300"
                    : "border-l-red-500"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Question {answer.question.order + 1}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={`${
                      answer.isCorrect
                        ? "border-green-500 bg-green-50 text-green-700"
                        : answer.selectedOption === null
                          ? "border-gray-300 bg-gray-50 text-gray-700"
                          : "border-red-500 bg-red-50 text-red-700"
                    }`}
                  >
                    {answer.isCorrect
                      ? "Correct"
                      : answer.selectedOption === null
                        ? "Unanswered"
                        : "Incorrect"}
                  </Badge>
                </div>
                <CardDescription className="mt-2 text-base font-medium">
                  {answer.question.question}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {answer.question.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 rounded-md border p-3 ${
                      answer.question.correctAnswer === index
                        ? "border-green-500 bg-green-50"
                        : answer.selectedOption === index && !answer.isCorrect
                          ? "border-red-500 bg-red-50"
                          : ""
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                        answer.question.correctAnswer === index
                          ? "border-green-500 bg-green-500 text-white"
                          : answer.selectedOption === index && !answer.isCorrect
                            ? "border-red-500 bg-red-500 text-white"
                            : answer.selectedOption === index
                              ? "border-primary bg-primary text-white"
                              : "border-gray-300"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="flex-1">
                      <p>{option}</p>
                    </div>
                    {answer.question.correctAnswer === index && (
                      <CheckCircle2 className="text-green-500 h-5 w-5" />
                    )}
                    {answer.selectedOption === index && !answer.isCorrect && (
                      <XCircle className="text-red-500 h-5 w-5" />
                    )}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  {answer.isCorrect
                    ? `+${answer.question.points} points`
                    : "0 points"}
                </div>
              </CardFooter>
            </Card>
          ))}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={() => router.push("/quizzes")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>

        <Button onClick={() => router.push(`/quizzes/${quizId}/leaderboard`)}>
          <Trophy className="mr-2 h-4 w-4" />
          View Leaderboard
        </Button>
      </div>
    </div>
  );
}
