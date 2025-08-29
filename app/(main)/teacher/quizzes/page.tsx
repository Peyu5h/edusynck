"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Button } from "~/components/ui/button";
import {
  PlusIcon,
  Search,
  Timer,
  FileCheck,
  Calendar,
  RefreshCcw,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useTeacherQuizzes } from "~/hooks/useQuizData";
import { useCoursesForClasses } from "~/hooks/useGetCourses";
import { StudentQuizzesLoader } from "~/components/Loaders";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  startTime: string | null;
  endTime: string | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
  isAiGenerated: boolean;
  _count: {
    questions: number;
    studentAttempts: number;
  };
}

export default function QuizzesPage() {
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const user = useSelector((state: any) => state.user.user);
  const teacherClassIds: string[] = useMemo(
    () =>
      user?.taughtClasses
        ? user.taughtClasses.map((cls: any) => cls.id).filter(Boolean)
        : [],
    [user?.taughtClasses],
  );

  const { data: fetchedCourses = [], isLoading: isLoadingCourses } =
    useCoursesForClasses(teacherClassIds);

  const {
    data: quizzesData,
    isLoading,
    isFetching,
    refetch: refetchQuizzes,
  } = useTeacherQuizzes(selectedCourseId || "");

  const quizzes = quizzesData?.success ? quizzesData.data : quizzesData || [];

  useEffect(() => {
    if (!selectedCourseId && fetchedCourses.length > 0) {
      setSelectedCourseId(fetchedCourses[0].id);
    }
  }, [fetchedCourses, selectedCourseId]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredQuizzes(quizzes);
    } else {
      const filtered = quizzes.filter((quiz: any) =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredQuizzes(filtered);
    }
  }, [searchQuery, quizzes]);

  const handleRefresh = () => {
    refetchQuizzes();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Active
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Completed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="scrollbar container mx-auto h-full overflow-y-auto rounded-xl bg-bground2 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="pb-4 pt-2 text-3xl font-light text-text">Quizzes</h1>
        <Button asChild className="flex items-center gap-2">
          <Link href="/teacher/quizzes/create">
            <PlusIcon className="h-4 w-4" />
            Create Quiz
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search quizzes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {isLoadingCourses ? null : fetchedCourses.length > 0 ? (
            <select
              className="rounded-md border p-2"
              value={selectedCourseId || ""}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              {fetchedCourses.map((course: any) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          ) : null}

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isFetching}
            className="bg-accent"
          >
            <RefreshCcw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <StudentQuizzesLoader />
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderQuizzes(filteredQuizzes)}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {renderQuizzes(
              filteredQuizzes.filter((quiz) => quiz.status === "ACTIVE"),
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {renderQuizzes(
              filteredQuizzes.filter((quiz) => quiz.status === "COMPLETED"),
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );

  function renderQuizzes(quizzes: Quiz[]) {
    if (quizzes.length === 0) {
      return (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div>
            <p className="text-lg font-medium">No quizzes found</p>
            <p className="text-sm text-muted-foreground">
              Create a new quiz to get started
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 pb-8 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <Link key={quiz.id} href={`/teacher/quizzes/${quiz.id}/leaderboard`}>
            <Card className="h-full cursor-pointer transition-shadow hover:border-gray-600 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                  {getStatusBadge(quiz.status)}
                </div>
                <CardDescription className="line-clamp-2">
                  {quiz.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
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
                  {quiz.startTime && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(quiz.startTime), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-md text-muted-foreground">
                    {quiz._count.studentAttempts} attempts
                  </span>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    );
  }
}
