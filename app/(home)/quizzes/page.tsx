"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { format, isPast, isFuture } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Search,
  Timer,
  Calendar,
  Trophy,
  Clock,
  BookOpen,
  Loader2,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { toast } from "sonner";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  startTime: string | null;
  endTime: string | null;
  duration: number | null;
  createdAt: string;
  course: {
    id: string;
    name: string;
  };
  _count: {
    questions: number;
  };
  hasAttempted?: boolean;
  attemptStatus?: string | null;
}

interface StudentAttempt {
  id: string;
  quizId: string;
  startedAt: string;
  completedAt: string | null;
  score: number;
  status: string;
  quiz: {
    title: string;
    course: {
      name: string;
    };
  };
}

export default function StudentQuizzesPage() {
  const [activeQuizzes, setActiveQuizzes] = useState<Quiz[]>([]);
  const [completedAttempts, setCompletedAttempts] = useState<StudentAttempt[]>(
    [],
  );
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(true);
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

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses]);

  useEffect(() => {
    if (user?.id) {
      fetchActiveQuizzes();
      fetchStudentAttempts(user.id);
    }
  }, [user, selectedCourseId]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredQuizzes(activeQuizzes);
      setFilteredAttempts(completedAttempts);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();

      const filteredQuizResults = activeQuizzes.filter((quiz) =>
        quiz.title.toLowerCase().includes(lowercaseQuery),
      );
      setFilteredQuizzes(filteredQuizResults);

      const filteredAttemptResults = completedAttempts.filter((attempt) =>
        attempt.quiz.title.toLowerCase().includes(lowercaseQuery),
      );
      setFilteredAttempts(filteredAttemptResults);
    }
  }, [searchQuery, activeQuizzes, completedAttempts]);

  const fetchActiveQuizzes = async () => {
    setIsLoadingQuizzes(true);
    try {
      // Make two separate API calls to ensure we get all quizzes
      // 1. Get all active quizzes for the course without filtering by user attempts
      let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/active`;
      const params = new URLSearchParams();

      if (selectedCourseId) {
        params.append("courseId", selectedCourseId);
      }

      // Don't include userId in the params to get ALL active quizzes
      const response = await axios.get(
        url + (params.toString() ? `?${params.toString()}` : ""),
      );

      console.log("All active quizzes response:", response.data);

      if (response.data.success) {
        const allQuizzes = response.data.data || [];

        // 2. Get user's attempts to mark which quizzes have been attempted
        if (user?.id) {
          try {
            const attemptsResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/student/${user.id}/attempts`,
            );

            if (attemptsResponse.data.success) {
              const attempts = attemptsResponse.data.data || [];

              const quizzesWithAttemptStatus = allQuizzes.map((quiz: any) => {
                const attempt = attempts.find((a: any) => a.quizId === quiz.id);
                return {
                  ...quiz,
                  hasAttempted: !!attempt,
                  attemptStatus: attempt ? attempt.status : null,
                };
              });

              console.log(
                "Quizzes with attempt status:",
                quizzesWithAttemptStatus,
              );
              setActiveQuizzes(quizzesWithAttemptStatus);
              setFilteredQuizzes(quizzesWithAttemptStatus);
            }
          } catch (error) {
            console.error("Error fetching attempts:", error);
            // If attempt fetching fails, still show all quizzes
            setActiveQuizzes(allQuizzes);
            setFilteredQuizzes(allQuizzes);
          }
        } else {
          // No user ID, just show all quizzes
          setActiveQuizzes(allQuizzes);
          setFilteredQuizzes(allQuizzes);
        }
      } else {
        toast.error("Failed to fetch quizzes");
      }
    } catch (error) {
      console.error("Error fetching active quizzes:", error);
      toast.error("Failed to load quizzes");
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  const fetchStudentAttempts = async (userId: string) => {
    setIsLoadingAttempts(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/student/${userId}/attempts`,
      );

      if (response.data.success) {
        const attempts = response.data.data;
        setCompletedAttempts(attempts);
        setFilteredAttempts(attempts);
      } else {
        toast.error("Failed to fetch your quiz attempts");
      }
    } catch (error) {
      console.error("Error fetching student attempts:", error);
      toast.error("Failed to load your quiz history");
    } finally {
      setIsLoadingAttempts(false);
    }
  };

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
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
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

  const renderQuizActionButton = (quiz: Quiz) => {
    console.log("Quiz action button for quiz:", quiz.id, quiz.title);
    console.log(
      "hasAttempted:",
      quiz.hasAttempted,
      "attemptStatus:",
      quiz.attemptStatus,
    );

    if (quiz.hasAttempted === true) {
      console.log("Quiz has been attempted");

      if (quiz.attemptStatus === "COMPLETED") {
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/quizzes/${quiz.id}/results`)}
            >
              View Results
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/quizzes/${quiz.id}/leaderboard`)}
            >
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </Button>
          </div>
        );
      } else if (quiz.attemptStatus === "IN_PROGRESS") {
        return (
          <Button onClick={() => router.push(`/quizzes/${quiz.id}/continue`)}>
            Continue Quiz
          </Button>
        );
      } else {
        return (
          <Button
            variant="outline"
            onClick={() => router.push(`/quizzes/${quiz.id}/results`)}
          >
            View Results
          </Button>
        );
      }
    }

    const hasCompletedAttempt = completedAttempts.some(
      (attempt) => attempt.quizId === quiz.id && attempt.status === "COMPLETED",
    );

    if (hasCompletedAttempt) {
      console.log("Quiz has completed attempt in completedAttempts array");
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/quizzes/${quiz.id}/results`)}
          >
            View Results
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/quizzes/${quiz.id}/leaderboard`)}
          >
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard
          </Button>
        </div>
      );
    }

    if (
      quiz.status === "ACTIVE" &&
      (!quiz.startTime || !isFuture(new Date(quiz.startTime))) &&
      (!quiz.endTime || !isPast(new Date(quiz.endTime)))
    ) {
      return (
        <Button onClick={() => startQuizAttempt(quiz.id)}>Start Quiz</Button>
      );
    } else if (quiz.startTime && isFuture(new Date(quiz.startTime))) {
      return (
        <Button disabled>
          Opens {format(new Date(quiz.startTime), "MMM d, h:mm a")}
        </Button>
      );
    } else if (quiz.endTime && isPast(new Date(quiz.endTime))) {
      return (
        <Button variant="outline" disabled>
          Expired
        </Button>
      );
    }

    return null;
  };

  const renderActiveQuizzes = () => {
    if (isLoadingQuizzes) {
      return (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (filteredQuizzes.length === 0) {
      return (
        <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <BookOpen className="mb-2 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">No active quizzes</h3>
          <p className="text-sm text-muted-foreground">
            There are no quizzes available for you right now.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                {getQuizStatusBadge(quiz)}
              </div>
              <CardDescription className="line-clamp-2">
                {quiz.description || "No description provided"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {quiz.course.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {quiz._count.questions} questions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {quiz.duration
                      ? `${quiz.duration} minutes`
                      : "No time limit"}
                  </span>
                </div>
                {quiz.endTime && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Ends: {format(new Date(quiz.endTime), "MMM d, h:mm a")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>{renderQuizActionButton(quiz)}</CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  const renderCompletedQuizzes = () => {
    if (isLoadingAttempts) {
      return (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (filteredAttempts.length === 0) {
      return (
        <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <Trophy className="mb-2 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">No completed quizzes</h3>
          <p className="text-sm text-muted-foreground">
            You haven't completed any quizzes yet.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredAttempts.map((attempt) => (
          <Card key={attempt.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-6">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {attempt.quiz.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`${
                      attempt.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {attempt.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {attempt.quiz.course.name}
                </p>
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(attempt.startedAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  {attempt.completedAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(attempt.completedAt), "h:mm a")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center bg-muted p-6 text-center md:w-1/4">
                {attempt.status === "COMPLETED" ? (
                  <>
                    <div className="text-3xl font-bold">{attempt.score}</div>
                    <div className="text-sm text-muted-foreground">Score</div>
                    <div className="mt-4 flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/quizzes/${attempt.quizId}/results/${attempt.id}`,
                          )
                        }
                      >
                        View Results
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="mb-2 h-6 w-6 text-yellow-500" />
                    <div className="text-sm">Incomplete</div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-4"
                      onClick={() =>
                        router.push(
                          `/quizzes/${attempt.quizId}/attempt/${attempt.id}`,
                        )
                      }
                    >
                      Continue
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const refreshQuizzes = () => {
    if (user?.id) {
      fetchActiveQuizzes();
      fetchStudentAttempts(user.id);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Quizzes</h1>
        <p className="text-muted-foreground">
          Take quizzes assigned to your courses
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={refreshQuizzes}
            className="ml-2"
          >
            Refresh
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

        <TabsContent value="active" className="space-y-6">
          {renderActiveQuizzes()}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {renderCompletedQuizzes()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
