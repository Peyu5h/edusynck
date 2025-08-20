"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { format, isPast, isFuture } from "date-fns";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Trophy, BookOpen, RefreshCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { toast } from "sonner";
import { Quiz, StudentAttempt } from "~/lib/types";
import ActiveQuizCard from "~/components/Quiz/ActiveQuizCard";
import CompletedAttemptCard from "~/components/Quiz/CompletedAttemptCard";
import { StudentQuizzesLoader } from "~/components/Loaders";
import { useActiveQuizzes, useStudentAttempts } from "~/hooks/useQuizData";
import axios from "axios";

export default function StudentQuizzesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [filteredAttempts, setFilteredAttempts] = useState<StudentAttempt[]>(
    [],
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const router = useRouter();
  const user = useSelector((state: any) => state.user.user);
  const courses = user?.classes
    ? user.classes.flatMap((cls: any) => cls.courses || [])
    : [];

  // Use React Query hooks for data fetching
  const { data: activeQuizzesData, isLoading: isLoadingQuizzes } =
    useActiveQuizzes(selectedCourseId || undefined);
  const { data: completedAttemptsData, isLoading: isLoadingAttempts } =
    useStudentAttempts(user?.id || "");

  const activeQuizzes = activeQuizzesData?.data || activeQuizzesData || [];
  const completedAttempts =
    completedAttemptsData?.data || completedAttemptsData || [];

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses]);

  useEffect(() => {
    if (user?.id) {
      // React Query handles the data fetching automatically
      // Just update the filtered results when data changes
    }
  }, [user, selectedCourseId, activeQuizzes, completedAttempts]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredQuizzes(activeQuizzes);
      setFilteredAttempts(completedAttempts);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();

      const filteredQuizResults = activeQuizzes.filter((quiz: Quiz) =>
        quiz.title.toLowerCase().includes(lowercaseQuery),
      );
      setFilteredQuizzes(filteredQuizResults);

      const filteredAttemptResults = completedAttempts.filter(
        (attempt: StudentAttempt) =>
          attempt.quiz.title.toLowerCase().includes(lowercaseQuery),
      );
      setFilteredAttempts(filteredAttemptResults);
    }
  }, [searchQuery, activeQuizzes, completedAttempts]);

  // Process quizzes with attempt status when both data sources are available
  useEffect(() => {
    if (activeQuizzes.length > 0 && completedAttempts.length > 0 && user?.id) {
      const quizzesWithAttemptStatus = activeQuizzes.map((quiz: Quiz) => {
        const attempt = completedAttempts.find(
          (a: StudentAttempt) => a.quizId === quiz.id,
        );
        return {
          ...quiz,
          hasAttempted: !!attempt,
          attemptStatus: attempt ? attempt.status : null,
        };
      });

      setFilteredQuizzes(quizzesWithAttemptStatus);
    } else if (activeQuizzes.length > 0) {
      setFilteredQuizzes(activeQuizzes);
    }
  }, [activeQuizzes, completedAttempts, user?.id]);

  // Process completed attempts
  useEffect(() => {
    if (completedAttempts.length > 0) {
      setFilteredAttempts(completedAttempts);
    }
  }, [completedAttempts]);

  const startQuizAttempt = async (quizId: string) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/${quizId}/attempt`,
        { userId: user.id },
      );

      if (response.data.id) {
        router.push(`/quizzes/${quizId}/attempt/${response.data.id}`);
      } else {
        toast.error("Failed to start quiz attempt");
      }
    } catch (error: any) {
      console.error("Error starting quiz attempt:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to start quiz attempt");
      }
    }
  };

  const getQuizStatusBadge = (quiz: Quiz) => {
    if (quiz.hasAttempted && quiz.attemptStatus === "COMPLETED") {
      return (
        <Badge variant="outline" className="bg-primary text-primary-foreground">
          Completed
        </Badge>
      );
    } else if (quiz.hasAttempted && quiz.attemptStatus === "IN_PROGRESS") {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800">
          In Progress
        </Badge>
      );
    } else if (quiz.status === "ACTIVE") {
      if (quiz.startTime && isFuture(new Date(quiz.startTime))) {
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            Upcoming
          </Badge>
        );
      }
      if (quiz.endTime && isPast(new Date(quiz.endTime))) {
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Expired
          </Badge>
        );
      }
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          Available
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800">
        {quiz.status}
      </Badge>
    );
  };

  const renderActiveQuizzes = () => {
    if (isLoadingQuizzes) {
      return <StudentQuizzesLoader />;
    }

    if (filteredQuizzes.length === 0) {
      return (
        <div>
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <BookOpen className="mb-2 h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-medium">No active quizzes</h3>
            <p className="text-sm text-muted-foreground">
              There are no quizzes available for you right now.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredQuizzes.map((quiz) => {
          const statusBadge = getQuizStatusBadge(quiz);
          const hasCompletedAttempt = completedAttempts.some(
            (attempt: StudentAttempt) =>
              attempt.quizId === quiz.id && attempt.status === "COMPLETED",
          );

          let actionVariant:
            | "start"
            | "continue"
            | "view"
            | "upcoming"
            | "expired"
            | null = null;
          let actionLabel: string | undefined = undefined;

          if (quiz.hasAttempted === true) {
            if (quiz.attemptStatus === "COMPLETED") {
              actionVariant = "view";
            } else if (quiz.attemptStatus === "IN_PROGRESS") {
              actionVariant = "continue";
            } else {
              actionVariant = "view";
            }
          } else if (hasCompletedAttempt) {
            actionVariant = "view";
          } else if (
            quiz.status === "ACTIVE" &&
            (!quiz.startTime || !isFuture(new Date(quiz.startTime))) &&
            (!quiz.endTime || !isPast(new Date(quiz.endTime)))
          ) {
            actionVariant = "start";
          } else if (quiz.startTime && isFuture(new Date(quiz.startTime))) {
            actionVariant = "upcoming";
            actionLabel = `Opens ${format(new Date(quiz.startTime), "MMM d, h:mm a")}`;
          } else if (quiz.endTime && isPast(new Date(quiz.endTime))) {
            actionVariant = "expired";
          }

          return (
            <ActiveQuizCard
              key={quiz.id}
              quiz={quiz as any}
              statusBadge={statusBadge}
              onStart={() => startQuizAttempt(quiz.id)}
              onViewResults={() => router.push(`/quizzes/${quiz.id}/results`)}
              onLeaderboard={() =>
                router.push(`/quizzes/${quiz.id}/leaderboard`)
              }
              actionVariant={actionVariant}
              actionLabel={actionLabel}
            />
          );
        })}
      </div>
    );
  };

  const renderCompletedQuizzes = () => {
    if (isLoadingAttempts) {
      return <StudentQuizzesLoader />;
    }

    if (filteredAttempts.length === 0) {
      return (
        <div className="flex h-40 flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed p-8 text-center">
          <Trophy className="mb-2 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">No completed quizzes</h3>
          <p className="text-sm text-muted-foreground">
            You haven't completed any quizzes yet.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3 overflow-hidden">
        {filteredAttempts.map((attempt) => (
          <CompletedAttemptCard
            key={attempt.id}
            attempt={attempt as any}
            onViewResults={() =>
              router.push(`/quizzes/${attempt.quizId}/results/${attempt.id}`)
            }
            onContinue={() =>
              router.push(`/quizzes/${attempt.quizId}/attempt/${attempt.id}`)
            }
          />
        ))}
      </div>
    );
  };

  const refreshQuizzes = () => {
    // React Query handles refreshing automatically
    // The data will be refetched when the component re-renders
  };

  return (
    <div className="scrollbar container mx-auto h-full overflow-y-auto rounded-xl bg-bground2 pt-8">
      <div className="">
        <h1 className="pb-4 pt-2 text-3xl font-light text-text">
          Your Quizzes
        </h1>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center">
          <Input
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />

          <Button
            variant="outline"
            size="icon"
            onClick={refreshQuizzes}
            className="ml-2 bg-accent"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>

        {courses.length > 0 && (
          <select
            className="rounded-md border p-2"
            value={selectedCourseId || ""}
            onChange={(e) => setSelectedCourseId(e.target.value || null)}
          >
            <option value="">All Courses</option>
            {courses.map((course: any) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Quizzes</TabsTrigger>
          <TabsTrigger value="completed">Completed Quizzes</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6 pb-8">
          {renderActiveQuizzes()}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6 pb-8">
          {renderCompletedQuizzes()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
