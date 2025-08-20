"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Trophy } from "lucide-react";
import { useSelector } from "react-redux";
import ResultsSummary from "~/components/Quiz/ResultsSummary";
import ResultsPerformance from "~/components/Quiz/ResultsPerformance";
import QuestionReviewList from "~/components/Quiz/QuestionReviewList";
import { QuizResultsLoader } from "~/components/Loaders";
import { useQuizResults } from "~/hooks/useQuizData";

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
  const router = useRouter();

  // Use React Query hook for data fetching
  const { data: attempt, isLoading } = useQuizResults(attemptId as string);

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
    return <QuizResultsLoader />;
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
  const correctAnswers = attempt.answers.filter(
    (a: Answer) => a.isCorrect,
  ).length;
  const incorrectAnswers = attempt.answers.filter(
    (a: Answer) => a.isCorrect === false,
  ).length;
  const unansweredQuestions =
    totalQuestions - correctAnswers - incorrectAnswers;

  return (
    <div className="container mx-auto pb-8">
      <div className="mb-4 mt-4 flex justify-between">
        <Button variant="outline" onClick={() => router.push("/quizzes")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ResultsSummary
            title={attempt.quiz.title}
            courseName={attempt.quiz.course.name}
            completedAt={format(
              new Date(attempt.completedAt),
              "MMMM d, yyyy 'at' h:mm a",
            )}
            score={attempt.score}
            totalQuestions={totalQuestions}
            percentage={percentage}
            completionTimeText={calculateCompletionTime()}
            status={attempt.status}
            description={attempt.quiz.description}
            onLeaderboard={() => router.push(`/quizzes/${quizId}/leaderboard`)}
            correct={correctAnswers}
            incorrect={incorrectAnswers}
            unanswered={unansweredQuestions}
            quizId={quizId as string}
          />
        </div>

        <div className="flex justify-center lg:justify-start">
          <ResultsPerformance
            percentage={percentage}
            gradeText={getGradeText(percentage)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl text-foreground">Question Review</h2>
        <QuestionReviewList answers={attempt.answers} />
      </div>
    </div>
  );
}
