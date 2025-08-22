"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "~/components/ui/button";
import { AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useSelector } from "react-redux";
import AttemptHeader from "~/components/Quiz/AttemptHeader";
import AttemptNavigator from "~/components/Quiz/AttemptNavigator";
import AttemptQuestion from "~/components/Quiz/AttemptQuestion";

import { QuizAttemptLoader } from "~/components/Loaders";
import {
  useQuizData,
  useQuizAttempt,
  useQuizAnswers,
} from "~/hooks/useQuizData";

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violations, setViolations] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const MAX_VIOLATIONS = 2;

  const router = useRouter();
  const user = useSelector((state: any) => state.user.user);

  // Use React Query hooks for data fetching
  const { data: quiz, isLoading: isLoadingQuiz } = useQuizData(
    quizId as string,
    user?.id,
  );
  const { data: attempt, isLoading: isLoadingAttempt } = useQuizAttempt(
    attemptId as string,
  );
  const { data: answersData, isLoading: isLoadingAnswers } = useQuizAnswers(
    attemptId as string,
  );

  const isLoading = isLoadingQuiz || isLoadingAttempt || isLoadingAnswers;

  // Fullscreen functions
  const enterFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    try {
      // Check if document is in fullscreen mode before trying to exit
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isCurrentlyFullscreen) {
        return; // Already not in fullscreen
      }

      if (document.exitFullscreen) {
        document.exitFullscreen().catch((error) => {
          console.warn("Failed to exit fullscreen:", error);
        });
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.warn("Error exiting fullscreen:", error);
    }
  };

  // Auto-enter fullscreen when component mounts
  useEffect(() => {
    enterFullscreen();
    setIsFullscreen(true);

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);

      // If user exits fullscreen, track violation
      if (!isCurrentlyFullscreen && attempt?.status === "IN_PROGRESS") {
        const newViolations = violations + 1;
        setViolations(newViolations);
        setShowViolationWarning(true);

        if (newViolations >= MAX_VIOLATIONS) {
          toast.error(
            `Maximum violations reached (${MAX_VIOLATIONS}). Quiz will be auto-submitted.`,
          );
          // Auto-submit after a short delay
          setTimeout(() => {
            handleSubmitQuiz();
          }, 3000);
        } else {
          toast.warning(
            `Fullscreen violation ${newViolations}/${MAX_VIOLATIONS}. Please return to fullscreen mode.`,
          );
          // Hide warning after 5 seconds
          setTimeout(() => {
            setShowViolationWarning(false);
          }, 5000);
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange,
      );
      // Exit fullscreen on component unmount
      exitFullscreen();
    };
  }, []);

  // Exit fullscreen on page refresh or navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        exitFullscreen();
      } catch (error) {
        console.warn("Error exiting fullscreen on beforeunload:", error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        try {
          exitFullscreen();
        } catch (error) {
          console.warn("Error exiting fullscreen on visibility change:", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Process answers when they load
  useEffect(() => {
    if (answersData?.answers) {
      const answersMap: Record<string, number | null> = {};
      answersData.answers.forEach((answer: any) => {
        answersMap[answer.questionId] = answer.selectedOption;
      });
      setAnswers(answersMap);
    }
  }, [answersData]);

  // timer setup
  useEffect(() => {
    if (!quiz || !attempt) return;

    let timerId: NodeJS.Timeout;

    if (quiz.duration) {
      // calculate end time based on start time and duration
      const startTime = new Date(attempt.startedAt).getTime();
      const endTime = startTime + quiz.duration * 60 * 1000;
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        // time's up - submit the quiz
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
    // update local state
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));

    // send to server
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
        // Exit fullscreen before navigating
        exitFullscreen();
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

  const handleSubmitQuiz = () => {
    setShowConfirmSubmit(false);
    submitQuiz();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getCompletionPercentage = (): number => {
    if (!quiz) return 0;
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / quiz.questions.length) * 100);
  };

  if (isLoading) {
    return <QuizAttemptLoader />;
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
      {/* Violation Warning */}
      {showViolationWarning && (
        <div className="border-red-200 bg-red-50 mb-4 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-600 h-5 w-5" />
            <div>
              <h3 className="text-red-800 font-semibold">
                Fullscreen Violation Warning
              </h3>
              <p className="text-red-700 text-sm">
                You have {violations}/{MAX_VIOLATIONS} violations.
                {violations >= MAX_VIOLATIONS
                  ? " Quiz will be auto-submitted!"
                  : " Please return to fullscreen mode to continue."}
              </p>
            </div>
          </div>
        </div>
      )}

      <AttemptHeader
        title={quiz.title}
        courseName={quiz.course.name}
        questionCount={quiz.questions.length}
        timeRemaining={timeRemaining}
        formatTime={formatTime}
      />

      <div className="mb-6 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${getCompletionPercentage()}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="order-2 md:order-1">
          <AttemptNavigator
            questions={quiz.questions}
            currentIndex={currentQuestionIndex}
            answers={answers}
            onNavigate={navigateToQuestion}
            onSubmitClick={() => setShowConfirmSubmit(true)}
          />
        </div>

        <div className="order-1 md:order-2 md:col-span-3">
          <AttemptQuestion
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={quiz.questions.length}
            selectedOption={answers[currentQuestion.id]}
            onSelect={(oIndex) =>
              handleAnswerSelect(currentQuestion.id, oIndex)
            }
            onPrev={() => navigateToQuestion(currentQuestionIndex - 1)}
            onNext={() => navigateToQuestion(currentQuestionIndex + 1)}
            onFinish={() => setShowConfirmSubmit(true)}
          />

          {/* Submit Confirmation Dialog */}
          <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <DialogTitle className="text-lg text-yellow-800">
                    Ready to Submit?
                  </DialogTitle>
                </div>
                <DialogDescription className="text-yellow-700">
                  You've answered {Object.keys(answers).length} of{" "}
                  {quiz.questions.length} questions.
                  {Object.keys(answers).length < quiz.questions.length &&
                    " Some questions are still unanswered."}
                  <br />
                  <span className="text-sm text-yellow-600">
                    Once submitted, you won't be able to change your answers.
                  </span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmSubmit(false)}
                  disabled={isSubmitting}
                >
                  Continue Quiz
                </Button>
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Quiz"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
