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
  // Fetch all active quizzes (not filtered by course initially)
  const {
    data: activeQuizzesData,
    isLoading: isLoadingQuizzes,
    isFetching: isFetchingQuizzes,
    refetch: refetchQuizzes,
  } = useActiveQuizzes(undefined, user?.id); // Pass userId to get attempt status

  const {
    data: completedAttemptsData,
    isLoading: isLoadingAttempts,
    isFetching: isFetchingAttempts,
    refetch: refetchAttempts,
  } = useStudentAttempts(user?.id || "");

  const activeQuizzes = activeQuizzesData?.data || activeQuizzesData || [];
  const completedAttempts =
    completedAttemptsData?.data || completedAttemptsData || [];

  // Debug logging
  console.log("Student Quizzes Debug:", {
    user: user?.id,
    selectedCourseId,
    courses: courses.map((c: any) => ({ id: c.id, name: c.name })),
    activeQuizzesData,
    activeQuizzes: activeQuizzes.length,
    activeQuizzesDetails: activeQuizzes.map((q: any) => ({
      id: q.id,
      title: q.title,
      courseId: q.courseId,
      courseName: q.course?.name,
      status: q.status,
    })),
  });

  // Combined loading state
  const isLoading = isLoadingQuizzes || isLoadingAttempts;
  const isFetching = isFetchingQuizzes || isFetchingAttempts;

  // Refresh function to refetch both data sources
  const handleRefresh = async () => {
    try {
      await Promise.all([refetchQuizzes(), refetchAttempts()]);
      toast.success("Data refreshed successfully!");
    } catch (error) {
      toast.error("Failed to refresh data");
    }
  };

  // Don't auto-select a course - let students see all their quizzes by default
  // useEffect(() => {
  //   if (courses.length > 0 && !selectedCourseId) {
  //     setSelectedCourseId(courses[0].id);
  //   }
  // }, [courses]);

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
    if (activeQuizzes.length > 0) {
      let processedQuizzes = activeQuizzes;

      // Add attempt status if available
      if (completedAttempts.length > 0 && user?.id) {
        processedQuizzes = activeQuizzes.map((quiz: Quiz) => {
          const attempt = completedAttempts.find(
            (a: StudentAttempt) => a.quizId === quiz.id,
          );
          return {
            ...quiz,
            hasAttempted: !!attempt,
            attemptStatus: attempt ? attempt.status : null,
          };
        });
      }

      // Filter by selected course if one is selected (frontend filtering for UI)
      if (selectedCourseId) {
        processedQuizzes = processedQuizzes.filter(
          (quiz: Quiz) => quiz.course.id === selectedCourseId,
        );
      }

      // Filter by search query
      if (searchQuery.trim()) {
        processedQuizzes = processedQuizzes.filter(
          (quiz: Quiz) =>
            quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            quiz.description?.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      setFilteredQuizzes(processedQuizzes);
    } else {
      setFilteredQuizzes([]);
    }
  }, [
    activeQuizzes,
    completedAttempts,
    user?.id,
    selectedCourseId,
    searchQuery,
  ]);

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
    if (isLoadingQuizzes && !isFetchingQuizzes) {
      return <StudentQuizzesLoader />;
    }

    if (filteredQuizzes.length === 0) {
      return (
        <div className={`${isFetchingQuizzes ? "opacity-50" : ""}`}>
          <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
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
      <div
        className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 ${isFetchingQuizzes ? "opacity-50" : ""}`}
      >
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
    // Show subtle loading indicator when refetching (not initial load)
    if (isLoadingAttempts && !isFetchingAttempts) {
      return <h1>Loading</h1>;
    }

    if (filteredAttempts.length === 0) {
      return (
        <div
          className={`flex h-40 flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed p-8 text-center ${isFetchingAttempts ? "opacity-50" : ""}`}
        >
          <Trophy className="mb-2 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">No completed quizzes</h3>
          <p className="text-sm text-muted-foreground">
            You haven't completed any quizzes yet.
          </p>
        </div>
      );
    }

    return (
      <div
        className={`space-y-3 overflow-hidden ${isFetchingAttempts ? "opacity-50" : ""}`}
      >
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
    handleRefresh();
  };

  if (isLoading) {
    return <StudentQuizzesLoader />;
  }

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
            disabled={isFetching}
            className="ml-2 bg-accent"
          >
            <RefreshCcw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
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
